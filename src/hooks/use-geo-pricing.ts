"use client";

import { useEffect, useState } from 'react';

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
}

export function useGeoPricing(): PricingData {
  const [isIndia, setIsIndia] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Try to detect using IP geolocation API
        const response = await fetch('https://ipapi.co/json/', {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsIndia(data.country_code === 'IN');
        } else {
          // Fallback to timezone/locale detection
          fallbackDetection();
        }
      } catch (error) {
        // Fallback if API fails
        fallbackDetection();
      } finally {
        setLoading(false);
      }
    };

    const fallbackDetection = () => {
      // Check timezone and locale as fallback
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const isIndianTimezone = timezone.includes('Kolkata') || timezone.includes('Calcutta');
      setIsIndia(isIndianTimezone);
    };

    detectCountry();
  }, []);

  // Calculate pricing based on location
  if (isIndia) {
    // India pricing: ₹199/month, ₹1699/year (~₹142/month, save 29%)
    return {
      monthly: {
        price: '199',
        currency: 'INR',
        symbol: '₹',
      },
      annual: {
        price: '1699',
        currency: 'INR',
        symbol: '₹',
        monthlyEquivalent: '142',
        savings: '689', // ₹199 * 12 - ₹1699 = ₹689
        savingsPercent: '29',
      },
      isIndia: true,
      loading,
    };
  } else {
    // Global pricing: $5.99/month, $59/year (~$4.92/month, save 18%)
    return {
      monthly: {
        price: '5.99',
        currency: 'USD',
        symbol: '$',
      },
      annual: {
        price: '59',
        currency: 'USD',
        symbol: '$',
        monthlyEquivalent: '4.92',
        savings: '12.88', // $5.99 * 12 - $59 = $12.88
        savingsPercent: '18',
      },
      isIndia: false,
      loading,
    };
  }
}
