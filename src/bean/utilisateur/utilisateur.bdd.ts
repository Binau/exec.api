import { Document, Schema, Model, model} from "mongoose";
import {IUser}  from "./utilisateur";
import * as bcrypt from "bcrypt";
const SALT_WORK_FACTOR = 10;

export interface IUtilisateurModel extends IUser, Document {

}

export var utilisateurSchema: Schema = new Schema({
    dateDeModification: Date,
    email: String,
    login: String,
    motDePasse: String
});

utilisateurSchema.pre("save", function(next) {

  let utilisateur = this;

  // à chaque fois qu'on met à jour un utilisateur, on met aussi à jour sa date de modification
  utilisateur.dateDeModification = new Date();

  // avant l'enregistrement du mdp
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(utilisateur.motDePasse, salt, function(err, hash) {
        if (err) return next(err);

        // override the cleartext password with the hashed one
        utilisateur.motDePasse = hash;
        next();
    });
  });
});

export const Utilisateur: Model<IUtilisateurModel> = model<IUtilisateurModel>("Utilisateur", utilisateurSchema);