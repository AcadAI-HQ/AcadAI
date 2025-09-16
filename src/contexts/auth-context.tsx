
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/types';


export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  useGeneration: (domain: string) => Promise<void>;
  signInWithGoogle: () => Promise<{ isNewUser: boolean } | void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = async (firebaseUser: User): Promise<UserProfile | null> => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  };
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await fetchUserProfile(firebaseUser);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // Don't set loading to false here - let onAuthStateChanged handle it
      router.push('/dashboard');
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };
  
  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;
        
        // Check if user profile already exists
        const existingProfile = await fetchUserProfile(firebaseUser);
        
        let isNewUser = false;
        
        if (!existingProfile) {
          // Create a new user profile for Google sign-in
          const newUserProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
            skills: [],
            lastGeneratedDomain: '',
          };

          const userDocRef = doc(db, "users", firebaseUser.uid);
          await setDoc(userDocRef, newUserProfile);
          
          // Set user state immediately for new Google users
          setUser(newUserProfile);
          isNewUser = true;
          
          // Increment user count for new Google users
          try {
            const statsRef = doc(db, 'public', 'stats');
            await setDoc(statsRef, {
              userCount: increment(1),
              lastUpdated: serverTimestamp()
            }, { merge: true });
          } catch (error) {
            console.log('⚠️ User count increment failed for Google signup:', error);
          }
        } else {
          // Set existing user state
          setUser(existingProfile);
        }
        
        setLoading(false);
        router.push('/dashboard');
        
        // Return whether this was a new user signup for toast handling
        return { isNewUser };
    } catch (error) {
        console.error("Google sign-in failed:", error);
        setLoading(false);
        throw error;
    }
  };

  const signup = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      const newUserProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.email?.split('@')[0] ?? '',
        skills: [],
        lastGeneratedDomain: '',
      };

      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, newUserProfile);
      
      // Set user state first
      setUser(newUserProfile);
      
      // Increment user count immediately
      try {
        const statsRef = doc(db, 'public', 'stats');
        await setDoc(statsRef, {
          userCount: increment(1),
          lastUpdated: serverTimestamp()
        }, { merge: true });
        console.log('✅ User count incremented successfully after signup');
      } catch (error) {
        console.log('⚠️ User count increment failed, but signup succeeded:', error);
      }
      
      setLoading(false);
      router.push('/dashboard');
    } catch (error) {
      console.error("Signup failed:", error);
      setLoading(false);
      throw error;
    }
  };


  const logout = async () => {
    await signOut(auth);
    setUser(null);
    // Redirect to landing page and replace history to prevent back navigation
    router.replace('/');
    // Clear browser history to prevent back navigation to dashboard
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/');
    }
  };

  const useGeneration = async (domain: string) => {
    if (user) {
      const updates: any = { lastGeneratedDomain: domain };
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, updates);
      setUser({ ...user, ...updates });
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, useGeneration, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
