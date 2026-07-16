const admin = require('firebase-admin');
const serviceAccount = require('../../planodesenvolvimentoindividual-firebase-adminsdk-fbsvc-fd98d16ea9.json'); // o .json baixado

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;