import {DockerClient} from "./docker.client";
import {EngineConf} from "./conf/engine.conf";
import {ImageBean} from "./bean/image.bean";
import {FileUtils} from "../tool/file.utils";
import {ImageConf} from "./conf/image.conf";
import * as Fs from "fs";
import {Pack} from 'tar';
import {StreamUtils} from "../tool/stream.utils";
import {FileToInject} from "./api/exec.ws.api";
import {AppContext} from "../common/app.context";
import {DockerContext} from "./bean/docker.context";
import {Level, Logger} from "../common/log.service";

export class CoreEngine {

    public dockerClient: DockerClient;
    private logSrv: Logger;

    private constructor(
        public engineConf: EngineConf
    ) {
        this.logSrv = AppContext.instance.logService.getLogger('Docker-engine', Level.DEBUG);

        // Creation d'un client vers le docker machine local
        this.logSrv.debug(`Chargement du client docker pour ${engineConf.host}:${engineConf.port}`);
        this.dockerClient = new DockerClient(engineConf.host, engineConf.port);

        // Configuration des certificats
        this.logSrv.debug(`Chargement des certificats docker depuis ${engineConf.sslRoot}`);
        this.dockerClient
            .activeSsl('key.pem', 'cert.pem', 'ca.pem', engineConf.sslRoot);

    }

    /*
    ********************** LOAD
     */
    public static async load(): Promise<boolean> {
        let logSrv = AppContext.instance.logService.getLogger('Docker-engine');
        logSrv.log('Chargement du coreEngine...');

        let appContext: AppContext = AppContext.instance;
        // Initialisation du context
        appContext.dockerContext = new DockerContext();

        // Chargement de la conf
        try {
            logSrv.log('Chargement de la conf...');
            let engineConf = await FileUtils.loadConf<EngineConf>(appContext.appConf.confDocker);
            appContext.dockerContext.coreEngine = new CoreEngine(engineConf);
        } catch (e) {
            logSrv.error('Erreur au chargement de la conf', e);
            return false;
        }

        return true;
    }

    public async loadImgConf(imgId): Promise<ImageConf> {

        let imgConf = `${this.engineConf.dockerImgsRoot}/${imgId}/conf.json`;
        this.logSrv.info(`Chargement de la configuration de l'image : ${imgConf}`);

        // Recuperation de la conf
        try {
            return await FileUtils.loadConf<ImageConf>(imgConf);
        } catch (e) {
            this.logSrv.error(`Erreur au chargement de la configuration de l'image : ${imgConf}`, e);
            return null;
        }
    }

    public async loadImgBean(imageName: string): Promise<ImageBean> {
        this.logSrv.debug(`Récuperation des infos pour l'image : ${imageName}`);
        let rootImgDir = `${this.engineConf.dockerImgsRoot}/${imageName}`;

        // Recuperation de la conf
        let conf = await this.loadImgConf(imageName);
        if (conf == null) return null;

        let imgBean: ImageBean = new ImageBean();
        imgBean.name = imageName;
        imgBean.dirPath = rootImgDir;
        imgBean.conf = conf;

        return imgBean;

    }

    /*
    ************************ IMAGES
     */

    public async buildFromTar(imgName: string, tarPath: string): Promise<void> {
        return this.dockerClient.build(imgName, Fs.readFileSync(tarPath));
    }

    public async buildFromDir(img: ImageBean): Promise<void> {

        this.logSrv.info(`Création de l'image : ${img.fullName}`);
        let imgDir = `${img.dirPath}/image`;

        this.logSrv.debug(`Préparation de l'archive tar`);
        let pack = new Pack({cwd: imgDir});
        let filesPromise: string[] = await Fs.promises.readdir(imgDir);
        filesPromise.forEach((f) => {
            pack.write(f);
        });
        pack.end();

        let val = await StreamUtils.readToString(pack);

        // build de l'image
        this.logSrv.debug(`Appel du service de création docker`);
        return this.dockerClient.build(img.fullName, val);
    }

    public async getOrBuildImg(idImage: string): Promise<ImageBean> {

        this.logSrv.info(`Recherche de l'image : ${idImage}`);
        let imgBean: ImageBean = await this.loadImgBean(idImage);
        if (!imgBean) return null;

        this.logSrv.info(`Récuperation de l'image docker ${imgBean.fullName}`);
        try {
            let imageId: string = await this.dockerClient.getImage(imgBean.fullName);
            if (!imageId) {
                this.logSrv.info(`L'image ${imgBean.fullName} n'existe pas, elle sera créée`);
                await this.buildFromDir(imgBean);
            }
            return imgBean;
        } catch (e) {
            this.logSrv.error(`L'image ${imgBean.fullName} n'a pas pu être récupérée/créée auprès de docker`, e);
            return null;
        }

    }

    /*
    ***************************** CONTAINERS
     */

    public async startContainer(imgBean: ImageBean): Promise<string> {
        let idContainer = await this.dockerClient.createContainers(imgBean.fullName);
        await this.dockerClient.startContainer(idContainer);
        return idContainer;
    }


    /**
     * Creer une execution permettant d'ecrire un fichier dans le container docker
     * @param {string} idContainer
     * @param {FileToInject} file
     * @returns {Promise<void>}
     */
    public async writeFile(idContainer: string, file: FileToInject): Promise<void> {
        let idExec = await this.dockerClient.createExec(
            idContainer,
            ['./writeFile.sh', file.code, file.filePath]);
        await this.dockerClient.startExec(idExec);
    }

    /**
     * Creer une execution permettant d'ecrire des fichier dans le container docker
     * @param {string} idContainer
     * @param {FileToInject} file
     * @returns {Promise<void>}
     */
    public async writeFiles(idContainer: string, files: FileToInject[]): Promise<void> {
        for (let file of files) {
            this.writeFile(idContainer, file);
        }
    }

}