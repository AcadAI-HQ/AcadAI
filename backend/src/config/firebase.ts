import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

let db: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;

// Initialize Firebase Admin SDK
function initializeFirebase() {
  if (admin.apps.length) {
    return;
  }

  try {
    // Option 1: Base64-encoded service account (recommended for production)
    const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (base64ServiceAccount) {
      const serviceAccount = JSON.parse(
        Buffer.from(base64ServiceAccount, 'base64').toString('utf8')
      );
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('[Firebase] Initialized via base64 service account');
      return;
    }

    // Option 2: File path (for local development)
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      path.join(__dirname, '../../firebase-service-account.json');

    if (fs.existsSync(serviceAccountPath)) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });
      console.log('[Firebase] Initialized via file:', serviceAccountPath);
      return;
    }

    console.error('[Firebase] No service account found. Set FIREBASE_SERVICE_ACCOUNT_BASE64 or FIREBASE_SERVICE_ACCOUNT_PATH');
  } catch (error) {
    console.error('[Firebase] Initialization error:', error);
  }
}

initializeFirebase();

if (admin.apps.length) {
  db = admin.firestore();
  auth = admin.auth();
}

export { db, auth };
export default admin;
