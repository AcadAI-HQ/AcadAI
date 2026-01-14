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
    // India pricing: ₹199/month, ₹1999/year (~₹167/month)
    return {
      monthly: {
        price: '199',
        currency: 'INR',
        symbol: '₹',
      },
      annual: {
        price: '1999',
        currency: 'INR',
        symbol: '₹',
        monthlyEquivalent: '167',
        savings: '389', // ₹199 * 12 - ₹1999 = ₹389
      },
      isIndia: true,
      loading,
    };
  } else {
    // Global pricing: $3.99/month, $39/year (~$3.25/month)
    return {
      monthly: {
        price: '3.99',
        currency: 'USD',
        symbol: '$',
      },
      annual: {
        price: '39',
        currency: 'USD',
        symbol: '$',
        monthlyEquivalent: '3.25',
        savings: '8.88', // $3.99 * 12 - $39 = $8.88
      },
      isIndia: false,
      loading,
    };
  }
}
