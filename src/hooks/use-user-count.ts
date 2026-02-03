"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const CACHE_KEY = 'acadai_user_count';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedCount {
  count: number;
  timestamp: number;
}

export function useUserCount() {
  const [userCount, setUserCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const statsRef = doc(db, 'public', 'stats');
        const statsDoc = await getDoc(statsRef);

        if (statsDoc.exists()) {
          const data = statsDoc.data();
          const count = data.userCount || 0;
          setUserCount(count);

          // Update cache
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              count,
              timestamp: Date.now(),
            }));
          } catch {
            // Ignore localStorage errors (e.g., private browsing)
          }
        } else {
          setUserCount(0);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user count:', error);
        setUserCount(0);
        setLoading(false);
      }
    };

    // Check cache first
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { count, timestamp }: CachedCount = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setUserCount(count);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Ignore localStorage errors
    }

    // Fetch from Firebase if cache miss or expired
    fetchUserCount();
  }, []);

  return { userCount, loading };
}
