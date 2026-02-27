"use client";

import { useEffect, useState } from 'react';

const PRICING = {
  INR: {
    monthly: { price: '299', currency: 'INR', symbol: '₹' },
    annual: {
      price: '2999',
      currency: 'INR',
      symbol: '₹',
      monthlyEquivalent: '249',
      savings: '589',
      savingsPercent: '16',
    },
  },
  USD: {
    monthly: { price: '10.99', currency: 'USD', symbol: '$' },
    annual: {
      price: '109',
      currency: 'USD',
      symbol: '$',
      monthlyEquivalent: '9.08',
      savings: '22.88',
      savingsPercent: '17',
    },
  },
};

export interface PricingData {
  monthly: {
    price: string;
    currency: string;
    symbol: string;
  };
  annual: {
    price: string;
    currency: string;
    symbol: string;
    monthlyEquivalent: string;
    savings: string;
    savingsPercent: string;
  };
  isIndia: boolean;
  loading: boolean;
  error: string | null;
}

export function useGeoPricing(): PricingData {
  const [data, setData] = useState<PricingData>({
    monthly: { price: '...', currency: 'USD', symbol: '$' },
    annual: { price: '...', currency: 'USD', symbol: '$', monthlyEquivalent: '...', savings: '...', savingsPercent: '...' },
    isIndia: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function detectRegion() {
      let isIndia = false;
      try {
        const geoRes = await fetch('https://ipapi.co/json/', {
          headers: { 'Accept': 'application/json' },
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          isIndia = geoData.country_code === 'IN';
        }
      } catch {
        // Fallback to timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        isIndia = timezone.includes('Kolkata') || timezone.includes('Calcutta');
      }

      if (cancelled) return;

      const pricing = isIndia ? PRICING.INR : PRICING.USD;
      setData({ ...pricing, isIndia, loading: false, error: null });
    }

    detectRegion();
    return () => { cancelled = true; };
  }, []);

  return data;
}
