"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';

export function useUserCount() {
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        // Try to get the public stats document from Firebase
        const usersCollectionRef = collection(db, 'users');
        const snapshot = await getCountFromServer(usersCollectionRef);
        
       setUserCount(snapshot.data().count);
      } catch(error){
        setUserCount(100);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCount();
    {, []);

  return {userCount, loading };
}
