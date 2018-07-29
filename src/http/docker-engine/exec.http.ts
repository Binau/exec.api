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

    private logHeader(context: HttpContext): string {
        return `(${context.koaContext.method} ${context.koaContext.path})`;
    }

    @GET('')
    public async getExecs(context: HttpContext): Promise<ExecInfos[]> {

        this.loggerSrv.error(`${this.logHeader(context)} [501] Non implémentée`);
        context.koaContext.status = 501;
        return;
    }

    @GET('/:id')
    public async getExec(context: HttpContext): Promise<ExecInfos> {

        this.loggerSrv.debug(`${this.logHeader(context)} Traitement`);

        let id = context.params.id;
        let conf = await this.coreEngine.loadImgConf(id);

        this.loggerSrv.debug(`${this.logHeader(context)} Conf : `, conf);

        if (!!conf) return {
            langage: conf.langage,
            description: conf.description,
            bootFileName: conf.bootFileName,
            bootFileTemplate: conf.bootFileTemplate
        };

        this.loggerSrv.warn(`${this.logHeader(context)} Infos introuvables`);
        context.koaContext.status = 404;
        return;
    }


}