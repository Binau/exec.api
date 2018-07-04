import {CoreEngine} from "./core.engine";
import {ExecEngine} from "./exec.engine";
import {TestEngine} from "./test.engine";
import {FileUtils} from "../tool/file.utils";
import {EngineConf} from "../bean/conf/engine.conf";
import {DockerClient} from "./docker/docker.client";


export class EngineEndpoint {

    private basicEngine: CoreEngine;
    public testEngine: TestEngine;
    private dockerClient: DockerClient;

    private constructor(
        private engineConf: EngineConf
    ) {

        // Creation d'un client vers le docker machine local
        this.dockerClient = new DockerClient(engineConf.host, engineConf.port);
        // Configuration des certificats
        this.dockerClient
        .debug()
            .activeSsl('key.pem', 'cert.pem', 'ca.pem', engineConf.sslRoot);

        //this.basicEngine = new BaseEngine(this.dockerClient, this.engineConf);
        this.testEngine = new TestEngine(this.basicEngine);

    }








}