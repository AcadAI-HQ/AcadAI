/**
 * Browser Console Script to Grant Premium Access
 *
 * INSTRUCTIONS:
 * 1. Sign in to the app at http://localhost:9002
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script into the console
 * 4. Press Enter
 * 5. Refresh the page to see premium features
 *
 * This script updates your Firestore user document to have premium access
 */

(async function grantPremiumAccess() {
  try {
    // Get Firebase instances from the app
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const { getFirestore, doc, updateDoc, setDoc, getDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    if (!user) {
      console.error('❌ Error: You must be signed in to grant premium access');
      console.log('Please sign in first, then run this script again');
      return;
    }

    console.log('🔍 Current user:', user.email);
    console.log('📝 UID:', user.uid);

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    const subscriptionData = {
      tier: 'premium',
      status: 'active',
      subscriptionStartDate: new Date(),
      autoRenew: true,
      currency: 'USD',
      amount: 0 // Free testing access
    };

    console.log('📝 Updating user document...');

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        subscription: subscriptionData,
        premiumGrantedAt: serverTimestamp(),
        premiumGrantedBy: 'browser-console-testing',
        createdAt: serverTimestamp()
      });
    } else {
      await updateDoc(userRef, {
        subscription: subscriptionData,
        premiumGrantedAt: serverTimestamp(),
        premiumGrantedBy: 'browser-console-testing'
      });
    }

    console.log('✅ Success! Premium access granted!');
    console.log('📊 Subscription details:', subscriptionData);
    console.log('🔄 Please refresh the page to see premium features');
    console.log('');
    console.log('To refresh: window.location.reload()');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('1. Make sure you are signed in');
    console.log('2. Check that Firestore rules allow updates');
    console.log('3. Try refreshing and signing in again');
  }
})();
