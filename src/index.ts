import {Pack} from 'tar';
import {HttpServer} from "http-typescript";

import {FormationHttp} from './http/formation.http';
import {UtilisateurHttp} from './http/utilisateur.http';

import {TestHttp} from "./http/docker-engine/test.http";
import {ExecWs} from "./http/docker-engine/exec.ws";
import {TestWs} from "./http/docker-engine/test.ws";
import * as mongoose from 'mongoose';


// TODO Externaliser dans une classe dédé à la gestion de bdd
mongoose.Promise = Promise;
mongoose.connect(
    // TODO parametrage
    'mongodb://test:test123@ds245661.mlab.com:45661/exec',
    {keepAlive: 1, useNewUrlParser: true},
    (err) => {
        if (!err) {
            console.log('Connecte à la BDD')
        }

    }).catch((error) => {
    console.log('Erreur lors de la connection à la BDD', error)
});


class Index {

    public run() {

        let server = new HttpServer();
        server
            .debug()
            .loadHttp(new FormationHttp(), '/rest')
            .loadHttp(new UtilisateurHttp(), '/rest')
            // Geston des tests et executions
            .loadHttp(new TestHttp(), '/rest/tests')
            .loadWs(TestWs, '/ws/runTest')
            .loadWs(ExecWs, '/ws/exec');
        server.listen(8333);

    }
}

try {
    new Index().run();
} catch (e) {
    console.log(e);
}



