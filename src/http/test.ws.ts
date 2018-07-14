import {HttpContext, WsServer} from 'http-typescript';
import {TestInfo, TestParam} from '../bean/api/test.ws.api';
import {CoreEngine} from '../docker-engine/core.engine';
import {TestEngine} from '../docker-engine/test.engine';




export class TestWs extends WsServer {
    public debug: boolean = true;
    public running = false;

    protected async onMessage(data: TestParam): Promise<void> {

        if (this.running) return;
        this.running = true;

        let coreEngine = await CoreEngine.loadEngine('data/docker/conf.json');
        let testEngine = new TestEngine(coreEngine.debug());

        console.log('params : ', data);

        try {
            await testEngine.run(data, (testI: TestInfo) => {
                this.send(testI);
            });
        } catch (e) {
            console.log(e);
        }

        this.running = false;

    }
}