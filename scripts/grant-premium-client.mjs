/**
 * Script to grant premium access using Firebase Client SDK
 * This script uses the same credentials as the frontend
 * Usage: node scripts/grant-premium-client.mjs
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, updateDoc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const TARGET_EMAIL = 'disshad.k.p@gmail.com';

async function grantPremiumAccess() {
  try {
    console.log('🔍 Looking for user in Firebase Auth...');

    // Since we can't query by email directly in client SDK,
    // we'll need to sign in as the user or manually provide the UID
    console.log('\n📝 Instructions:');
    console.log('1. Sign in with your account on the app first');
    console.log('2. Open browser console and type: firebase.auth().currentUser.uid');
    console.log('3. Copy the UID');
    console.log('\nOR provide password to auto-sign in:');
    console.log('Enter password for', TARGET_EMAIL);

    // For now, let's create a simpler approach
    // The user should be signed in on the frontend, and we'll update Firestore directly

    const uid = process.argv[2]; // Get UID from command line

    if (!uid) {
      console.error('\n❌ Error: Please provide UID as argument');
      console.log('Usage: node scripts/grant-premium-client.mjs <user-uid>');
      console.log('\nTo get your UID:');
      console.log('1. Sign in to the app');
      console.log('2. Open browser console');
      console.log('3. Type: firebase.auth().currentUser.uid');
      console.log('4. Copy the UID and run: node scripts/grant-premium-client.mjs <UID>');
      process.exit(1);
    }

    console.log(`\n📝 Updating user document for UID: ${uid}`);

    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    const subscriptionData = {
      tier: 'premium',
      status: 'active',
      subscriptionStartDate: new Date(),
      autoRenew: true,
      currency: 'USD',
      amount: 0 // Free testing access
    };

    if (!userDoc.exists()) {
      console.log('Creating new user document...');
      await setDoc(userRef, {
        uid: uid,
        email: TARGET_EMAIL,
        subscription: subscriptionData,
        premiumGrantedAt: serverTimestamp(),
        premiumGrantedBy: 'manual-script-testing',
        createdAt: serverTimestamp()
      });
    } else {
      console.log('Updating existing user document...');
      await updateDoc(userRef, {
        subscription: subscriptionData,
        premiumGrantedAt: serverTimestamp(),
        premiumGrantedBy: 'manual-script-testing'
      });
    }

    console.log('\n✅ Success! Premium access granted to', TARGET_EMAIL);
    console.log('Subscription details:', subscriptionData);
    console.log('\n🔄 Refresh the app to see premium features');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

grantPremiumAccess();
