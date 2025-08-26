"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from '@/lib/firebase';
import type { UserProfile, SubscriptionStatus } from '@/types';

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateSubscription: (status: SubscriptionStatus) => Promise<void>;
  useGeneration: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
  
  const fetchUserProfile = async (firebaseUser: User): Promise<UserProfile> => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    } else {
      // If no profile exists, create one
      const newUserProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.email?.split('@')[0] ?? '',
        subscriptionStatus: 'free',
        generationsLeft: 3,
      };
      await setDoc(userDocRef, newUserProfile);
      return newUserProfile;
    }
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    await signInWithEmailAndPassword(auth, email, pass);
    router.push('/dashboard');
    // Auth state change will handle setting user and loading state
  };

  const signup = async (email: string, pass: string) => {
    setLoading(true);
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await fetchUserProfile(userCredential.user); // This will create the user profile doc
    router.push('/dashboard');
    // Auth state change will handle setting user and loading state
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const updateSubscription = async (status: SubscriptionStatus) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { subscriptionStatus: status });
      setUser({ ...user, subscriptionStatus: status });
    }
  };
  
  const useGeneration = async () => {
    if (user && user.subscriptionStatus === 'free' && user.generationsLeft > 0) {
      const newCount = user.generationsLeft - 1;
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { generationsLeft: newCount });
      setUser({ ...user, generationsLeft: newCount });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateSubscription, useGeneration }}>
      {children}
    </AuthContext.Provider>
  );
};
