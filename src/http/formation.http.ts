import {GET, HttpContext} from "http-typescript";

import { Formation } from "../bean/formation/formationBDD";
import { IFormation } from "../bean/formation/formation";

import { CycleFormation } from "../bean/cycle-formation/cycleFormationBDD";
import { ICycleFormation } from "../bean/cycle-formation/cycleFormation";



export class FormationHttp {

    @GET('/cycleFormations')
    public async getListeCyclesDeFormation(context: HttpContext): Promise<ICycleFormation>{
        return await CycleFormation.find({})
    }

    @GET('/cycleFormation/:cycleFormationId')
    public async getCycleDeFormation(context: HttpContext): Promise<ICycleFormation>{
        return await CycleFormation.findOne({ id: context.params.cycleFormationId })
    }

    @GET('/formations/:cycleFormationId')
    public async getListeFormationsByCycleDeFormation(context: HttpContext): Promise<IFormation[]>{
        return await Formation.find({ idCycleFormation: context.params.cycleFormationId })
    }


    @GET('/formation/:formationId')
    public async getFormationById(context: HttpContext): Promise<IFormation>{
        return await Formation.findOne({ id: context.params.formationId })
    }

}