"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
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
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      if (firebaseUser) {
        const userProfile = await fetchUserProfile(firebaseUser);
        console.log('User profile created:', userProfile);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const fetchUserProfile = async (firebaseUser: User): Promise<UserProfile> => {
    // For now, return a basic profile without Firestore to avoid WebChannel errors
    console.log('Using basic user profile (Firestore disabled)');
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.email?.split('@')[0] ?? '',
      subscriptionStatus: 'free',
      generationsLeft: 3,
    };
  };

  const login = async (email: string, pass: string) => {
    try {
      setLoading(true);
      console.log('Attempting login with email:', email);
      await signInWithEmailAndPassword(auth, email, pass);
      console.log('Login successful, redirecting to dashboard');
      router.push('/dashboard');
      // Auth state change will handle setting user and loading state
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      throw error;
    }
  };

  const signup = async (email: string, pass: string) => {
    try {
      setLoading(true);
      console.log('Attempting signup with email:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      console.log('Signup successful, creating user profile');
      await fetchUserProfile(userCredential.user); // This will create the user profile doc
      console.log('User profile created, redirecting to dashboard');
      router.push('/dashboard');
      // Auth state change will handle setting user and loading state
    } catch (error) {
      console.error('Signup error:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const updateSubscription = async (status: SubscriptionStatus) => {
    if (user) {
      // Update local state only (Firestore disabled)
      console.log('Updating subscription locally:', status);
      setUser({ ...user, subscriptionStatus: status });
    }
  };
  
  const useGeneration = async () => {
    if (user && user.subscriptionStatus === 'free' && user.generationsLeft > 0) {
      // Update local state only (Firestore disabled)
      const newCount = user.generationsLeft - 1;
      console.log('Updating generations locally:', newCount);
      setUser({ ...user, generationsLeft: newCount });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateSubscription, useGeneration }}>
      {children}
    </AuthContext.Provider>
  );
};
