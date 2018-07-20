import {GET, HttpContext, POST} from "http-typescript";


let UtilisateurModel = require('../bean/utilisateur/utilisateur')

export class UtilisateurHttp {

    @POST('/utilisateur/enregistrer')
    public async enregistrerUtilisateur(context: HttpContext){
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
    }

}