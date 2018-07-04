import {Pack} from 'tar';
import {TestEngine, TestInfo} from "./engine/test.engine";
import {CoreEngine} from "./engine/core.engine";
import {ExecEngine} from "./engine/exec.engine";
import {HttpServer} from "http-typescript";
import {TestHttp} from "./http/test.http";
import {TestWs} from "./http/test.ws";

class Main {


    public async run() {

        //await this.testExec();
        // await this.testInfioniteExec();


        // Add
        //await this.testOk();
        //await this.testCustom();
        //await this.testError();
        //await this.testInfinite();

        // Mult
        //await this.testMult();
        //await this.testMultX();

        let server = new HttpServer();
        server
            .debug()
            .loadHttp(new TestHttp(), '/rest')
            .loadWs(TestWs, '/ws/runTest');
        server.listen(3333)


    }

    public async testExec() {

        try {
            let coreEngine = await CoreEngine.loadEngine('data/docker/conf.json');

            let execEngine = await ExecEngine.create(coreEngine, {
                idImage: 'simple-js',
                files: [
                    {
                        filePath: 'src/index.js',
                        code: 'console.log("Bonjour le monde !");'
                    }
                ]
            });

            await execEngine.run({
                logCallBack: (d) => console.log('SORTIE : ', d)
            });


            await  execEngine.stop();
        } catch (e) {
            console.log('Erreur lors de l\'execution du moteur : ', e);
        }
    }

    public async testInfioniteExec() {

        try {
            let coreEngine = await CoreEngine.loadEngine('data/docker/conf.json');

            let execEngine = await ExecEngine.create(coreEngine, {
                idImage: 'simple-js',
                files: [
                    {
                        filePath: 'src/index.js',
                        code: 'let i =0; setInterval(()=>console.log("Infinite", i++), 500);'
                    }
                ]
            });

            await execEngine.run({
                logCallBack: (d) => console.log('SORTIE : ', d)
            });


            await  execEngine.stop();
        } catch (e) {
            console.log('Erreur lors de l\'execution du moteur : ', e);
        }
    }


    public async testMultX() {
        let coreEngine = await CoreEngine.loadEngine('data/docker/conf.json');
        let testEngine = new TestEngine(coreEngine);

        let codeToTest = 'function plop(val1, val2) { ' +
            '   return 12; ' +
            '   ' +
            '} ';

        await testEngine.run({
            id: 'base-js/mult',
            codes: [
                {
                    tag: '#CODE1;',
                    code: codeToTest
                }
            ]
        }, (testI: TestInfo) => {
            this.logResult(testI);
        });

    }

    public async testMult() {
        let coreEngine = await CoreEngine.loadEngine('data/docker/conf.json');
        let testEngine = new TestEngine(coreEngine);

        let codeToTest = 'function plop(val1, val2) { ' +
            '   return val1+val1 ' +
            '   ' +
            '} ';

        await testEngine.run({
            id: 'base-js/mult',
            codes: [
                {
                    tag: '#CODE1;',
                    code: codeToTest
                }
            ]
        }, (testI: TestInfo) => {
            this.logResult(testI);
        });

    }


    public async testInfinite() {
        let coreEngine = await CoreEngine.loadEngine('data/docker/conf.json');
        let testEngine = new TestEngine(coreEngine);

        let codeToTest = 'function add(val1, val2) { ' +
            '   let i = 0; ' +
            '   setInterval(()=>console.log("PLOUP "+i++),10); ' +
            '} ';

        await testEngine.run({
            id: 'base-js/add',
            codes: [
                {
                    tag: '#CODE1;',
                    code: codeToTest
                }
            ]
        }, (testI: TestInfo) => {
            this.logResult(testI);
        });

    }

    public async testError() {
        let coreEngine = await CoreEngine.loadEngine('data/docker/conf.json');
        let testEngine = new TestEngine(coreEngine);

        let codeToTest = 'function add(val1, val2) { ' +
            '   console.log(`${val1} + ${val2}`); ' +
            '   sdf 8; ' +
            '} ';

        await testEngine.run({
            id: 'base-js/add',
            codes: [
                {
                    tag: '#CODE1;',
                    code: codeToTest
                }
            ]
        }, (testI: TestInfo) => {
            this.logResult(testI);
        });
    }

    public async testCustom() {
        let coreEngine = await CoreEngine.loadEngine('data/docker/conf.json');
        let testEngine = new TestEngine(coreEngine);

        let codeToTest = 'function add(val1, val2) { \n' +
            '   console.log(`${val1} + ${val2} => ?`); \n' +
            '   if(val1===7) { \n' +
            '      let val; \n' +
            '      console.log(val.oups); \n' +
            '   } \n' +
            '   console.error(`ploup`); \n ' +
            '   return 8; \n ' +
            '} ';

        await testEngine.run({
            id: 'base-js/add',
            codes: [
                {
                    tag: '#CODE1;',
                    code: codeToTest
                }
            ]
        }, (testI: TestInfo) => {
            this.logResult(testI);
        });
    }

    public async testOk() {

        let coreEngine = await CoreEngine.loadEngine('data/docker/conf.json');
        let testEngine = new TestEngine(coreEngine);

        let codeToTest = 'function add(val1, val2) { \n' +
            '   return val1+val2; \n ' +
            '} ';

        await testEngine.run({
            id: 'base-js/add',
            codes: [
                {
                    tag: '#CODE1;',
                    code: codeToTest
                }
            ]
        }, (testI: TestInfo) => {
            this.logResult(testI);
        });
    }

    private logResult(testExec: TestInfo) {

        if (!!testExec.log) {

            if (testExec.log.message.endsWith('\n')) testExec.log.message = testExec.log.message.substr(0, testExec.log.message.length - 1);

            console.log(`[${testExec.idTest}][${testExec.log.isInfo ? "INFO" : "ERROR"}] ${testExec.log.message}`);

        } else if (!!testExec.result) {
            console.log(`[${testExec.idTest}][TEST${testExec.result.randomTest ? ' RANDOM' : ''}] : ${testExec.result.success ? 'OK' : 'KO'}`);
            console.log(` <IN> :`, testExec.result.in);
            console.log(` <OUT> :`, testExec.result.out);
            testExec.result.success || console.log(` <EXPECTED> :`, testExec.result.expectedOut);
        }


    }

}

try {
    new Main().run();
} catch (e) {
    console.log(e);
}



