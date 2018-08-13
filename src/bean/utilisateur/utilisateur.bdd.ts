import { Document, Schema, Model, model} from "mongoose";
import {IUser}  from "./utilisateur";
import  * as bcrypt from "bcrypt-nodejs";

export interface IUtilisateurModel extends IUser, Document {

}

export var utilisateurSchema: Schema = new Schema({
    dateDeModification: Date,
    email: String,
    login: String,
    motDePasse: String
});

utilisateurSchema.pre("save", function(next) {

  console.log('presave')
  let utilisateur = this;

  // à chaque fois qu'on met à jour un utilisateur, on met aussi à jour sa date de modification
  utilisateur.dateDeModification = new Date();

  // avant l'enregistrement du mdp
  bcrypt.hash(utilisateur.motDePasse, null, null, (err, hash) => {
    if(err) {
      return next(err)
    }
    utilisateur.motDePasse = hash
  })

  next();
});

export const Utilisateur: Model<IUtilisateurModel> = model<IUtilisateurModel>("Utilisateur", utilisateurSchema);