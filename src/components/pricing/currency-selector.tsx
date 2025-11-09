"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface CurrencySelectorProps {
  value: 'USD' | 'INR';
  onChange: (currency: 'USD' | 'INR') => void;
}

export function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      <span className="text-sm text-gray-400 mr-2">Currency:</span>
      <div className="flex gap-2 p-1 bg-gray-900/50 rounded-lg border border-gray-700">
        <Button
          variant={value === 'USD' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onChange('USD')}
          className={value === 'USD' ? 'bg-[#29ABE2]' : ''}
        >
          USD ($)
        </Button>
        <Button
          variant={value === 'INR' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onChange('INR')}
          className={value === 'INR' ? 'bg-[#29ABE2]' : ''}
        >
          INR (₹)
        </Button>
      </div>
    </div>
  );
}

/**
 * Detect user's currency based on location
 * Uses multiple signals: timezone, locale, and language preference
 */
export function useDetectCurrency(): 'USD' | 'INR' {
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');

  useEffect(() => {
    const detectCurrency = () => {
      try {
        // 1. Check timezone - most reliable for India detection
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone.includes('Asia/Kolkata') ||
            timezone.includes('Asia/Calcutta') ||
            timezone.includes('Asia/Kolkata') ||
            timezone === 'Asia/Kolkata') {
          return 'INR';
        }

        // 2. Check browser locale
        const locale = navigator.language;
        if (locale.includes('en-IN') ||
            locale.includes('hi-IN') ||
            locale.includes('hi') ||
            locale.startsWith('en-IN')) {
          return 'INR';
        }

        // 3. Check all available locales
        const locales = navigator.languages || [navigator.language];
        for (const loc of locales) {
          if (loc.includes('IN') || loc.includes('hi')) {
            return 'INR';
          }
        }

        // Default to USD for all other regions
        return 'USD';
      } catch (error) {
        console.error('Currency detection error:', error);
        return 'USD'; // Safe fallback
      }
    };

    const detectedCurrency = detectCurrency();
    setCurrency(detectedCurrency);

    // Log for debugging (remove in production if needed)
    console.log('Detected currency:', detectedCurrency);
  }, []);

  return currency;
}
