/**
 * Server-side geolocation detection
 * Uses IP address to determine user's actual location
 */

export async function detectCurrencyFromIP(ip: string): Promise<'USD' | 'INR'> {
  // Dev/testing override: force a currency regardless of geo (useful when running on localhost)
  const forced = (process.env.DODO_FORCE_CURRENCY || '').toUpperCase();
  if (forced === 'INR' || forced === 'USD') {
    return forced as 'USD' | 'INR';
  }

  try {
    // Local/dev IPs often resolve to ::1/127.0.0.1/0.0.0.0 and break geo lookups.
    // Prefer INR locally for IST testing if no explicit override provided.
    if (ip === '::1' || ip === '127.0.0.1' || ip === '0.0.0.0') {
      return 'INR';
    }

    // Use a free IP geolocation service (you can also use paid services for better accuracy)
    // Options: ipapi.co, ip-api.com, ipinfo.io
    const response = await fetch(`https://ipapi.co/${ip}/json/`);

    if (!response.ok) {
      console.error('IP geolocation failed, defaulting to USD');
      return 'USD';
    }

    const data = await response.json();
    const countryCode = data.country_code;

    // India uses INR, everything else uses USD
    if (countryCode === 'IN') {
      return 'INR';
    }

    return 'USD';
  } catch (error) {
    console.error('Error detecting currency from IP:', error);
    // Default to USD on error
    return 'USD';
  }
}

/**
 * Get client IP from request headers
 * Works with various proxy/CDN setups
 */
export function getClientIP(headers: Headers): string {
  // Check common headers in order of preference
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, use the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback - this shouldn't happen in production with a proper setup
  return '0.0.0.0';
}

/**
 * Validate that the requested currency matches the user's location
 * Prevents VPN abuse
 */
export async function validateCurrency(
  requestedCurrency: 'USD' | 'INR',
  ip: string
): Promise<{ valid: boolean; actualCurrency: 'USD' | 'INR' }> {
  const actualCurrency = await detectCurrencyFromIP(ip);

  return {
    valid: requestedCurrency === actualCurrency,
    actualCurrency,
  };
}
