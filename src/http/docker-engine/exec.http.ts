import {GET, HttpContext} from "http-typescript";
import {ExecInfos} from "../../docker-engine/api/exec.http.api";
import {CoreEngine} from "../../docker-engine/core.engine";
import {AppContext} from "../../common/app.context";
import {Level, Logger} from "../../common/log.service";


export class ExecHttp {

    private coreEngine: CoreEngine;
    private loggerSrv: Logger;

    public constructor() {
        this.coreEngine = AppContext.instance.dockerContext.coreEngine;
        this.loggerSrv = AppContext.instance.logService.getLogger('Http', Level.INFO);
    }

    @GET('')
    public async getExecs(context: HttpContext): Promise<ExecInfos[]> {
        this.loggerSrv.error(`(${context.koaContext.method} ${context.koaContext.path}) [501] Non implémentée`);
        context.koaContext.status = 501;
        return;
    }

    @GET('/:id')
    public async getExec(context: HttpContext): Promise<ExecInfos> {

        this.loggerSrv.log(`(${context.koaContext.method} ${context.koaContext.path}) Traitement`);

        let id = context.params.id;

        let conf = await this.coreEngine.loadImgConf(id);

        this.loggerSrv.debug(`(${context.koaContext.method} ${context.koaContext.path}) Conf : `, conf);

        if (!!conf) return {
            langage: conf.langage,
            description: conf.description,
            bootFileName: conf.bootFileName,
            bootFileTemplate: conf.bootFileTemplate
        };

        this.loggerSrv.warn(`(${context.koaContext.method} ${context.koaContext.path}) Infos introuvables`);
        context.koaContext.status = 404;
        return;
    }


}