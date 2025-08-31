// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, initializeFirestore, disableNetwork } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  console.log('Firebase config validation:', firebaseConfig);
  for (const key of requiredKeys) {
    if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
      console.error(`Firebase configuration missing: ${key}`, firebaseConfig);
      throw new Error(`Firebase configuration missing: ${key}`);
    }
  }
  console.log('Firebase configuration validated successfully');
};

if (typeof window !== 'undefined') {
  validateFirebaseConfig();
}

// Initialize Firebase
let app, auth, db;

try {
  const isFirstInit = getApps().length === 0;
  app = isFirstInit ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  
  // Skip Firestore initialization to avoid WebChannel issues
  // We'll use Firebase Auth only for now
  db = null;
} catch (error) {
  console.error('Firebase initialization failed:', error);
  throw error;
}

export { app, auth, db };
