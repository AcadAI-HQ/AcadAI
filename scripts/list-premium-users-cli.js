/**
 * Script to list all premium users in Firestore using Firebase Admin SDK
 * This version uses environment variables instead of service account file
 * Usage: node scripts/list-premium-users-cli.js
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin using environment variables
// This works if you have GOOGLE_APPLICATION_CREDENTIALS set or running on Firebase/GCP
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  });
} catch (error) {
  // Fallback: try to initialize without explicit credentials
  // This will work if gcloud CLI is configured
  try {
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin SDK');
    console.error('Please run: gcloud auth application-default login');
    process.exit(1);
  }
}

const db = admin.firestore();

async function listPremiumUsers() {
  try {
    console.log('Fetching all users from Firestore...\n');

    // Query users collection
    const usersSnapshot = await db.collection('users').get();

    if (usersSnapshot.empty) {
      console.log('No users found in the database.');
      process.exit(0);
    }

    const premiumUsers = [];
    const freeUsers = [];
    let totalUsers = 0;

    // Process each user document
    usersSnapshot.forEach(doc => {
      totalUsers++;
      const userData = doc.data();

      // Check if user has premium subscription
      const isPremium = userData.subscription?.tier === 'premium' &&
                       userData.subscription?.status === 'active';

      const userInfo = {
        uid: doc.id,
        email: userData.email || 'N/A',
        displayName: userData.displayName || 'N/A',
        subscriptionTier: userData.subscription?.tier || 'free',
        subscriptionStatus: userData.subscription?.status || 'N/A',
        razorpaySubscriptionId: userData.subscription?.razorpaySubscriptionId || 'N/A',
        subscriptionStartDate: userData.subscription?.subscriptionStartDate?._seconds ?
                              new Date(userData.subscription.subscriptionStartDate._seconds * 1000).toLocaleDateString() :
                              'N/A',
        subscriptionEndDate: userData.subscription?.subscriptionEndDate?._seconds ?
                            new Date(userData.subscription.subscriptionEndDate._seconds * 1000).toLocaleDateString() :
                            'N/A',
        currency: userData.subscription?.currency || 'N/A',
        amount: userData.subscription?.amount ?
                `${userData.subscription.currency === 'INR' ? '₹' : '$'}${userData.subscription.amount / 100}` :
                'N/A',
        profileComplete: userData.profileComplete || false,
        userType: userData.userType || 'N/A',
        interestedDomains: userData.interestedDomains?.join(', ') || userData.interestedDomain || 'N/A'
      };

      if (isPremium) {
        premiumUsers.push(userInfo);
      } else {
        freeUsers.push(userInfo);
      }
    });

    // Display results
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                    PREMIUM USERS REPORT                       ');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log(`📊 Summary:`);
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Premium Users: ${premiumUsers.length}`);
    console.log(`   Free Users: ${freeUsers.length}`);
    console.log(`   Conversion Rate: ${totalUsers > 0 ? ((premiumUsers.length / totalUsers) * 100).toFixed(2) : 0}%\n`);

    if (premiumUsers.length > 0) {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('👑 PREMIUM USERS');
      console.log('═══════════════════════════════════════════════════════════════\n');

      premiumUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.displayName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   UID: ${user.uid}`);
        console.log(`   Subscription Status: ${user.subscriptionStatus}`);
        console.log(`   Razorpay Subscription ID: ${user.razorpaySubscriptionId}`);
        console.log(`   Plan: ${user.amount}/month (${user.currency})`);
        console.log(`   Start Date: ${user.subscriptionStartDate}`);
        console.log(`   End Date: ${user.subscriptionEndDate}`);
        console.log(`   User Type: ${user.userType}`);
        console.log(`   Interested Domains: ${user.interestedDomains}`);
        console.log(`   Profile Complete: ${user.profileComplete ? 'Yes' : 'No'}`);
        console.log('');
      });
    } else {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('No premium users found.');
      console.log('═══════════════════════════════════════════════════════════════\n');
    }

    // Optional: Display free users summary
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📋 FREE USERS SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (freeUsers.length > 0) {
      console.log('Recent Free Users (showing first 10):');
      freeUsers.slice(0, 10).forEach((user, index) => {
        console.log(`${index + 1}. ${user.displayName} (${user.email}) - ${user.userType} - Domains: ${user.interestedDomains}`);
      });

      if (freeUsers.length > 10) {
        console.log(`\n... and ${freeUsers.length - 10} more free users`);
      }
    } else {
      console.log('No free users found.');
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
listPremiumUsers();
