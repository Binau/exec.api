import {Pack} from 'tar';
import {HttpServer} from "http-typescript";

import {FormationHttp} from './http/formation.http';
import {UtilisateurHttp} from './http/utilisateur.http';

import {TestHttp} from "./http/docker-engine/test.http";
import {ExecWs} from "./http/docker-engine/exec.ws";
import {TestWs} from "./http/docker-engine/test.ws";

class Index {

    public run() {

        new HttpServer()
            .debug()
            //
            .loadHttp(new FormationHttp(), '/rest')
            .loadHttp(new UtilisateurHttp(), '/rest')

            // Geston des tests et executions
            .loadHttp(new TestHttp(), '/rest/tests')
            .loadWs(TestWs, '/ws/runTest')
            .loadWs(ExecWs, '/ws/exec')

            // listen
            .listen(8333);

    }
}

try {
    new Index().run();
} catch (e) {
    console.log(e);
}



