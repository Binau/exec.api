import {TestConf} from "../bean/conf/test.conf";
import {FileUtils} from "../tool/file.utils";
import {ExecEngine, BuildParam, ExecLog} from "./exec.engine";
import * as Fs from "fs";
import {BufferUtils} from "../tool/buffer.utils";
import * as deepEqual from 'deep-equal';
import {EngineConf} from "../bean/conf/engine.conf";
import {CoreEngine} from "./core.engine";

class TestCode {
    tag: string;
    code: string;
}

class TestParam {
    // Id du tests
    id: string;
    // Codes à injecter
    codes: TestCode[];
}

export class TestInfo {
    idTest: number;

    result?: TestResult;
    log?: ExecLog;

}

export class TestResult {
    in: any;
    expectedOut: any;
    out?: any;
    randomTest: boolean;

    success: boolean;
}


export class TestEngine {


    constructor(
        private coreEngine: CoreEngine) {

    }

    public async run(param: TestParam, resultCb: (testExec: TestInfo) => void): Promise<void> {

        // TODO
        // FIXME param.id doit faire partie des valeurs possible, tester pour eviter l'injection de chemins

        let confPath = `${this.coreEngine.engineConf.dockerTestsRoot}/${param.id}`;
        let confFile = `${confPath}/conf.json`;
        let confTest = await FileUtils.loadConf<TestConf>(confFile);

        let buildParam: BuildParam = {
            idImage: confTest.imgName,
            files: []
        };

        // Chargement des différents morceaux de codes a injecter dans une map
        let codeByTag: Map<string, string> = new Map();
        param.codes.forEach(c => codeByTag.set(c.tag, c.code));

        // Pour chaque fichier prévu, chargement du fichier et injection du code
        for (let f of confTest.files) {

            // lire le fichier
            let filePath = `${confPath}/${f.file}`;
            let fileBuffer = BufferUtils.bufferOrStrToStr(await Fs.promises.readFile(filePath));

            // Rmplacer les tags prévu
            f.tags.forEach(t => {
                let regExp = new RegExp(t);
                // TODO LOG PARLANT SI LE TAG INEXISTANT ?
                fileBuffer = fileBuffer.replace(regExp, codeByTag.get(t));
            });

            // Ajouter le fichier dans
            buildParam.files.push({
                filePath: f.copyTo,
                code: fileBuffer
            });
        }

        let execEngine = await ExecEngine.create(this.coreEngine, buildParam);

        let idTest = 0;
        let stopTests = false;

        // Execution de chacun des tests
        for (let t of confTest.tests) {
            let localTestId = idTest;
            let resultSend = false;

            let testResult: TestResult = {
                in: t.param,
                expectedOut: t.result,
                randomTest: false,
                success: false
            };

            // Injection des tests
            await execEngine.run({
                in: t.param,
                logCallBack: l => {

                    if (l.isError && l.message === 'Timeout') {
                        stopTests = true;
                    }

                    if ((l as any).isResult) {
                        testResult.out = (l  as any).result;
                        testResult.success = deepEqual(t.result, testResult.out);

                        resultCb({
                            idTest: localTestId,
                            result: testResult
                        });
                        resultSend = true;
                    } else {
                        resultCb({
                            idTest: localTestId,
                            log: l
                        });
                    }
                }
            });

            // Si aucun resultat retourné, on retourne un resultat
            if (!resultSend)
                resultCb({
                    idTest: localTestId,
                    result: testResult
                });

            if(stopTests) return;
            idTest++;
        }

        await execEngine.stop();
    }


}