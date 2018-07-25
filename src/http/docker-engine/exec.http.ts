import {GET, HttpContext} from "http-typescript";
import {ExecInfos} from "../../docker-engine/api/exec.http.api";
import {CoreEngine} from "../../docker-engine/core.engine";


export class ExecHttp {

    public constructor(
        private coreEngine : CoreEngine
    ) {

    }

    @GET('')
    public async getExecs(): Promise<ExecInfos[]> {
        // Todo
        return null;
    }

    @GET('/:id')
    public async getTestById(context: HttpContext): Promise<ExecInfos> {

        let id = context.params.id;

        // Todo id présent ?
        // Todo id fait parti de la liste des id existants ?

        console.log(`Recherche de la configuration pour l'image : ${id}`);
        //let coreEngine = await CoreEngine.loadEngine('data/docker/conf.json');
        let conf = await this.coreEngine.loadImgConf(id);
        return {
            langage: conf.langage,
            description: conf.description,
            bootFileName: conf.bootFileName,
            bootFileTemplate: conf.bootFileTemplate
        };
    }


}