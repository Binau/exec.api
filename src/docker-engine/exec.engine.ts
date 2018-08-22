import {DockerClient} from './docker.client';
import {ImageInfosBean} from './bean/imageInfosBean';
import {CoreEngine} from './core.engine';
import {PromiseUtils} from '../tool/promise.utils';
import {ExecParam, ExecLog} from "./api/exec.api";
import {AppContext} from "../common/app.context";
import {Level} from "../common/log.service";


export class ExecRequest {
    params?: any;
    timeout?: number;
    logCallBack?: (log: ExecLog) => void
}

export class ExecEngine {

    public static MAX_EXEC_FILES: number = 30;
    public logger: Console = console;

    private idContainer: string;

    private get dockerClient(): DockerClient {
        return this.coreEngine.dockerClient;
    }

    private constructor(
        private coreEngine: CoreEngine
    ) {
    }

    public static async create(coreEngine: CoreEngine, param: ExecParam, logger: Console): Promise<ExecEngine> {
        let execEngine = new ExecEngine(coreEngine);
        execEngine.logger = logger;
        await execEngine.build(param);
        return execEngine;
    }


    /**
     * Creer et démarre un container et inject les fichiers fournis
     * @param {ExecParam} param
     * @returns {Promise<void>}
     */
    private async build(param: ExecParam): Promise<void> {

        // Recuperation/ creation de l'image
        let imgBean: ImageInfosBean = await this.coreEngine.getOrBuildImg(param.idImage);

        // Vérifications
        // Fichier de boot
        if (!param || !param.files || param.files.length === 0 ||
            !param.files.some(f => f.filePath === imgBean.conf.bootFileName)
        ) {
            let errorMessage = `Le fichier de boot ${imgBean.conf.bootFileName} est obligatoire.`;
            this.logger.error(errorMessage);
            throw errorMessage;
        }
        // Max fichers
        if (param.files.length > ExecEngine.MAX_EXEC_FILES) {
            let errorMessage = `Vous ne pouvez pas utiliser plus de ${ExecEngine.MAX_EXEC_FILES} fichiers.`;
            this.logger.error(errorMessage);
            throw errorMessage;
        }

        // Creation + demarrage container
        this.idContainer = await this.coreEngine.startContainer(imgBean);

        // Ecriture de chacun des fichiers
        await this.coreEngine.writeFiles(this.idContainer, param.files, imgBean.conf.srcDir);

    }

    public async run(req?: ExecRequest): Promise<void> {

        // Lancement du build
        await this.startScript('bin/buildWrapper.sh', req);

        // Lancement de l'execution
        await this.startScript('bin/runWrapper.sh', req);
    }

    public async stop(): Promise<void> {
        await this.coreEngine.stopContainer(this.idContainer);
    }

    private async startScript(script: string, req?: ExecRequest): Promise<void> {

        // Preparation des parametres par defaut
        req = req || {};
        req.timeout = req.timeout || 3000;

        // Lancement de l'execution
        let idExec = await this.dockerClient.createExec(
            this.idContainer,
            [script, JSON.stringify(req.params)]
        );

        try {

            let promiseExec: Promise<void> = this.dockerClient.startExec(
                idExec,
                // Traitement des logs
                (logs) => {
                    // Mapping des sorties en execLog
                    let execLogs = this.mapExecLogsToExecLogs(logs, '#L#');

                    // Si le log est vide, on le prend pas en compte
                    if (!execLogs) return;
                    // Appel du callback avec l'execLog
                    execLogs.forEach(el => req.logCallBack(el));

                });

            // Attend l'execution avec un timeout
            await PromiseUtils.timeout(promiseExec, req.timeout);
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

    private mapExecLogsToExecLogs(logs: string, prefix: string): ExecLog[] {

        if (!logs || !prefix) return;
        let execLogs: ExecLog[];

        // Suppression du dernier saut de ligne
        if (logs.endsWith('\n')) logs = logs.substr(0, logs.length - 1);

        // Traduit chacune des ligne en execLog( suivant prefix)
        execLogs = logs.split('\n').map<ExecLog>(
            (l) => {
                let execLog: ExecLog;
                if (l.startsWith(prefix)) {
                    l = l.substr(prefix.length);
                    execLog = {
                        isInfo: true,
                        message: l
                    };
                } else {
                    execLog = {
                        isError: true,
                        message: l
                    };
                }
                return execLog;
            }
        );
        return execLogs;
    }


}