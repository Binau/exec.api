import {WsServer} from 'http-typescript';
import {TestParam} from '../../docker-engine/api/test.ws.api';
import {CoreEngine} from '../../docker-engine/core.engine';
import {TestEngine} from '../../docker-engine/test.engine';

export class TestWs extends WsServer {


    public constructor(private coreEngine : CoreEngine) {
        super();

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