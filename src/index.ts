import {Pack} from 'tar';
import {HttpServer} from "http-typescript";

import {FormationHttp} from './http/formation.http';
import {UtilisateurHttp} from './http/utilisateur.http';

import {TestHttp} from "./http/docker-engine/test.http";
import {ExecWs} from "./http/docker-engine/exec.ws";
import {TestWs} from "./http/docker-engine/test.ws";
import {CoreEngine} from "./docker-engine/core.engine";
import {ExecHttp} from "./http/docker-engine/exec.http";

class Index {

    public async run() {

        // Todo Classe permettant de gerer la creation du coreegnine + passage au différent module
        // Todo utiliser conf application
        let coreEngine = await CoreEngine.loadEngine('data/docker/conf.json');

        new HttpServer()
            .debug()
            //
            .loadHttp(new FormationHttp(), '/rest')
            .loadHttp(new UtilisateurHttp(), '/rest')

            // Geston des tests et executions
            .loadHttp(new TestHttp(), '/rest/tests')
            .loadHttp(new ExecHttp(coreEngine), '/rest/execs')
            .loadWs(TestWs, '/ws/runTest', coreEngine)
            .loadWs(ExecWs, '/ws/exec', coreEngine)

            // listen
            .listen(8333);

    }
}

try {
    new Index().run();
} catch (e) {
    console.log(e);
}



