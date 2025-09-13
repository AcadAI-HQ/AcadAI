import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function GET() {
  try {
    // Get the public stats document
    const statsRef = doc(db, 'public', 'stats');
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      const data = statsDoc.data();
      return NextResponse.json({
        success: true,
        userCount: data.userCount || 0,
        lastUpdated: data.lastUpdated
      });
    } else {
      // No stats document exists, return 0
      return NextResponse.json({
        success: true,
        userCount: 0,
        message: 'No stats available yet'
      });
    }
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch stats',
      userCount: 0
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Simply increment the user count (simpler approach)
    const statsRef = doc(db, 'public', 'stats');
    
    // First get current count to return it
    const statsDoc = await getDoc(statsRef);
    let newCount = 1; // Default if document doesn't exist
    
    if (statsDoc.exists()) {
      const currentCount = statsDoc.data().userCount || 0;
      newCount = currentCount + 1;
    }
    
    // Update the count
    await setDoc(statsRef, {
      userCount: newCount,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    console.log(`✅ User count incremented to: ${newCount}`);

    return NextResponse.json({ 
      success: true, 
      userCount: newCount,
      message: 'User count incremented successfully'
    });

  } catch (error) {
    console.error('Error incrementing user count:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to increment user count',
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}