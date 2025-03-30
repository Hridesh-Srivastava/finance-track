import admin from "firebase-admin"

// Check if Firebase Admin has already been initialized
if (!admin.apps.length) {
  // Initialize with service account if provided
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  } else {
    // Initialize without credentials (uses Application Default Credentials)
    admin.initializeApp()
  }
}

const db = admin.firestore()
const auth = admin.auth()

export { db, auth }

