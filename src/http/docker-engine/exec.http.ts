import {GET, HttpContext} from "http-typescript";
import {CoreEngine} from "../../docker-engine/core.engine";
import {AppContext} from "../../common/app.context";
import {Level, Logger} from "../../common/log.service";
import {ExecInfos} from "../../docker-engine/api/exec.api";


export class ExecHttp {

    private coreEngine: CoreEngine;
    private logger: Console;

    public constructor() {
        this.coreEngine = AppContext.instance.dockerContext.coreEngine;
        this.logger = AppContext.instance.logService.getLogger('Http', Level.INFO);
    }

    private logHeader(context: HttpContext): string {
        return `(${context.koaContext.method} ${context.koaContext.path})`;
    }

    @GET('')
    public async getExecs(context: HttpContext): Promise<ExecInfos[]> {

        this.logger.error(`${this.logHeader(context)} [501] Non implémentée`);
        context.koaContext.status = 501;
        return;
    }

    @GET('/:id')
    public async getExec(context: HttpContext): Promise<ExecInfos> {

        this.logger.debug(`${this.logHeader(context)} Traitement`);

        let id = context.params.id;
        let conf = await this.coreEngine.loadImgConf(id);

        this.logger.debug(`${this.logHeader(context)} Conf : `, conf);

        if (!!conf) return {
            langage: conf.langage,
            description: conf.description,
            bootFileTemplate: {
                code: conf.bootFileTemplate,
                filePath: conf.bootFileName
            }
        };

        this.logger.warn(`${this.logHeader(context)} Infos introuvables`);
        context.koaContext.status = 404;
        return;
    }


}