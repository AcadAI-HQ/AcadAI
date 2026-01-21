/**
 * Firebase Admin SDK initialization for server-side operations
 * Used by API routes that need admin access to Firestore
 *
 * Environment variables (in order of priority):
 * 1. FIREBASE_SERVICE_ACCOUNT - Base64-encoded service account JSON (recommended for production)
 * 2. FIREBASE_SERVICE_ACCOUNT_PATH - Path to service account JSON file (for local development)
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import path from 'path';
import fs from 'fs';

let adminApp: App | undefined;
let adminDb: Firestore | undefined;
let adminAuth: Auth | undefined;
let initializationError: string | null = null;

// Initialize Firebase Admin SDK (singleton pattern)
if (!getApps().length) {
  try {
    let serviceAccount: any = null;
    let initMethod = 'none';

    // Method 1: Try base64-encoded service account from environment variable
    // This is the recommended method for production (Vercel, etc.)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        // Support both base64 and raw JSON
        const envValue = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (envValue.startsWith('{')) {
          serviceAccount = JSON.parse(envValue);
        } else {
          serviceAccount = JSON.parse(Buffer.from(envValue, 'base64').toString('utf-8'));
        }
        initMethod = 'FIREBASE_SERVICE_ACCOUNT env var';
      } catch (parseErr) {
        console.error('[firebase-admin] Failed to parse FIREBASE_SERVICE_ACCOUNT:', parseErr);
      }
    }

    // Method 2: Try file path from environment variable (for local development)
    if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      try {
        const pathEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        const resolvedPath = path.resolve(process.cwd(), pathEnv);
        console.log('[firebase-admin] Attempting to load service account from:', resolvedPath);

        if (fs.existsSync(resolvedPath)) {
          const raw = fs.readFileSync(resolvedPath, 'utf-8');
          serviceAccount = JSON.parse(raw);
          initMethod = `file: ${resolvedPath}`;
        } else {
          console.error('[firebase-admin] Service account file not found:', resolvedPath);
        }
      } catch (fileErr) {
        console.error('[firebase-admin] Failed to load service account from file:', fileErr);
      }
    }

    // Initialize with service account if available
    if (serviceAccount) {
      // Validate service account has required fields
      if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
        throw new Error('Service account missing required fields (project_id, client_email, private_key)');
      }

      adminApp = initializeApp({
        credential: cert(serviceAccount)
      });
      console.log('[firebase-admin] ✅ Initialized successfully via', initMethod);
      console.log('[firebase-admin] Project ID:', serviceAccount.project_id);
    } else {
      // Don't initialize without credentials - it won't work for Firestore operations
      initializationError = 'No valid service account found. Set FIREBASE_SERVICE_ACCOUNT (base64) or FIREBASE_SERVICE_ACCOUNT_PATH (file path)';
      console.error('[firebase-admin] ❌', initializationError);
    }
  } catch (error) {
    initializationError = String(error);
    console.error('[firebase-admin] ❌ Initialization failed:', error);
  }
} else {
  adminApp = getApps()[0];
  console.log('[firebase-admin] Using existing app instance');
}

// Export initialized instances
if (adminApp) {
  adminDb = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
}

// Export a helper to check initialization status
export function getAdminInitStatus(): { initialized: boolean; error: string | null } {
  return {
    initialized: !!adminDb,
    error: initializationError
  };
}

export { adminApp, adminDb, adminAuth };
