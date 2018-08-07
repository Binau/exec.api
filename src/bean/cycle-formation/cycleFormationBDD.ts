import { Document, Schema, Model, model} from "mongoose";
import {ICycleFormation}  from "./cycleFormation";

export interface ICycleFormationModel extends ICycleFormation, Document {

}

export var cycleFormationSchema: Schema = new Schema({
  id: String,
  nom: String,
  description : String,
  avancement : String,
  image : String
});


export const CycleFormation: Model<ICycleFormationModel> = model<ICycleFormationModel>("CycleFormation", cycleFormationSchema);