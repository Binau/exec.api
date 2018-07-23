import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

let utilisateurSchema = new Schema({
    email: String,
    login: String,
    motDePasse: String
})

let UtilisateurModel = mongoose.model('Utilisateur', utilisateurSchema);

UtilisateurModel.getAll = () => {
    return UtilisateurModel.find({});
}

export default UtilisateurModel;
