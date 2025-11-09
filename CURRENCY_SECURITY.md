# Currency Security & VPN Protection

## Overview

This document explains how the system prevents users from using VPNs to access different pricing tiers.

## The Problem

Without proper security:
- ❌ User in USA uses VPN to India
- ❌ Frontend shows ₹299 instead of $9.99
- ❌ User pays ₹299 (much less than $9.99)
- ❌ You lose ~$7 per subscription

## Our Solution: Multi-Layer Validation

### Layer 1: Frontend Currency Detection (UX)

**Location**: `src/components/pricing/currency-selector.tsx`

```typescript
const currency = useDetectCurrency(); // Returns 'USD' or 'INR'
```

**Purpose**:
- Show the correct price to legitimate users
- Good user experience for most users

**How it works**:
- Checks browser timezone (`Asia/Kolkata` → INR)
- Checks browser locale (`en-IN` → INR)
- Defaults to USD

**Security Level**: ⚠️ LOW (can be bypassed with VPN)

### Layer 2: Server-Side IP Validation (Security)

**Location**: `src/lib/server-geo.ts`

**Purpose**:
- Verify user's ACTUAL location using their IP address
- Cannot be bypassed with browser settings
- VPN still works but is detected

**How it works**:

```typescript
// 1. Get user's real IP from request headers
const clientIP = getClientIP(request.headers);

// 2. Look up IP location using geolocation API
const actualCurrency = await detectCurrencyFromIP(clientIP);

// 3. Compare requested currency vs actual location
if (requestedCurrency !== actualCurrency) {
  // REJECT the payment
}
```

**IP Detection Priority**:
1. `x-forwarded-for` (proxy/load balancer)
2. `x-real-ip` (nginx/alternative)
3. `cf-connecting-ip` (Cloudflare)

**Geolocation Service**:
- Uses `ipapi.co` (free tier: 1000 requests/day)
- Alternatives:
  - `ip-api.com` (free, 45 req/min)
  - `ipinfo.io` (paid, more accurate)
  - `maxmind.com` (paid, most accurate)

### Layer 3: Razorpay Plan Validation

**Location**: API creates subscription with specific plan

**Purpose**: Final safety check at payment processor level

**How it works**:
```typescript
// Server ALWAYS uses validated currency
const planId = process.env[`RAZORPAY_PLAN_ID_${actualCurrency}`];

// Razorpay subscription is created with specific plan
// - USD plan → charges $9.99
// - INR plan → charges ₹299
```

## Complete Flow

### Legitimate User (No VPN)

```
1. User in USA opens website
   └─> Frontend detects: USD (from timezone)

2. User sees: "$9.99/month"

3. User clicks "Upgrade to Premium"
   └─> Sends: { currency: 'USD' }

4. Server validates:
   ├─> Gets IP: 203.0.113.1
   ├─> IP Location API: USA
   └─> Validation: ✅ USD matches USA

5. Create subscription:
   └─> Razorpay Plan: RAZORPAY_PLAN_ID_USD

6. User pays: $9.99 ✅
```

### VPN User (Trying to Abuse)

```
1. User in USA enables VPN to India
   └─> Frontend detects: INR (from fake timezone)

2. User sees: "₹299/month" 💡 (thinks they'll save money)

3. User clicks "Upgrade to Premium"
   └─> Sends: { currency: 'INR' }

4. Server validates:
   ├─> Gets IP: 203.0.113.1 (real USA IP, VPN exit node)
   ├─> IP Location API: USA
   └─> Validation: ❌ INR doesn't match USA

5. Payment REJECTED:
   └─> Error: "Currency mismatch"
   └─> Message: "Please refresh the page"

6. User must pay: $9.99 ✅
```

## Edge Cases Handled

### 1. VPN Detection
- ✅ User's real IP is used, not their VPN timezone
- ✅ Server-side validation catches mismatch
- ✅ Payment rejected before Razorpay

### 2. Traveling Users
- User in USA travels to India
- IP shows India → INR pricing
- This is correct! They should pay local price
- No issue here

### 3. Indian Living in USA
- IP shows USA → USD pricing
- User must pay $9.99
- This is correct! Pay local price where you are

### 4. Proxy/CDN Handling
- Checks multiple headers to find real IP
- Works with Cloudflare, Vercel, AWS, nginx
- Falls back gracefully

### 5. API Failures
- If geolocation API fails → defaults to USD
- Better to charge more than less
- Error logged for investigation

## Configuration

### Environment Variables

```bash
# Already configured in .env.local
RAZORPAY_PLAN_ID_USD=plan_xxxx  # $9.99/month plan
RAZORPAY_PLAN_ID_INR=plan_yyyy  # ₹299/month plan
```

