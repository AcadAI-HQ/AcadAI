"use client";

import { useEffect, useState } from 'react';

// Backend API URL - configure via environment variable
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

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

/**
 * Hook that fetches pricing from the backend API
 * Pricing is validated server-side to prevent tampering
 */
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

    async function fetchPricing() {
      try {
        // First detect country (client-side for accuracy)
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

        const currency = isIndia ? 'INR' : 'USD';

        // Fetch pricing from backend
        const res = await fetch(`${API_URL}/api/payment/pricing?currency=${currency}`);

        if (!res.ok) {
          throw new Error('Failed to fetch pricing');
        }

        const pricing = await res.json();

        if (cancelled) return;

        // Calculate savings for display
        const monthlyNum = parseFloat(pricing.monthly.price);
        const annualNum = parseFloat(pricing.annual.price);
        const savingsNum = (monthlyNum * 12) - annualNum;

        setData({
          monthly: {
            price: pricing.monthly.price,
            currency: pricing.currency,
            symbol: pricing.symbol,
          },
          annual: {
            price: pricing.annual.price,
            currency: pricing.currency,
            symbol: pricing.symbol,
            monthlyEquivalent: pricing.annual.monthlyEquivalent,
            savings: savingsNum.toFixed(2),
            savingsPercent: pricing.annual.savingsPercent,
          },
          isIndia,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) return;

        console.error('Failed to fetch pricing:', error);

        // Fallback to default USD pricing on error
        setData({
          monthly: { price: '5.99', currency: 'USD', symbol: '$' },
          annual: {
            price: '59',
            currency: 'USD',
            symbol: '$',
            monthlyEquivalent: '4.92',
            savings: '12.88',
            savingsPercent: '18',
          },
          isIndia: false,
          loading: false,
          error: 'Could not load pricing. Using default.',
        });
      }
    }

    fetchPricing();

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
