const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let utilisateurSchema = new Schema({
    email: String,
    login: String,
    motDePasse: String
})
module.exports = mongoose.model('Utilisateur', utilisateurSchema)
