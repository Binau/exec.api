import {HttpContext, WsServer} from 'http-typescript';
import {CoreEngine} from '../../docker-engine/core.engine';
import {ExecEngine} from "../../docker-engine/exec.engine";
import {ExecParam} from "../../docker-engine/api/exec.api";
import {AppContext} from "../../common/app.context";
import {Level, Logger} from "../../common/log.service";


export class ExecWs extends WsServer {

    private coreEngine: CoreEngine;
    private logger: Console;

    public constructor() {
        super();
        this.coreEngine = AppContext.instance.dockerContext.coreEngine;
        this.logger = AppContext.instance.logService.getLogger('Http', Level.INFO);
    }

    private logHeader(): string {
        return `(WS ${this.path})`;
    }

    protected async onMessage(execPrm: ExecParam): Promise<void> {

        this.logger.info(`${this.logHeader()} Initialisation de l'engine et execution`);
        this.logger.debug(`${this.logHeader()} Execution avec les Parametres : `, execPrm);

        let execEngine: ExecEngine;
        try {
            execEngine = await ExecEngine.create(this.coreEngine, execPrm,
                AppContext.instance.logService.getLogger('ExecEngine', Level.DEBUG));
        } catch (e) {
            this.logger.error(`${this.logHeader()} Erreur lors de l'initialisation de l'engine`);
            this.sendError(e);
            this.close();
            return;
        }

        try {
            let nbLogs = 0;
            await execEngine.run({
                logCallBack: (l) => {
                    this.logger.debug(`${this.logHeader()} Log d'execution : `, l);
                    this.send(l);
                    nbLogs++;
                }
            });
            this.logger.info(`${this.logHeader()} Fin de l'execution ${nbLogs} log(s) retourné(s)`);
        } catch (e) {
            this.logger.error(`${this.logHeader()} Fin de l'execution en erreur : `, e);
        } finally {
            this.close();
            execEngine.stop();
        }
    }

    private sendError(message: string, name: string = 'Error') {
        this.send({
            wsError: true,
            name: name,
            message: message
        })
    }
}
