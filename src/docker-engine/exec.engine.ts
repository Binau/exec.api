import {DockerClient} from './docker.client';
import {ImageBean} from '../bean/image.bean';
import {CoreEngine, FileToInject} from './core.engine';
import {PromiseUtils} from '../tool/promise.utils';
import {ExecLog} from '../bean/api/test.ws.api';


export class BuildParam {
    // Id de l'image
    idImage: string;
    // Codes à injecter
    files: FileToInject[];

}

export class ExecRequest {
    params?: any;
    timeout?: number;
    logCallBack?: (log: ExecLog) => void
}


export class ExecEngine {

    private idContainer: string;
    private dockerClient: DockerClient;
    private _debug = false;

    private constructor(private coreEngine: CoreEngine) {
        this.dockerClient = this.coreEngine.dockerClient
    }

    public static async create(coreEngine: CoreEngine, param: BuildParam): Promise<ExecEngine> {
        let execEngine = new ExecEngine(coreEngine);
        await execEngine.build(param);
        return execEngine;
    }


    /**
     * Creer et démarre un container et inject les fichiers fournis
     * @param {BuildParam} param
     * @returns {Promise<void>}
     */
    private async build(param: BuildParam) {

        // Recuperation/ creation de l'image
        let imgBean: ImageBean = await this.coreEngine.getOrBuildImg(param.idImage);

        // Creation + demarrage container
        this.idContainer = await this.coreEngine.startContainer(imgBean);

        // Ecriture de chacun des fichiers
        this.coreEngine.writeFiles(this.idContainer, param.files);
    }

    public debug() {
        this._debug = true;
    }

    public async run(req?: ExecRequest): Promise<void> {

        // Preparation des parametres par defaut
        req = req || {};
        req.timeout = req.timeout || 5000; // 5s par defaut

        // Lancement de l'execution
        let idExec = await this.dockerClient.createExec(this.idContainer, ['./run.sh', JSON.stringify(req.params)]);

        try {
            await PromiseUtils.timeout(
                this.dockerClient.startExec(
                    idExec,
                    (l) => {
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
            else throw e;
        }

    }

    public async stop(): Promise<void> {

        // Stop + suppression après timeout
        await this.dockerClient.stopContainer(this.idContainer);
        await this.dockerClient.deleteContainer(this.idContainer);

        return;
    }


}