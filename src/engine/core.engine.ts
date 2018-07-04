import {DockerClient} from "./docker/docker.client";
import {EngineConf} from "../bean/conf/engine.conf";
import {ImageBean} from "../bean/image.bean";
import {FileUtils} from "../tool/file.utils";
import {ImageConf} from "../bean/conf/image.conf";


export class FileToInject {
    filePath: string;
    code: string;
}

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


    public static async loadEngine(confPath: string): Promise<CoreEngine> {
        let engineConf = await FileUtils.loadConf<EngineConf>(confPath);
        return new CoreEngine(engineConf);
    }

    public async loadImgConf(imageName: string): Promise<ImageBean> {
        let rootImgDir = `${this.engineConf.dockerImgsRoot}/${imageName}`;

        try {
            // Recuperation de la conf
            let conf = await FileUtils.loadConf<ImageConf>(`${rootImgDir}/conf.json`);

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

    public async buildImg(img: ImageBean): Promise<void> {
        let imgDir = `${this.engineConf.dockerImgsRoot}/${img.name}/image`;
        return await this.dockerClient.buildFromDir(img.fullName, imgDir);
    }

    public async getOrBuildImg(idImage: string): Promise<ImageBean> {

        let imgBean: ImageBean = await this.loadImgConf(idImage);
        let image = await this.dockerClient.getImage(imgBean.fullName);
        if (!image.Id) {
            await this.buildImg(imgBean);
        }
        return imgBean;

    }

    public async startContainer(imgBean: ImageBean): Promise<string> {
        let idContainer = await this.dockerClient.createContainers(imgBean.fullName);
        await this.dockerClient.startContainer(idContainer);
        return idContainer;
    }


    /* UTILISATION DE SCRIPTS SPECIFIQUES */

    public async writeFile(idContainer: string, file: FileToInject): Promise<void> {
        let idExec = await this.dockerClient.createExec(
            idContainer,
            ['./writeFile.sh', file.code, file.filePath]);
        await this.dockerClient.startExec(idExec);
    }

}