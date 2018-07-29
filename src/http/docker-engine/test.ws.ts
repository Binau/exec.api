import {HttpContext, WsServer} from 'http-typescript';
import {TestParam} from '../../docker-engine/api/test.ws.api';
import {CoreEngine} from '../../docker-engine/core.engine';
import {TestEngine} from '../../docker-engine/test.engine';
import {AppContext} from "../../common/app.context";

export class TestWs extends WsServer {

    private coreEngine: CoreEngine;

    public constructor() {
        super();
        this.coreEngine = AppContext.instance.dockerContext.coreEngine;
    }

    protected async onMessage(data: TestParam): Promise<void> {



        let testEngine = await TestEngine.create(this.coreEngine, data);

        console.log('params : ', data);

        try {
            await testEngine.run(testI =>
                this.send(testI)
            );
        } catch (e) {
            console.log(e);
        }

    }
}