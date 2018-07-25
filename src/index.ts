import {Pack} from 'tar';
import {HttpServer} from "http-typescript";

import {FormationHttp} from './http/formation.http';
import {UtilisateurHttp} from './http/utilisateur.http';

import {ExecWs} from "./http/exec.ws";
import * as mongoose from 'mongoose';
mongoose.Promise = Promise

class Main {

import {TestHttp} from "./http/docker-engine/test.http";

import {ExecWs} from "./http/docker-engine/exec.ws";
import {TestWs} from "./http/docker-engine/test.ws";


        mongoose.connect(
            'mongodb://test:test123@ds245661.mlab.com:45661/exec',
            { keepAlive: 1, useNewUrlParser: true },
             (err) => {
            if (!err){
                console.log('Connecte à la BDD')
            }

        }).catch((error) => {
            console.log('Erreur lors de la connection à la BDD')
        });

        //await this.testExec();
        // await this.testInfioniteExec();

class Index {

    public run() {

        let server = new HttpServer();
        server
            .debug()
            .loadHttp(new TestHttp(), '/rest')
            .loadHttp(new FormationHttp(), '/rest')
            .loadHttp(new UtilisateurHttp(), '/rest')
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



