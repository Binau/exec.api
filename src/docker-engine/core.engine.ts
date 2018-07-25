import {DockerClient} from "./docker.client";
import {EngineConf} from "./conf/engine.conf";
import {ImageBean} from "./bean/image.bean";
import {FileUtils} from "../tool/file.utils";
import {ImageConf} from "./conf/image.conf";
import * as Fs from "fs";
import {Pack} from 'tar';
import {StreamUtils} from "../tool/stream.utils";
import {FileToInject} from "./api/exec.ws.api";

export class CoreEngine {

    public dockerClient: DockerClient;

    public debug() : CoreEngine {
        this.dockerClient.debug();
        return this;
    }

    private constructor(
        public engineConf: EngineConf
    ) {
        // Creation d'un client vers le docker machine local
        this.dockerClient = new DockerClient(engineConf.host, engineConf.port);
        // Configuration des certificats
        this.dockerClient
            //.debug()
            .activeSsl('key.pem', 'cert.pem', 'ca.pem', engineConf.sslRoot);
    }

    /*
    ********************** LOAD
     */

    public static async loadEngine(confPath: string): Promise<CoreEngine> {
        let engineConf = await FileUtils.loadConf<EngineConf>(confPath);
        return new CoreEngine(engineConf);
    }

    public async loadImgConf(imgId) : Promise<ImageConf> {
        let rootImgDir = `${this.engineConf.dockerImgsRoot}/${imgId}`;
        // Recuperation de la conf
        return await FileUtils.loadConf<ImageConf>(`${rootImgDir}/conf.json`);
    }

    public async loadImgBean(imageName: string): Promise<ImageBean> {
        let rootImgDir = `${this.engineConf.dockerImgsRoot}/${imageName}`;

        try {
            // Recuperation de la conf
            let conf = await this.loadImgConf(imageName);

            let imgBean: ImageBean = new ImageBean();
            imgBean.name = imageName;
            imgBean.dirPath = rootImgDir;
            imgBean.conf = conf;

            return imgBean;

        } catch (e) {
            // Pas d'acces sur cette image
            console.log(e);
            throw e;
        }
    }

    /*
    ************************ IMAGES
     */

    public async buildFromTar(imgName: string, tarPath: string): Promise<void> {
        return this.dockerClient.build(imgName, Fs.readFileSync(tarPath));
    }

    public async buildFromDir(img: ImageBean): Promise<void> {

        let imgDir = `${this.engineConf.dockerImgsRoot}/${img.name}/image`;

        let pack = new Pack({cwd: imgDir});

        let filesPromise: string[] = await Fs.promises.readdir(imgDir);

        filesPromise.forEach((f) => {
            pack.write(f);
        });
        pack.end();

        let val = await StreamUtils.readToString(pack);

        // build de l'image
        return this.dockerClient.build(img.fullName, val);
    }



    public async getOrBuildImg(idImage: string): Promise<ImageBean> {

        let imgBean: ImageBean = await this.loadImgBean(idImage);
        let imageId : string = await this.dockerClient.getImage(imgBean.fullName);
        if (!imageId) {
            await this.buildFromDir(imgBean);
        }
        return imgBean;

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