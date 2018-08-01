import {GET, HttpContext, POST} from "http-typescript";
import * as mongoose from 'mongoose';
import * as jwt from 'jwt-simple';

import { Utilisateur } from "../bean/utilisateur/utilisateurBDD";
import {IUser}  from "../bean/utilisateur/utilisateur";


// Mongoose default promise library is deprecated --> on utilise donc celle de node !
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

    @POST('/utilisateur/login')
    public async login(context: HttpContext): Promise<Response>{
        
        let user : IUser= await Utilisateur.findOne({ email: context.body.email })

        console.log(user);
        if (!user){
            context.koaContext.response.message = 'Email ou mot de passe invalide';
            context.koaContext.response.status=401;
            return context.koaContext.response;
        }

        if(user.motDePasse != context.body.motDePasse){
            context.koaContext.response.message = 'Email ou mot de passe invalide';
            context.koaContext.response.status=401;
            return context.koaContext.response;
        }

        let payload = { sub: user.login }
        let token = jwt.encode(payload, '123');

        context.koaContext.response.status=200;
        context.koaContext.response.body=token;
        
        return context.koaContext.response;

    }

}