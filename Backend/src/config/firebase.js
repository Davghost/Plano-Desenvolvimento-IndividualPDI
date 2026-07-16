const admin = require('firebase-admin');
const serviceAccount = require('../../pdifire.json'); // o .json baixado

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;