import {GET, HttpContext, POST} from "http-typescript";
import * as mongoose from 'mongoose';

import { Utilisateur } from "../bean/utilisateur/utilisateurBDD";


mongoose.Promise = Promise;
mongoose.connect(
    // TODO parametrage
    'mongodb://test:test123@ds245661.mlab.com:45661/exec',
    {keepAlive: 1, useNewUrlParser: true},
    (err) => {
        if (!err) {
            console.log('Connecte à la BDD')
        }

    }).catch((error) => {
    console.log('Erreur lors de la connection à la BDD', error)
});

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