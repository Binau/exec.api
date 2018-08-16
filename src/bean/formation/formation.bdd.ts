import { Document, Schema, Model, model} from "mongoose";
import {IFormation}  from "./formation";

export interface IFormationModel extends IFormation, Document {

}

export var formationSchema: Schema = new Schema({
  nom: String,
  dateCreation : Date,
  dateDeModification : Date,
  version : Number,
  auteurs : [String],
  id : String,
  description : String,
  motCles : [String],
  etapesFormation : {
    cour : String,
    exercice :  {
      id : String,
      contenu : String
    }
  },
  avancement : String,
  image : String,
  idCycleFormation : String,
  niveauFormation : String
});

formationSchema.pre("save", function(next) {

  console.log('presave')
  let utilisateur = this;

  // à chaque fois qu'on met à jour un utilisateur, on met aussi à jour sa date de modification
  utilisateur.dateDeModification = new Date();


  next();
});

export const Formation: Model<IFormationModel> = model<IFormationModel>("Formation", formationSchema);