import {WsServer} from 'http-typescript';
import {CoreEngine} from '../../docker-engine/core.engine';
import {ExecEngine} from "../../docker-engine/exec.engine";
import {ExecParam} from "../../docker-engine/api/exec.ws.api";
import {AppContext} from "../../common/app.context";
import {Level, Logger} from "../../common/log.service";


export class ExecWs extends WsServer {

    private coreEngine: CoreEngine;
    private logger: Logger;

    public constructor() {
        super();
        this.coreEngine = AppContext.instance.dockerContext.coreEngine;
        this.logger = AppContext.instance.logService.getLogger('Http', Level.INFO);
    }

    protected async onMessage(execPrm: ExecParam): Promise<void> {

        // Todo max files execPrm ?
        // Todo fichier de boot présent dans execPrm ?

        this.logger.info(`(WS ${this.path}) Initialisation de l'engine et execution`);
        let execEngine = await ExecEngine.create(this.coreEngine, execPrm);

        if (!execEngine) {
            this.logger.error(`(WS ${this.path}) Erreur lors de l'initialisation de l'engine`);
            this.close();
            return;
        }

        this.logger.debug(`(WS ${this.path}) Execution avec les Parametres : `, execPrm);

        try {
            let nbLogs = 0;
            await execEngine.run({
                logCallBack: (l) => {
                    this.logger.debug(`(WS ${this.path}) Log d'execution : `, l);
                    this.send(l);
                    nbLogs++;
                }
            });
            this.logger.info(`(WS ${this.path}) Fin de l'execution ${nbLogs} log(s) retourné(s)`);
        } catch (e) {
            this.logger.error(`(WS ${this.path}) Fin de l'execution en erreur : `, e);
        } finally {
            execEngine.stop();
            this.close();
        }
    }
}
