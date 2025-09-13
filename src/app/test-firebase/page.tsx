"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TestFirebase() {
  const { user } = useAuth();
  const [result, setResult] = useState<string>('');

  const testWrite = async () => {
    setResult('Testing...');
    try {
      console.log('Current user:', user);
      console.log('User authenticated?', !!user);
      
      const statsRef = doc(db, 'public', 'stats');
      
      await setDoc(statsRef, {
        userCount: increment(1),
        lastUpdated: serverTimestamp(),
        testWrite: true
      }, { merge: true });
      
      setResult('✅ SUCCESS: Write worked!');
    } catch (error: any) {
      console.error('Write error:', error);
      setResult(`❌ ERROR: ${error.code} - ${error.message}`);
    }
  };

  if (!user) {
    return (
      <div className="p-8">
        <h1>Firebase Test Page</h1>
        <p>Please log in first to test Firebase permissions.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Firebase Write Permission Test</h1>
      
      <div className="mb-4">
        <p><strong>User:</strong> {user.email}</p>
        <p><strong>UID:</strong> {user.uid}</p>
      </div>
      
      <button 
        onClick={testWrite}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Test Write to public/stats
      </button>
      
      <div className="p-4 bg-gray-100 rounded">
        <strong>Result:</strong> {result}
      </div>
    </div>
  );
}