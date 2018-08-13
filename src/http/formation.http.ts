import {GET, HttpContext} from "http-typescript";

import { Formation } from "../bean/formation/formation.bdd";
import { IFormation } from "../bean/formation/formation";

import { CycleFormation } from "../bean/cycle-formation/cycle.formation.bdd";
import { ICycleFormation } from "../bean/cycle-formation/cycle.formation";

import * as jwt from 'jwt-simple';



export class FormationHttp {


    // TODO : Peut on appliquer cette méthode sur tous les appels définis dans FormationHttp ?
    // De manière à éviter de devoir le faire manuellement sur toutes les méthodes ...
    // en fonction de la manière de faire --> faire la gestion des erreurs !!
    private verifierLesDroits(context: HttpContext){
        if (!context.koaContext.header || !context.koaContext.header.authorization || !context.koaContext.header.authorization[1]){
            // TODO : envoyer une erreur
            console.log('Utilisateur non authentifié')
        }else{
            let token = context.koaContext.header.authorization;
            console.log(`token = ${token}`)

            // TODO : changer le 123 pour une valeur paramétrée
            let payload = jwt.decode(token, '123')

            if (!payload){
                // TODO : envoyer une erreur
                console.log('Token faux')
            }else{
                console.log(`utilisateur : ${payload.sub}`)
            }
        }
    }

    @GET('/cycleFormations')
    public async getListeCyclesDeFormation(context: HttpContext): Promise<ICycleFormation>{
        this.verifierLesDroits(context);
        return await CycleFormation.find({})
    }

    @GET('/cycleFormation/:cycleFormationId')
    public async getCycleDeFormation(context: HttpContext): Promise<ICycleFormation>{

        return await CycleFormation.findOne({ id: context.params.cycleFormationId })
    }

    @GET('/cycleFormation/formations/:cycleFormationId')
    public async getListeFormationsByCycleDeFormation(context: HttpContext): Promise<IFormation[]>{
        return await Formation.find({ idCycleFormation: context.params.cycleFormationId })
    }


    @GET('/formation/:formationId')
    public async getFormationById(context: HttpContext): Promise<IFormation>{
        return await Formation.findOne({ id: context.params.formationId })
    }

}