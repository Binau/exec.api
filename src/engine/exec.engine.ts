import {DockerClient} from "../docker/docker.client";
import {ImageBean} from "../bean/image.bean";
import {CoreEngine, FileToInject} from "./core.engine";
import {PromiseUtils} from "../tool/promise.utils";


export class BuildParam {
    // Id de l'image
    idImage: string;
    // Codes à injecter
    files: FileToInject[];

}

export class ExecRequest {
    in?: any;
    timeout?: number;
    logCallBack?: (log: ExecLog) => void
}

export class ExecLog {
    isInfo?: true;
    isError?: true;

    message?: string;
}


export class ExecEngine {

    private idContainer: string;
    private dockerClient: DockerClient;

    private constructor(
        private coreEngine: CoreEngine
    ) {
        this.dockerClient = this.coreEngine.dockerClient
    }


    public static async create(coreEngine: CoreEngine, param: BuildParam): Promise<ExecEngine> {
        let execEngine = new ExecEngine(coreEngine);
        await execEngine.build(param);
        return execEngine;
    }


    private async build(param: BuildParam) {

        // Recuperation/ creation de l'image
        let imgBean: ImageBean = await this.coreEngine.getOrBuildImg(param.idImage);

        // Creation + demarrage container
        this.idContainer = await this.coreEngine.startContainer(imgBean);

        // Ecriture de chacun des fichiers
        for (let file of param.files) {
            this.coreEngine.writeFile(this.idContainer, file);
        }
    }

    public async run(req?: ExecRequest): Promise<void> {

        // Preparation des parametres par defaut
        req = req || {};
        req.timeout = req.timeout || 5000; // 5s par defaut

        let idExec = await this.dockerClient.createExec(this.idContainer, ['./run.sh', JSON.stringify(req.in)]);

        try {
            await PromiseUtils.timeout(this.dockerClient.startExec(idExec, (l) => {

                if (!l || l === '\n') return;

                try {
                    let testResp: ExecLog = JSON.parse(l);

                    let isLog = (testResp.isError || testResp.isInfo);
                    if (isLog) req.logCallBack(testResp);

                } catch (e) {
                    // La reponse n'est pas en JSON, c'est une erreur
                    req.logCallBack && req.logCallBack({
                        isError: true,
                        message: l
                    });
                }

            }), req.timeout);
        } catch (e) {
            if (e == PromiseUtils.TIMEOUT) {
                this.stop();
                req.logCallBack && req.logCallBack({
                    isError: true,
                    message: 'Timeout'
                });
            }
        }

    }

    public async stop(): Promise<void> {

        // Stop + suppression après timeout
        await this.dockerClient.stopContainer(this.idContainer);
        await this.dockerClient.deleteContainer(this.idContainer);

        return;
    }


}