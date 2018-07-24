import {GET, HttpContext, POST} from "http-typescript";
import * as mongoose from 'mongoose';
mongoose.Promise = Promise

import { Utilisateur } from "../bean/utilisateur/utilisateurBDD";

export class UtilisateurHttp {

    @POST('/utilisateur/enregistrer')
    public async enregistrerUtilisateur(context: HttpContext){
        return await new Promise((resolve, reject) => {
            let user = new Utilisateur(context.body);
            
            user.save((err, result) => {
                if (err) {
                    console.error('Erreur lors de la sauvegarde')
                    
                    context.koaContext.response.body = 'Erreur lors de la sauvegarde'
                    context.koaContext.response.status=500
                    reject(err)
                }else{
                    resolve();
                }
            })
        });
    }



}