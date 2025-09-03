"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from '@/lib/firebase';
import type { UserProfile, SubscriptionStatus } from '@/types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, skills: string[]) => Promise<void>;
  logout: () => void;
  updateSubscription: (status: SubscriptionStatus) => Promise<void>;
  useGeneration: (domain: string) => Promise<void>;
  processPayment: (amount: number) => Promise<void>;
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
        subscriptionStatus: 'free',
        generationsLeft: 3,
        skills: skills,
        lastGeneratedDomain: '',
      };

      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, newUserProfile);
      
      setUser(newUserProfile);
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

  const updateSubscription = async (status: SubscriptionStatus) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const newGenerations = status === 'premium' ? Infinity : 3;
      await updateDoc(userDocRef, { 
        subscriptionStatus: status,
        generationsLeft: newGenerations
      });
      setUser({ ...user, subscriptionStatus: status, generationsLeft: newGenerations });
    }
  };

  const useGeneration = async (domain: string) => {
    if (user) {
      const updates: any = { lastGeneratedDomain: domain };
      if (user.subscriptionStatus === 'free' && user.generationsLeft > 0) {
        updates.generationsLeft = user.generationsLeft - 1;
      }
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, updates);
      setUser({ ...user, ...updates });
    }
  };
  
  const processPayment = (amount: number) => {
    return new Promise<void>((resolve, reject) => {
      if (!user) {
        return reject("User not logged in");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100, // Amount in paise
        currency: "INR",
        name: "Acad AI Premium",
        description: "Unlimited Roadmap Generations",
        handler: async (response: any) => {
          try {
            console.log("Payment successful:", response.razorpay_payment_id);
            await updateSubscription('premium');
            resolve();
          } catch (error) {
            console.error("Error updating subscription after payment:", error);
            reject(error);
          }
        },
        prefill: {
          name: user.displayName || "",
          email: user.email || "",
        },
        theme: {
          color: "#29ABE2", // Primary brand color
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal dismissed");
            // Don't reject on dismiss, user might just be closing the window.
          }
        }
      };

      if (!options.key) {
        const errorMessage = "Payment gateway is not configured. Please contact support.";
        console.error("Razorpay Key ID is not defined in environment variables.");
        return reject(errorMessage);
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        console.error("Razorpay payment failed:", response.error);
        reject(response.error.description);
      });
      rzp.open();
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateSubscription, useGeneration, processPayment }}>
      {children}
    </AuthContext.Provider>
  );
};
