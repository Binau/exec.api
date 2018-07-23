import {GET, HttpContext, POST} from "http-typescript";
import * as mongoose from 'mongoose';

let UtilisateurModel = require('../bean/utilisateur/utilisateur')

export class UtilisateurHttp {

    @POST('/utilisateur/enregistrer')
    public async enregistrerUtilisateur(context: HttpContext){
        
        let dbConnecte = false;
        let db = mongoose.connect('mongodb://test:test123@ds245661.mlab.com:45661/exec', { useNewUrlParser: true }, (err) => {
            if(!err){
                console.log('connected to mongo')
                dbConnecte = true;
            }
        })

        var user = new UtilisateurModel(context.body)
    
        user.save((err, result) => {
            if(err){
                console.log('Erreur')
            }else{
                console.log('utilisateur enregistrer !!!')
            }
            
            //renvoi response('200');
        })

        
        //renvoi response('500');
        if(dbConnecte){
            db.disconnect()
        }
        
    }

}