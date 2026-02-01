
"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp, Timestamp } from "firebase/firestore";
import { auth, db } from '@/lib/firebase';
import { trackSignup, trackLogin } from '@/lib/analytics';
import type { UserProfile } from '@/types';

// Helper function to check if subscription is active and not expired
function isSubscriptionActive(subscription: UserProfile['subscription'] | undefined): boolean {
  if (!subscription) return false;
  if (subscription.tier !== 'premium') return false;
  if (subscription.status !== 'active') return false;

  // Check if subscription has expired
  if (subscription.currentPeriodEnd) {
    let endDate: Date;
    // Handle Firestore Timestamp or Date object or ISO string
    if (subscription.currentPeriodEnd instanceof Timestamp) {
      endDate = subscription.currentPeriodEnd.toDate();
    } else if (subscription.currentPeriodEnd instanceof Date) {
      endDate = subscription.currentPeriodEnd;
    } else if (typeof subscription.currentPeriodEnd === 'string') {
      endDate = new Date(subscription.currentPeriodEnd);
    } else if (typeof subscription.currentPeriodEnd === 'object' && 'seconds' in subscription.currentPeriodEnd) {
      // Handle Firestore Timestamp-like object (serialized format)
      endDate = new Date((subscription.currentPeriodEnd as any).seconds * 1000);
    } else if (typeof subscription.currentPeriodEnd === 'object' && '_seconds' in subscription.currentPeriodEnd) {
      // Handle Firestore Timestamp with underscore prefix (client SDK format)
      endDate = new Date((subscription.currentPeriodEnd as any)._seconds * 1000);
    } else {
      // Unknown format, assume not expired
      console.warn('[auth] Unknown currentPeriodEnd format:', subscription.currentPeriodEnd);
      return true;
    }

    const now = new Date();
    if (endDate < now) {
      console.log('[auth] Subscription expired:', { endDate: endDate.toISOString(), now: now.toISOString() });
      return false;
    }
  }

  return true;
}


