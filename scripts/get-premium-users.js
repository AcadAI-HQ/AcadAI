/**
 * Get premium users from Firestore using Firebase CLI authentication
 * Run with: node scripts/get-premium-users.js
 */

const { execSync } = require('child_process');
const admin = require('firebase-admin');

// Get Firebase CLI access token
let accessToken;
try {
  // Get the access token from Firebase CLI
  const tokenOutput = execSync('firebase login:ci --no-localhost', { encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'] });
  console.log('Please use the web browser to authenticate...');
} catch (error) {
  // Try to use existing session
  try {
    // Initialize with refresh token from Firebase CLI
    const {google} = require('googleapis');

    // Try alternative: use the project directly
    admin.initializeApp({
      projectId: 'acadai-a5294'
    });
  } catch (err) {
    console.error('Failed to initialize. Trying direct approach...');
  }
}

const db = admin.firestore();

async function getPremiumUsers() {
  try {
    console.log('\nFetching users from Firestore...\n');

    const usersSnapshot = await db.collection('users').limit(500).get();

    if (usersSnapshot.empty) {
      console.log('No users found.');
      return;
    }

    const premiumUsers = [];
    const freeUsers = [];
    let totalUsers = 0;

    usersSnapshot.forEach(doc => {
      totalUsers++;
      const userData = doc.data();

      const isPremium = userData.subscription?.tier === 'premium' &&
                       userData.subscription?.status === 'active';

      const userInfo = {
        email: userData.email || 'N/A',
        displayName: userData.displayName || 'N/A',
        tier: userData.subscription?.tier || 'free',
        status: userData.subscription?.status || 'active',
      };

      if (isPremium) {
        premiumUsers.push(userInfo);
      } else {
        freeUsers.push(userInfo);
      }
    });

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                    PREMIUM USERS REPORT                       ');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(`📊 Total Users: ${totalUsers}`);
    console.log(`👑 Premium Users: ${premiumUsers.length}`);
    console.log(`📋 Free Users: ${freeUsers.length}`);
    console.log(`📈 Conversion Rate: ${((premiumUsers.length / totalUsers) * 100).toFixed(2)}%\n`);

    if (premiumUsers.length > 0) {
      console.log('Premium Users:');
      premiumUsers.forEach((user, i) => {
        console.log(`${i + 1}. ${user.displayName} (${user.email})`);
      });
    } else {
      console.log('No premium users found.');
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

getPremiumUsers();
