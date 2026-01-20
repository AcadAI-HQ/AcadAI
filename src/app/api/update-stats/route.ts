import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// GET endpoint to retrieve public user stats (read-only)
// Note: User count increments happen during signup via client-side Firestore
// with proper security rules (authenticated users only)
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

// POST endpoint removed for security - stats are incremented during signup
// via auth-context.tsx using authenticated Firestore operations