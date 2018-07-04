import {GET, HttpContext} from "http-typescript";
import {Test} from "../bean/test";
import * as Fs from "fs";
import {FileUtils} from "../tool/file.utils";
import {TestConf} from "../bean/conf/test.conf";


export class TestHttp {

    private rootTestsDir = 'data/tests';

    @GET('/tests')
    public async getTests(): Promise<Test[]> {

        let filesName: string[] = await Fs.promises.readdir(this.rootTestsDir);

        let filteredFileNames = filesName.filter(v => {
            return v.match(/.*\.json/);
        });

        let tests: Test[] = [];
        for (let v of filteredFileNames) {
            let testInfos: Test = await this.mapTestIdToTest(v.replace('.json', ''));
            if (testInfos != null) tests.push(testInfos);
        }

        return tests;
    }

    @GET('/tests/:id')
    public async getTestById(context: HttpContext): Promise<Test> {

        let id = context.params.id;
        console.log(`Recherche de la configuration pour le test : ${id}`);

        let testInfos: Test = await this.mapTestIdToTest(id, true);

        return testInfos;
    }


    private async mapTestIdToTest(id: string, full = false): Promise<Test> {
        let conf: TestConf;
        try {
            conf = await FileUtils.loadConf<TestConf>(`${this.rootTestsDir}/${id}.json`);
        } finally {
            if (!conf) return null;
        }

        let testInfos: Test = {
            id: id,
            groupTitle: conf.groupTitle,
            title: conf.title,
            tags: [],
            tests: []
        };

        if (!full) return testInfos;

        for (let f of conf.files) {
            for (let t of f.tags) {
                testInfos.tags.push({
                    code: t.code,
                    template: await FileUtils.loadFile(`${this.rootTestsDir}/${testInfos.id}/${t.templateFile}`)
                });
            }
        }

        testInfos.tests = conf.tests.map(v => {
            return {
                param: JSON.stringify(v.param),
                result: JSON.stringify(v.result)
            }
        });

        return testInfos
    }
}