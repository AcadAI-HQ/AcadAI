/**
 * Script to grant premium access to specific users in Firestore
 * Usage: node scripts/grant-premium.js <email>
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function grantPremiumAccess(email) {
  try {
    console.log(`Searching for user with email: ${email}`);

    // Get user by email from Firebase Auth
    const userRecord = await admin.auth().getUserByEmail(email);
    const uid = userRecord.uid;

    console.log(`Found user: ${uid}`);

    // Update user document in Firestore
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log('User document does not exist in Firestore. Creating one...');
      await userRef.set({
        uid: uid,
        email: email,
        isPremium: true,
        premiumGrantedAt: admin.firestore.FieldValue.serverTimestamp(),
        premiumGrantedBy: 'manual-script',
        displayName: userRecord.displayName || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      console.log('Updating existing user document...');
      await userRef.update({
        isPremium: true,
        premiumGrantedAt: admin.firestore.FieldValue.serverTimestamp(),
        premiumGrantedBy: 'manual-script'
      });
    }

    console.log(`✅ Premium access granted to ${email} (UID: ${uid})`);
    console.log('\nUser can now access all premium features without payment.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/grant-premium.js <email>');
  console.error('Example: node scripts/grant-premium.js user@example.com');
  process.exit(1);
}

grantPremiumAccess(email);
