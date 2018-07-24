import {GET, HttpContext, POST} from "http-typescript";
import * as mongoose from 'mongoose';

import { Utilisateur } from "../bean/utilisateur/utilisateurBDD";

export class UtilisateurHttp {

    @POST('/utilisateur/enregistrer')
    public async enregistrerUtilisateur(context: HttpContext){
        // pour générer une erreur de connexion à la BDD
        //let db = mongoose.connect('mongodb://testA:test123@ds245661.mlab.com:45661/exec', { useNewUrlParser: true }, (err) => {
        mongoose.connect('mongodb://test:test123@ds245661.mlab.com:45661/exec', { useNewUrlParser: true }, (err) => {
        }).catch((error) => {
            console.log('Erreur connexion')
            context.koaContext.response.status = 500;
        });

        var db = mongoose.connection;

        db.once('open', function () {
            console.log('connection OK')
            let user = new Utilisateur(context.body);

            user.save((err, result) => {
                if(err){
                    console.log(`Erreur pdt l'enregistrement `)
                    context.koaContext.response.status = 500;
                }else{
                    console.log(`Enregistrement OK`)
                }
                mongoose.disconnect();
            });
        });
        
    }

}