export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  useGeneration: (domain: string) => Promise<void>;
  signInWithGoogle: () => Promise<{ isNewUser: boolean } | void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resendVerificationEmail: (email: string, password: string) => Promise<void>;
  refreshUserProfile: () => Promise<UserProfile | null>;
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
      const userData = userDoc.data() as UserProfile;

      // Migration logic for existing users
      const migrationUpdates: any = {};
      let needsMigration = false;

      if (userData.profileComplete === undefined) {
        migrationUpdates.profileComplete = false;
        needsMigration = true;

        // Only add fields that have actual values
        if (userData.lastGeneratedDomain) {
          migrationUpdates.interestedDomain = userData.lastGeneratedDomain;
        }
      }

      // Migrate interestedDomain to interestedDomains array
      if (userData.interestedDomain && !userData.interestedDomains) {
        migrationUpdates.interestedDomains = [userData.interestedDomain];
        needsMigration = true;
      }

      // Initialize subscription if not present
      if (!userData.subscription) {
        migrationUpdates.subscription = {
          tier: 'free',
          status: 'active',
        };
        needsMigration = true;
      }

      // Update the user document with migration data if needed
      if (needsMigration) {
        await updateDoc(userDocRef, migrationUpdates);
        return { ...userData, ...migrationUpdates };
      }

      return userData;
    }
    return null;
  };
  
  // Define logout first so it can be used in the session timeout effect
  const logout = useCallback(async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);

      // Clear local user state
      setUser(null);

      // Clear all browser storage to ensure clean session termination
      if (typeof window !== 'undefined') {
        // Clear localStorage (any cached user data)
        localStorage.clear();

        // Clear sessionStorage
        sessionStorage.clear();

        // Clear any IndexedDB data from Firebase (optional, for thorough cleanup)
        // Firebase uses 'firebaseLocalStorageDb' for auth persistence
        try {
          const databases = await window.indexedDB.databases?.();
          if (databases) {
            databases.forEach((dbInfo) => {
              if (dbInfo.name?.includes('firebase')) {
                window.indexedDB.deleteDatabase(dbInfo.name);
              }
            });
          }
        } catch (e) {
          // IndexedDB cleanup is optional, ignore errors
        }

        // Replace history to prevent back navigation to authenticated pages
        window.history.replaceState(null, '', '/');
      }

      // Redirect to landing page
      router.replace('/');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      // Even if logout fails, clear local state and redirect
      setUser(null);
      router.replace('/');
    }
  }, [router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await fetchUserProfile(firebaseUser);
        setUser(userProfile);

        // Track session start time
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('sessionStart', Date.now().toString());
        }
      } else {
        setUser(null);

        // Clear session tracking
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('sessionStart');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Session timeout: auto-logout after 24 hours of inactivity
  useEffect(() => {
    if (!user || typeof window === 'undefined') return;

    const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
    const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute

    let lastActivity = Date.now();

    // Track user activity
    const updateActivity = () => {
      lastActivity = Date.now();
      sessionStorage.setItem('lastActivity', lastActivity.toString());
    };

    // Check for session timeout
    const checkTimeout = () => {
      const storedActivity = sessionStorage.getItem('lastActivity');
      const lastActivityTime = storedActivity ? parseInt(storedActivity, 10) : lastActivity;

      if (Date.now() - lastActivityTime > SESSION_TIMEOUT) {
        console.log('[Session] Auto-logout due to inactivity');
        logout();
      }
    };

    // Set up activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, updateActivity, { passive: true }));

    // Initialize last activity
    updateActivity();

    // Set up timeout checker
    const intervalId = setInterval(checkTimeout, ACTIVITY_CHECK_INTERVAL);

    return () => {
      events.forEach((event) => window.removeEventListener(event, updateActivity));
      clearInterval(intervalId);
    };
  }, [user, logout]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = result.user;

      // Check if email is verified
      if (!firebaseUser.emailVerified) {
        setLoading(false);
        const error = new Error('Please verify your email before logging in. Check your inbox for the verification link.');
        (error as any).code = 'auth/email-not-verified';
        throw error;
      }

      // Fetch user profile and redirect: allow admin bypass or premium subscription
      const userProfile = await fetchUserProfile(firebaseUser);

      // Track successful login
      trackLogin('email');

      const bypass =
        userProfile?.roles?.admin === true ||
        userProfile?.flags?.bypassPremium === true;

      const hasPremium = bypass || isSubscriptionActive(userProfile?.subscription);

      console.log('[auth] Login check:', {
        uid: userProfile?.uid,
        tier: userProfile?.subscription?.tier,
        status: userProfile?.subscription?.status,
        currentPeriodEnd: userProfile?.subscription?.currentPeriodEnd,
        bypass,
        hasPremium,
      });

      if (!hasPremium) {
        router.push('/pricing');
      } else if (userProfile && !userProfile.profileComplete) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
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
            profileComplete: false,
            subscription: {
              tier: 'free',
              status: 'active',
            },
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
          // Track new signup via Google
          trackSignup('google');
        } else {
          // Set existing user state
          setUser(existingProfile);
          // Track login via Google
          trackLogin('google');
        }

        setLoading(false);

        // Redirect: always send non-premium users to pricing
        const isPremium = isSubscriptionActive(existingProfile?.subscription);

        console.log('[auth] Google sign-in check:', {
          uid: existingProfile?.uid,
          tier: existingProfile?.subscription?.tier,
          status: existingProfile?.subscription?.status,
          currentPeriodEnd: existingProfile?.subscription?.currentPeriodEnd,
          isPremium,
          isNewUser,
        });

        if (!isPremium) {
          router.push('/pricing');
        } else if (isNewUser || !existingProfile?.profileComplete) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }

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

      // Send email verification
      try {
        await sendEmailVerification(firebaseUser);
        console.log('✅ Verification email sent to:', firebaseUser.email);
      } catch (verificationError) {
        console.error('⚠️ Failed to send verification email:', verificationError);
        // Don't throw - continue with signup even if email fails
      }

      const newUserProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.email?.split('@')[0] ?? '',
        skills: [],
        lastGeneratedDomain: '',
        profileComplete: false,
        subscription: {
          tier: 'free',
          status: 'active',
        },
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

      // Track signup via email
      trackSignup('email');

      setLoading(false);

      // Redirect to onboarding for profile completion
      router.push('/onboarding');
    } catch (error) {
      console.error("Signup failed:", error);
      setLoading(false);
      throw error;
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

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (user) {
      // Filter out undefined values, empty strings, and null values
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) =>
          value !== undefined && value !== '' && value !== null
        )
      );


      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, cleanUpdates);
      // Update local state with the same cleaned data that was sent to Firestore
      setUser({ ...user, ...cleanUpdates });
    }
  };

  const resendVerificationEmail = async (email: string, password: string) => {
    try {
      // Sign in the user temporarily to get their auth object
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      // Check if already verified
      if (firebaseUser.emailVerified) {
        throw new Error('Email is already verified. You can now log in.');
      }

      // Send verification email
      await sendEmailVerification(firebaseUser);

      // Sign out the user since they're not fully logged in yet
      await signOut(auth);

      console.log('✅ Verification email resent to:', firebaseUser.email);
    } catch (error: any) {
      console.error('Failed to resend verification email:', error);
      throw error;
    }
  };

  // Refresh user profile from Firestore (useful after subscription updates)
  const refreshUserProfile = async (): Promise<UserProfile | null> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return null;
    }

    const userProfile = await fetchUserProfile(currentUser);
    if (userProfile) {
      setUser(userProfile);
    }
    return userProfile;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, useGeneration, signInWithGoogle, updateUserProfile, resendVerificationEmail, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
