import * as admin from 'firebase-admin'

function createFirebaseApp () {
  const app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY
    }),
    databaseURL: process.env.FIREBASE_DB_URL
  })
  const db = admin.database(app)
  return {
    db
  }
}

export { createFirebaseApp }
