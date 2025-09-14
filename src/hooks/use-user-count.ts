"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function useUserCount() {
  const [userCount, setUserCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        // Try to get the public stats document from Firebase
        const statsRef = doc(db, 'public', 'stats');
        const statsDoc = await getDoc(statsRef);
        
        if (statsDoc.exists()) {
          const data = statsDoc.data();
          const count = data.userCount || 0;
          setUserCount(count);
        } else {
          setUserCount(0);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user count:', error);
        // Fallback: Use a reasonable default while rules are being set up
        setUserCount(0);
        setLoading(false);
      }
    };

    fetchUserCount();
  }, []);

  return { userCount, loading };
}