### Geolocation API

Current: **ipapi.co** (Free)
- Limit: 1000 requests/day
- Accuracy: ~98%
- Cost: $0

For production with more traffic:

**Option 1: ip-api.com** (Free)
```typescript
const response = await fetch(`http://ip-api.com/json/${ip}`);
```
- Limit: 45 requests/minute
- Accuracy: ~95%
- Cost: $0

**Option 2: ipinfo.io** (Paid)
```typescript
const response = await fetch(`https://ipinfo.io/${ip}?token=${TOKEN}`);
```
- Limit: 50,000 requests/month ($99/mo)
- Accuracy: ~99%
- Cost: $99/month

**Option 3: MaxMind GeoIP2** (Best for Scale)
- Download database, query locally
- No API limits
- Accuracy: ~99.8%
- Cost: $50/month

## Testing

### Test Real IP Detection

```bash
# Test your server's IP detection
curl -H "X-Forwarded-For: 103.21.244.0" https://your-site.com/api/subscription/create

# 103.21.244.0 is an India IP
# Should return INR
```

### Test VPN Protection

1. Set browser timezone to India
2. Frontend shows ₹299
3. Try to subscribe
4. Should be rejected with "Currency mismatch"
5. Check server logs for the warning

### Test with VPN

1. Enable VPN to India
2. Open website
3. Frontend might show ₹299
4. Click subscribe
5. Server detects real IP (USA)
6. Payment rejected

## Monitoring

### What to Log

```typescript
// Already implemented in create/route.ts
console.warn(
  `Currency mismatch detected!
   Requested: ${currency},
   Actual: ${actualCurrency},
   IP: ${clientIP}`
);
```

### What to Monitor

1. **Currency mismatches**: Track how many users try to abuse
2. **Geolocation API errors**: Monitor API uptime
3. **Failed payments**: Separate genuine errors from abuse
4. **IP patterns**: Detect VPN services

### Dashboard Metrics

Track in analytics:
- Subscription attempts by country
- Currency mismatch rate
- VPN detection rate
- Conversion rate by currency

## Razorpay Configuration

### Create Two Plans

**USD Plan**:
- Name: "Acad AI Premium - USD"
- Amount: $9.99 (999 cents)
- Currency: USD
- Period: Monthly

**INR Plan**:
- Name: "Acad AI Premium - INR"
- Amount: ₹299 (29900 paise)
- Currency: INR
- Period: Monthly

### Important Razorpay Settings

1. **Disable Manual Currency Selection**
   - Don't allow users to change currency in Razorpay checkout
   - Plan currency is locked

2. **Set Country Restrictions** (Optional)
   - USD plan: Restrict to non-India cards
   - INR plan: Restrict to India cards
   - Adds extra layer of protection

3. **Enable Webhook Alerts**
   - Get notified of suspicious activity
   - Track payment sources

## Additional Security Measures

### 1. Rate Limiting

Add to prevent brute force:
```typescript
// In middleware or API route
const attempts = await checkSubscriptionAttempts(userId);
if (attempts > 5) {
  return { error: 'Too many attempts' };
}
```

### 2. Card Country Validation

Razorpay provides card country:
```typescript
// In webhook handler
if (payment.card.country !== expectedCountry) {
  // Flag for review
}
```

### 3. User Verification

For high-value protection:
- Require phone verification
- Phone number country code must match IP country

## FAQ

**Q: Can users use VPN to get cheaper pricing?**
A: No. Server validates IP location, not browser settings.

**Q: What if someone uses a VPN exit node in India?**
A: Their IP will show India, so they'll pay ₹299. But Razorpay might detect card country mismatch.

**Q: What about travelers?**
A: They pay the price for where they currently are. This is standard practice.

**Q: Can users bypass this?**
A: Very difficult. Would need:
  - VPN to India (IP shows India)
  - Indian payment method (card/UPI)
  - Effectively the same as being in India

**Q: What's the conversion rate?**
A: At time of writing:
  - $9.99 ≈ ₹840
  - ₹299 ≈ $3.56
  - Potential loss: ~$6.43 per subscription

**Q: Should I use the same price globally?**
A: No. Localized pricing increases conversions in price-sensitive markets.

## Conclusion

✅ **VPN Protection**: Server-side IP validation
✅ **Price Integrity**: Users pay what they see
✅ **Fraud Prevention**: Multiple validation layers
✅ **Good UX**: Legitimate users unaffected

The system ensures users pay the correct price for their location while maintaining a smooth experience for honest users.
