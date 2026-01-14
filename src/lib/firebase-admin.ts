/**
 * Firebase Admin SDK initialization for server-side operations
 * Used by API routes that need admin access to Firestore
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import path from 'path';
import fs from 'fs';

let adminApp: App | undefined;
let adminDb: Firestore | undefined;
let adminAuth: Auth | undefined;

// Initialize Firebase Admin SDK (singleton pattern)
if (!getApps().length) {
  try {
    // Try to initialize with service account from environment variable
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (serviceAccount) {
      adminApp = initializeApp({
        credential: cert(serviceAccount)
      });
      console.log('Firebase Admin initialized with service account from environment');
    } else {
      // Attempt to initialize from an explicit path provided via env
      try {
        const pathEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        if (pathEnv) {
          const resolvedPath = path.resolve(process.cwd(), pathEnv);
          const raw = fs.readFileSync(resolvedPath, 'utf-8');
          const serviceAccountFile = JSON.parse(raw);
          adminApp = initializeApp({
            credential: cert(serviceAccountFile)
          });
          console.log('Firebase Admin initialized with service account path:', resolvedPath);
        } else {
          console.warn('FIREBASE_SERVICE_ACCOUNT_PATH is not set; initializing Firebase Admin without credentials (dev mode). Some features may not work.');
          adminApp = initializeApp();
        }
      } catch (err) {
        console.warn('Service account path initialization failed, proceeding without credentials.', err);
        adminApp = initializeApp();
      }
    }
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
    throw error;
  }
} else {
  adminApp = getApps()[0];
}

// Export initialized instances
if (adminApp) {
  adminDb = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
}

export { adminApp, adminDb, adminAuth };
