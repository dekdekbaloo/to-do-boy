const functions = require('firebase-functions');
const app = require('./build/app').createApp(functions.config())

exports.app = functions.https.onRequest(app);
