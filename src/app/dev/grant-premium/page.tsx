'use client';

/**
 * Development Page to Grant Premium Access
 * Visit: http://localhost:9002/dev/grant-premium
 * DELETE THIS FILE IN PRODUCTION!
 */

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const ALLOWED_EMAIL = 'disshad.k.p@gmail.com';

export default function GrantPremiumPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grantPremium = async () => {
    if (!user) {
      setError('You must be signed in');
      return;
    }

    if (user.email !== ALLOWED_EMAIL) {
      setError(`Only ${ALLOWED_EMAIL} can use this feature`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const userRef = doc(db, 'users', user.uid);

      const subscriptionData = {
        tier: 'premium' as const,
        status: 'active' as const,
        subscriptionStartDate: new Date(),
        autoRenew: true,
        currency: 'USD' as const,
        amount: 0
      };

      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        subscription: subscriptionData,
        premiumGrantedAt: serverTimestamp(),
        premiumGrantedBy: 'dev-page-testing',
      }, { merge: true });

      setSuccess(true);
      console.log('✅ Premium access granted!', subscriptionData);

      // Refresh auth context after 1 second
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (err: any) {
      console.error('Error granting premium:', err);
      setError(err.message || 'Failed to grant premium access');
    } finally {
      setLoading(false);
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This page is disabled in production
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to grant premium access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.email !== ALLOWED_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Only {ALLOWED_EMAIL} can use this feature
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Card className="w-full max-w-md border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-2xl">Grant Premium Access</CardTitle>
          <CardDescription>
            Development tool to test premium features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-400">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-sm text-gray-400">
              <strong>UID:</strong> <code className="text-xs bg-gray-800 px-2 py-1 rounded">{user.uid}</code>
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500/20 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-500">
                Premium access granted! Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={grantPremium}
            disabled={loading || success}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {success ? 'Premium Granted!' : 'Grant Premium Access'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            ⚠️ Development only - Delete this page in production
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
