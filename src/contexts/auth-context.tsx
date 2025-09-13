"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from '@/lib/firebase';
import { incrementUserCount } from '@/lib/update-user-count';
import type { UserProfile } from '@/types';

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, skills: string[]) => Promise<void>;
  logout: () => void;
  useGeneration: (domain: string) => Promise<void>;
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
    await signInWithEmailAndPassword(auth, email, pass);
    router.push('/dashboard');
  };

  const signup = async (email: string, pass: string, skills: string[]) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      const newUserProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.email?.split('@')[0] ?? '',
        skills: skills,
        lastGeneratedDomain: '',
      };

      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, newUserProfile);
      
      // Set user state first
      setUser(newUserProfile);
      
      // Wait a moment for Firebase Auth to fully process, then increment count
      setTimeout(async () => {
        try {
          await incrementUserCount();
          console.log('✅ User count incremented successfully after signup');
        } catch (error) {
          console.log('⚠️ User count increment failed, but signup succeeded:', error);
        }
      }, 1000); // Wait 1 second for auth to fully process
      
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
    router.push('/login');
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
    <AuthContext.Provider value={{ user, loading, login, signup, logout, useGeneration }}>
      {children}
    </AuthContext.Provider>
  );
};
