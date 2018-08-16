import {TestConf} from "./conf/test.conf";
import {FileUtils} from "../tool/file.utils";
import {ExecEngine} from "./exec.engine";
import * as Fs from "fs";
import {BufferUtils} from "../tool/buffer.utils";
import * as deepEqual from 'deep-equal';
import {CoreEngine} from "./core.engine";
import {TestInfo, TestParam, TestResult} from "./api/test.ws.api";
import {ExecParam} from "./api/exec.api";

export class TestEngine {

    private constructor(
        private execEngine : ExecEngine,
        private conf : TestConf) {
    }

    public static async create(coreEngine: CoreEngine, param: TestParam) : Promise<TestEngine> {

        // TODO
        // FIXME param.id doit faire partie des valeurs possible, tester pour eviter l'injection de chemins

        let confPath = `${coreEngine.engineConf.dockerTestsRoot}/${param.id}`;
        let confFile = `${coreEngine.engineConf.dockerTestsRoot}/${param.id}.json`;

        console.log(`Chargement du test ${confFile}`, param);

        let confTest = await FileUtils.loadConf<TestConf>(confFile);

        let buildParam: ExecParam = {
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

            // Remplacer les tags prévu
            f.codes.forEach(t => {
                let regExp = new RegExp(t.tag);
                // TODO LOG PARLANT SI LE TAG INEXISTANT ?
                fileBuffer = fileBuffer.replace(regExp, codeByTag.get(t.tag));
            });

            // Ajouter le fichier dans
            buildParam.files.push({
                filePath: f.copyTo,
                code: fileBuffer
            });
        }

        let execEngine = await ExecEngine.create(coreEngine, buildParam);

        return new TestEngine(execEngine, confTest);
    }

    public async run(resultCb: (testInfo: TestInfo) => void): Promise<void> {


        let idTest = 0;
        let stopTests = false;

        // Execution de chacun des tests
        for (let t of this.conf.tests) {
            let localTestId = idTest;
            let resultSend = false;

            let testResult: TestResult = {
                in: t.param,
                expectedOut: t.result,
                randomTest: false,
                success: false
            };

            // Injection des tests
            await this.execEngine.run({
                params: t.param,

                // Logs de retour
                logCallBack: l => {

                    console.log(l);

                    // Timeout => on stop les tests
                    if (l.isError && l.message === 'Timeout') {
                        stopTests = true;
                    }

                    if (l.isInfo && l.message.startsWith('#R#')) {
                        testResult.out = JSON.parse(l.message.substr(3));
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

            if (stopTests) return;
            idTest++;
        }

        await this.execEngine.stop();
    }

}