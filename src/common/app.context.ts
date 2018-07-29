import {LogService} from "./log.service";
import {IndexConf} from "../index.conf";
import {DockerContext} from "../docker-engine/bean/docker.context";


export class AppContext {

    // Singleton
    public static get instance() {
        return AppContext._instance;
    }

    // Application Context
    public appConf: IndexConf;
    public logService: LogService;

    // Docker-engine
    public dockerContext: DockerContext;

    //
    private static _instance: AppContext = new AppContext();

    private contructor() {
    }


}