// Simple script to manually update user count in Firebase
// Run this with: node scripts/update-user-count.js [count]

const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to add your service account key)
// For now, this is just a template
console.log('To update user count:');
console.log('1. Go to Firebase Console');
console.log('2. Navigate to Firestore Database');
console.log('3. Create collection "public" if it doesn\'t exist');
console.log('4. Create document "stats" with the following fields:');
console.log('   - userCount: [your actual user count]');
console.log('   - lastUpdated: [current timestamp]');
console.log('');
console.log('Alternatively, you can use the Firebase Admin SDK:');
console.log('');

const exampleCode = `
// Example Firebase Admin usage:
const admin = require('firebase-admin');

// Initialize with your service account
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  // or use service account key file
});

const db = admin.firestore();

async function updateUserCount() {
  try {
    // Get actual user count
    const usersSnapshot = await db.collection('users').get();
    const userCount = usersSnapshot.size;
    
    // Update public stats
    await db.collection('public').doc('stats').set({
      userCount: userCount,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log('User count updated:', userCount);
  } catch (error) {
    console.error('Error:', error);
  }
}

updateUserCount();
`;

console.log(exampleCode);