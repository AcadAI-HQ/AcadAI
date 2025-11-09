"use client";

import { Crown, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { useDetectCurrency } from '@/components/pricing/currency-selector';
import { SUBSCRIPTION_PRICING } from '@/lib/razorpay-config';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'hyperpersonalization' | 'chat';
}

export function UpgradePrompt({ isOpen, onClose, feature }: UpgradePromptProps) {
  const router = useRouter();
  const currency = useDetectCurrency();
  const pricing = SUBSCRIPTION_PRICING[currency].monthly;

  const featureDetails = {
    hyperpersonalization: {
      title: 'AI Hyperpersonalization',
      icon: Sparkles,
      description:
        'Get roadmaps tailored specifically to your background, experience, and learning goals. Our AI analyzes your profile to create the most efficient learning path for you.',
      benefits: [
        'Personalized content based on your skills',
        'Optimized learning pace and difficulty',
        'Context-aware recommendations',
        'Continuous adaptation to your progress',
      ],
    },
    chat: {
      title: 'Interactive Chat Assistant',
      icon: Crown,
      description:
        'Get instant help and guidance with our AI-powered chat assistant. Ask questions, clarify concepts, and get personalized advice on your learning journey.',
      benefits: [
        'Real-time answers to your questions',
        'Clarification on complex topics',
        'Personalized learning advice',
        'Available 24/7 to support you',
      ],
    },
  };

  const details = featureDetails[feature];
  const Icon = details.icon;

  const handleUpgrade = () => {
    onClose();
    router.push('/subscription');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-r from-[#29ABE2]/20 to-[#8E2DE2]/20">
              <Lock className="h-8 w-8 text-[#29ABE2]" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            <div className="flex items-center justify-center gap-2">
              <Icon className="h-6 w-6 text-[#29ABE2]" />
              {details.title}
            </div>
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400 pt-2">
            {details.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <h4 className="font-medium mb-3 text-white">Premium Benefits:</h4>
          <ul className="space-y-2">
            {details.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                <Crown className="h-4 w-4 text-[#29ABE2] flex-shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-400">Starting from</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-[#29ABE2] to-[#8E2DE2] bg-clip-text text-transparent">
              {pricing.display}/month
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-[#29ABE2] to-[#8E2DE2] hover:opacity-90"
          >
            Upgrade to Premium
          </Button>
          <Button onClick={onClose} variant="outline" className="w-full">
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Inline badge for locked features
interface FeatureLockedBadgeProps {
  onClick: () => void;
  className?: string;
}

export function FeatureLockedBadge({ onClick, className = '' }: FeatureLockedBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#29ABE2]/20 to-[#8E2DE2]/20 border border-[#29ABE2]/30 text-[#29ABE2] text-sm font-medium hover:opacity-80 transition-opacity ${className}`}
    >
      <Lock className="h-3.5 w-3.5" />
      Premium
    </button>
  );
}
