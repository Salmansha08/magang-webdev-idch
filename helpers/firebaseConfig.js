const admin = require('firebase-admin')
const serviceAccount = require('../test-idcloudhost-firebase-adminsdk.json')
require('dotenv').config()

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

module.exports = db
