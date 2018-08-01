import {GET, HttpContext} from "http-typescript";
import { FormationBean } from "../bean/formation.bean";

export class FormationHttp {


    @GET('/formations')
    public async getListeFormations(context: HttpContext): Promise<FormationBean[]>{
        let listeFormation =[];
        let formationBean: FormationBean = {
            nom: '',
            dateCreation : new Date(),
            dateMaj : new Date(),
            version : 1,
            auteurs : ['BINAU','GROBINAU'],
            id : 'base-js-',
            motCles : ['JAVASCRIPT','JS'],
            etapesFormation : []
        };
        listeFormation.push(formationBean);
        listeFormation.push(formationBean);

        return listeFormation;
    }

    @GET('/formation/:formationId')
    public async getFormationById(context: HttpContext): Promise<FormationBean>{
        let formationId = context.params.formationId;
        
        let formationBean: FormationBean = {
            nom: '',
            dateCreation : new Date(),
            dateMaj : new Date(),
            version : 1,
            auteurs : ['BINAU','GROBINAU'],
            id : 'base-js-',
            motCles : ['JAVASCRIPT','JS'],
            etapesFormation : [
                {
                    cour : 'contenu de mon cour',
                    exercice : {
                        id: '1',
                        contenu:'contenu exercice'
                    }
                }
            ]
        };

        return formationBean;

    }

}