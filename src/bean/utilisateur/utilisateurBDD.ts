import { Document, Schema, Model, model} from "mongoose";
import {IUser}  from "./utilisateur";

export interface IUtilisateurModel extends IUser, Document {

}

export var utilisateurSchema: Schema = new Schema({
    dateDeCreation: Date,
    email: String,
    login: String,
    motDePasse: String
});

utilisateurSchema.pre("save", function(next) {
  let now = new Date();
  if (!this.dateDeCreation) {
    this.dateDeCreation = now;
  }
  next();
});

let UtilisateurModel = model('Utilisateur', utilisateurSchema);

UtilisateurModel.getAll = () => {
    return UtilisateurModel.find({});
}


export const Utilisateur: Model<IUtilisateurModel> = model<IUtilisateurModel>("Utilisateur", utilisateurSchema);