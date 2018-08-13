import {GET, HttpContext, POST} from "http-typescript";
import * as mongoose from 'mongoose';
import * as jwt from 'jwt-simple';
import  * as bcrypt from "bcrypt-nodejs";

import { Utilisateur } from "../bean/utilisateur/utilisateur.bdd";
import {IUser}  from "../bean/utilisateur/utilisateur";


// TODO : A déplacer
// Mongoose default promise library is deprecated --> on utilise donc celle de node !
mongoose.Promise = Promise;
mongoose.connect(
    // TODO parametrage
    'mongodb://test2:test222@ds245661.mlab.com:45661/exec',
    {keepAlive: 1, useNewUrlParser: true},
    (err) => {
        if (!err) {
            console.log('Connecte à la BDD')
        }

    }).catch((error) => {
    console.log('Erreur lors de la connection à la BDD', error)
});
// TODO : A commenter
mongoose.set('debug', true);

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
        }).catch(err => console.log(err));;
    }

    @POST('/utilisateur/login')
    public async login(context: HttpContext){
        
        let user : IUser= await Utilisateur.findOne({ email: context.body.email })
        return await new Promise((resolve, reject) => {
            console.log(`utilisateur : ${JSON.stringify(user)}`);
            if (!user){
                context.koaContext.response.message = 'Email ou mot de passe invalide';
                context.koaContext.response.status=401;
                reject(new Error('Email ou mot de passe invalide'))
            }
            
            bcrypt.compare(context.body.motDePasse, user.motDePasse, (err, isMatch) => {
                if (!isMatch){
                    context.koaContext.response.message = 'Email ou mot de passe invalide';
                    context.koaContext.response.status=401;
                    reject(new Error('Email ou mot de passe invalide'));
                }else{
                    let payload = { sub: user.login } 
                    // TODO : A parametrer
                    let token = jwt.encode(payload, '123');
                    context.koaContext.response.status=200;
                    resolve({token});
                }
            });
        }).catch(err => console.log(err));

    }
}