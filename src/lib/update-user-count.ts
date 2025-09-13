import { db } from '@/lib/firebase';
import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

/**
 * Increment the user count in the public stats document
 * This version uses the Firebase user credential directly for authentication
 */
export async function incrementUserCountWithUser(user: User): Promise<void> {
  try {
    const statsRef = doc(db, 'public', 'stats');
    
    // Use increment to atomically increase the count
    await setDoc(statsRef, {
      userCount: increment(1),
      lastUpdated: serverTimestamp(),
      lastIncrementedBy: user.uid
    }, { merge: true });
    
    console.log('✅ User count incremented successfully by user:', user.uid);
  } catch (error) {
    console.error('❌ Failed to increment user count:', error);
    // Don't throw error - signup should still work even if count update fails
  }
}

/**
 * Legacy version - kept for backward compatibility
 */
export async function incrementUserCount(): Promise<void> {
  try {
    const statsRef = doc(db, 'public', 'stats');
    
    // Use increment to atomically increase the count
    await setDoc(statsRef, {
      userCount: increment(1),
      lastUpdated: serverTimestamp()
    }, { merge: true });
    
    console.log('✅ User count incremented successfully');
  } catch (error) {
    console.error('❌ Failed to increment user count:', error);
    // Don't throw error - signup should still work even if count update fails
  }
}

/**
 * Recalculate and update the actual user count from the users collection
 * This is useful for fixing any discrepancies
 */
export async function recalculateUserCount(): Promise<number> {
  try {
    // This would need to be done server-side with admin SDK for security
    // For now, we'll call our API endpoint
    const response = await fetch('/api/update-user-count', { method: 'POST' });
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ User count recalculated:', data.userCount);
      return data.userCount;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('❌ Failed to recalculate user count:', error);
    throw error;
  }
}