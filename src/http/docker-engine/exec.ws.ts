import {HttpContext, WsServer} from 'http-typescript';
import {TestInfo, TestParam} from '../../docker-engine/api/test.ws.api';
import {CoreEngine} from '../../docker-engine/core.engine';
import {TestEngine} from '../../docker-engine/test.engine';
import {ExecEngine} from "../../docker-engine/exec.engine";
import {ExecParam} from "../../docker-engine/api/exec.ws.api";


export class ExecWs extends WsServer {

    protected async onMessage(execPrm: ExecParam): Promise<void> {

        // todo max files execPrm ?
        // todo fichier de boot présent dans execPrm ?

        let coreEngine = await CoreEngine.loadEngine('data/docker/conf.json');
        let execEngine = await ExecEngine.create(coreEngine.debug(), execPrm);

        console.log('Execution, Parametres : ', execPrm);

        try {
            await execEngine.run({
                logCallBack: (l) => {
                    this.send(l);
                }
            });
        } catch (e) {
            console.log(e);
        } finally {
            execEngine.stop();
        }
    }
}
