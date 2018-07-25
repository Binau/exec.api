import {HttpContext, WsServer} from 'http-typescript';
import {TestInfo, TestParam} from '../../docker-engine/api/test.ws.api';
import {CoreEngine} from '../../docker-engine/core.engine';
import {TestEngine} from '../../docker-engine/test.engine';


export class TestWs extends WsServer {

    public running = false;

    protected async onMessage(data: TestParam): Promise<void> {

        if (this.running) return;
        this.running = true;

        let coreEngine = await CoreEngine.loadEngine('data/docker/conf.json');
        let testEngine = await TestEngine.create(coreEngine, data);

        console.log('params : ', data);

        try {
            await testEngine.run(testI =>
                this.send(testI)
            );
        } catch (e) {
            console.log(e);
        }

        this.running = false;

    }
}