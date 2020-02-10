const mongoose = require('mongoose');
const {dbLogin} = process.env.DB_LOGIN || require('../auth.json');
const {dbPassword} = process.env.DB_PASSWORD || require('../auth.json');

module.exports = () => {
    return mongoose.connect(`mongodb+srv://${process.env.DB_LOGIN || dbLogin}:${process.env.DB_PASSWORD || dbPassword}@onegaidb-tj9rb.mongodb.net/test?retryWrites=true&w=majority`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(() => console.log('Connexion à MongoDB réussie !'))
        .catch(error => console.error("Impossible de se connecter à la BDD : " + error));
};