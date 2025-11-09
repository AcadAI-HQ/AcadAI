"use client";

import { useAuth } from './use-auth';
import type { SubscriptionTier } from '@/types';

export type Feature = 'hyperpersonalization' | 'chat' | 'prioritySupport' | 'weeklyResources';

const FEATURE_ACCESS_MAP: Record<Feature, SubscriptionTier[]> = {
  hyperpersonalization: ['premium'],
  chat: ['premium'],
  prioritySupport: ['premium'],
  weeklyResources: ['premium'],
};

export function useFeatureAccess(feature: Feature): {
  hasAccess: boolean;
  tier: SubscriptionTier;
  loading: boolean;
} {
  const { user, loading } = useAuth();

  // Determine current tier
  const tier: SubscriptionTier =
    user?.subscription?.tier === 'premium' &&
    user?.subscription?.status === 'active'
      ? 'premium'
      : 'free';

  // Check if user has access to the feature
  const hasAccess = FEATURE_ACCESS_MAP[feature].includes(tier);

  return {
    hasAccess,
    tier,
    loading,
  };
}

// Hook to get all feature access status
export function useAllFeatures() {
  const { user, loading } = useAuth();

  const tier: SubscriptionTier =
    user?.subscription?.tier === 'premium' &&
    user?.subscription?.status === 'active'
      ? 'premium'
      : 'free';

  return {
    tier,
    loading,
    features: {
      hyperpersonalization: tier === 'premium',
      chat: tier === 'premium',
      prioritySupport: tier === 'premium',
      weeklyResources: tier === 'premium',
      roadmapGeneration: true, // Always available
      monthlyResources: true, // Always available
    },
  };
}
