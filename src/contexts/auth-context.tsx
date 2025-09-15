
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, deleteUser, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, runTransaction, increment, serverTimestamp } from "firebase/firestore";
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/types';


export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  useGeneration: (domain: string) => Promise<void>;
  completeSignup: (skills: string[], domain: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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
      setLoading(true);
      if (firebaseUser) {
        const userProfile = await fetchUserProfile(firebaseUser);
        if (userProfile) { 
          // User has a full profile, we can set the user object
          setUser(userProfile);
           if (window.location.pathname.startsWith('/signup')) {
             router.push('/dashboard');
           }
        } else {
           // This is a new user who just signed up but hasn't completed details page
           const partialProfile: UserProfile = { 
              uid: firebaseUser.uid, 
              email: firebaseUser.email, 
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || ''
           };
           setUser(partialProfile);
           if (window.location.pathname !== '/signup/details') {
             router.push('/signup/details');
           }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    await signInWithEmailAndPassword(auth, email, pass);
    // onAuthStateChanged will handle the redirect
  };
  
  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        // onAuthStateChanged will handle the rest
    } catch (error) {
        console.error("Google sign-in failed:", error);
        setLoading(false);
    }
  };


  const signup = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will redirect to '/signup/details'
    } catch (error) {
      setLoading(false);
      throw error; // Re-throw to be handled by the UI
    }
  };

  const completeSignup = async (skills: string[], domain: string) => {
     if (!auth.currentUser) {
        throw new Error("User is not authenticated.");
    }
    setLoading(true);
    const firebaseUser = auth.currentUser;

    const newUserProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
      skills: skills,
      lastGeneratedDomain: domain,
    };

    const userDocRef = doc(db, "users", firebaseUser.uid);
    const publicStatRef = doc(db, "public", "stat");
    const domainUsageRef = doc(db, "domainUsage", domain);

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            // Only update stats if the user is brand new
            if (!userDoc.exists()) {
                 // 1. Set the user document
                transaction.set(userDocRef, newUserProfile);

                // 2. Increment total user count
                const publicStatDoc = await transaction.get(publicStatRef);
                if (!publicStatDoc.exists()) {
                    transaction.set(publicStatRef, { userCount: 1, lastUpdated: serverTimestamp() });
                } else {
                    transaction.update(publicStatRef, { userCount: increment(1), lastUpdated: serverTimestamp() });
                }

                // 3. Increment skill usage counts
                for (const skill of skills) {
                    const skillDocRef = doc(db, "skillUsage", skill.toLowerCase());
                    const skillDoc = await transaction.get(skillDocRef);
                    if (!skillDoc.exists()) {
                        transaction.set(skillDocRef, { count: 1 });
                    } else {
                        transaction.update(skillDocRef, { count: increment(1) });
                    }
                }
                
                // 4. Increment domain usage count
                const domainDoc = await transaction.get(domainUsageRef);
                if (!domainDoc.exists()) {
                  transaction.set(domainUsageRef, { count: 1 });
                } else {
                  transaction.update(domainUsageRef, { count: increment(1) });
                }
            } else {
                 // If user doc exists (e.g. from Google sign in), just update it
                 transaction.update(userDocRef, {
                    skills: skills,
                    lastGeneratedDomain: domain,
                 });
            }
        });

        setUser(newUserProfile);
        router.push(`/dashboard/my-roadmap`);
    } catch (error) {
        console.error("Signup completion transaction failed:", error);
        // If the transaction fails for a new user, we should probably delete the firebase user
        const userProfile = await getDoc(userDocRef);
        if (!userProfile.exists()) {
            await deleteUser(firebaseUser).catch(delError => console.error("Failed to delete user on signup error", delError));
        }
        setLoading(false);
        throw error; // Propagate error to the UI
    }
  }

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/login');
  };

  const useGeneration = async (domain: string) => {
    if (!user) return;
  
    const userDocRef = doc(db, "users", user.uid);
    const domainUsageRef = doc(db, "domainUsage", domain);

    try {
      await runTransaction(db, async (transaction) => {
          // Read phase
          const domainDoc = await transaction.get(domainUsageRef);
          
          // Write phase
          if (!domainDoc.exists()) {
              transaction.set(domainUsageRef, { count: 1 });
          } else {
              transaction.update(domainUsageRef, { count: increment(1) });
          }

          transaction.update(userDocRef, { lastGeneratedDomain: domain });
      });

      setUser(prevUser => prevUser ? { ...prevUser, lastGeneratedDomain: domain } : null);
    } catch (error) {
        console.error("Roadmap generation transaction failed: ", error);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, useGeneration, completeSignup, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
