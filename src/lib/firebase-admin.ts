/**
 * Firebase Admin SDK initialization for server-side operations
 * Used by API routes that need admin access to Firestore
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

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
      // Fallback: try loading from file (for local development)
      try {
        const serviceAccountFile = require('../../firebase-service-account.json');
        adminApp = initializeApp({
          credential: cert(serviceAccountFile)
        });
        console.log('Firebase Admin initialized with service account file');
      } catch (fileError) {
        console.warn('No service account found. Some features may not work.');
        // Initialize without credentials for routes that can handle it
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
