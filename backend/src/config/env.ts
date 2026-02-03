// Environment configuration with validation
export interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  CORS_ORIGIN: string;

  // DodoPayments
  DODO_PAYMENTS_API_KEY: string;
  DODO_PAYMENTS_ENVIRONMENT: 'test_mode' | 'live_mode';
  DODO_PAYMENTS_WEBHOOK_SECRET: string;
  DODO_PAYMENTS_RETURN_URL: string;

  // Product IDs (server-side only - never expose to client)
  DODO_PRODUCT_PREMIUM_MONTHLY_USD: string;
  DODO_PRODUCT_PREMIUM_YEARLY_USD: string;
  DODO_PRODUCT_PREMIUM_MONTHLY_INR: string;
  DODO_PRODUCT_PREMIUM_YEARLY_INR: string;

  // Firebase
  FIREBASE_SERVICE_ACCOUNT_PATH: string;
}

function getEnv(name: string, required = true): string {
  const value = process.env[name];
  if (!value && required) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value || '';
}

export function loadEnvConfig(): EnvConfig {
  return {
    PORT: parseInt(process.env.PORT || '3001', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:9002',

    DODO_PAYMENTS_API_KEY: getEnv('DODO_PAYMENTS_API_KEY'),
    DODO_PAYMENTS_ENVIRONMENT: (process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode') || 'test_mode',
    DODO_PAYMENTS_WEBHOOK_SECRET: getEnv('DODO_PAYMENTS_WEBHOOK_SECRET'),
    DODO_PAYMENTS_RETURN_URL: getEnv('DODO_PAYMENTS_RETURN_URL'),

    DODO_PRODUCT_PREMIUM_MONTHLY_USD: getEnv('DODO_PRODUCT_PREMIUM_MONTHLY_USD'),
    DODO_PRODUCT_PREMIUM_YEARLY_USD: getEnv('DODO_PRODUCT_PREMIUM_YEARLY_USD'),
    DODO_PRODUCT_PREMIUM_MONTHLY_INR: getEnv('DODO_PRODUCT_PREMIUM_MONTHLY_INR'),
    DODO_PRODUCT_PREMIUM_YEARLY_INR: getEnv('DODO_PRODUCT_PREMIUM_YEARLY_INR'),

    FIREBASE_SERVICE_ACCOUNT_PATH: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json',
  };
}

// Server-side pricing configuration (never sent to client as-is)
// Prices in smallest currency unit (cents/paise)
export const PRICING_CONFIG = {
  USD: {
    monthly: { amount: 799, display: '7.99' },
    yearly: { amount: 7900, display: '79' },
  },
  INR: {
    monthly: { amount: 29900, display: '299' },
    yearly: { amount: 299900, display: '2999' },
  },
} as const;

export type Currency = keyof typeof PRICING_CONFIG;
export type Interval = 'monthly' | 'yearly';
