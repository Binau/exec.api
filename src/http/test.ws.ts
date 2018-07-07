import {HttpContext, WsServer} from "http-typescript";
import {TestEngine} from "../engine/test.engine";
import {CoreEngine} from "../engine/core.engine";
import {TestInfo, TestParam} from "../bean/export/export.bean";

export class TestWs extends WsServer {
    public debug: boolean = true;
    public running = false;

    protected async onMessage(data: TestParam): Promise<void> {

        if (this.running) return;
        this.running = true;

        let coreEngine = await CoreEngine.loadEngine('data/docker/conf.json');
        let testEngine = new TestEngine(coreEngine);

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