# Automatic Currency Detection

## Overview

The subscription system automatically detects the user's location and displays the appropriate pricing without requiring manual currency selection.

## How It Works

### Detection Logic

The system uses multiple signals to determine the user's location:

1. **Timezone Detection** (Primary)
   - Checks `Intl.DateTimeFormat().resolvedOptions().timeZone`
   - If timezone is `Asia/Kolkata` or `Asia/Calcutta` → **INR**

2. **Browser Locale** (Secondary)
   - Checks `navigator.language`
   - If locale includes `en-IN`, `hi-IN`, or `hi` → **INR**

3. **Language Preferences** (Tertiary)
   - Checks `navigator.languages` array
   - If any locale includes `IN` or `hi` → **INR**

4. **Default Fallback**
   - If none of the above match → **USD**

### Pricing Display

**India Users (INR):**
- See: ₹299/month
- Charged in Indian Rupees (₹)
- Razorpay processes in INR

**All Other Users (USD):**
- See: $9.99/month
- Charged in US Dollars ($)
- Razorpay processes in USD

## User Experience

### What Users See

1. **Subscription Page** (`/subscription`)
   - Automatically shows one price based on location
   - No currency selector visible
   - Seamless experience

2. **Upgrade Prompts**
   - Show localized pricing
   - India users see ₹299
   - Others see $9.99

3. **Profile/Subscription Management**
   - Displays amount in subscribed currency
   - Shows correct symbol ($ or ₹)

### Example Flow

**User in India:**
1. Opens `/subscription`
2. Sees "₹299/month" for Premium
3. Clicks upgrade
4. Razorpay checkout opens with INR pricing
5. Completes payment in INR

**User in USA:**
1. Opens `/subscription`
2. Sees "$9.99/month" for Premium
3. Clicks upgrade
4. Razorpay checkout opens with USD pricing
5. Completes payment in USD

## Technical Implementation

### Hook: `useDetectCurrency()`

Location: `src/components/pricing/currency-selector.tsx`

```typescript
const currency = useDetectCurrency(); // Returns 'USD' or 'INR'
```

### Usage in Components

**Subscription Page:**
```typescript
const currency = useDetectCurrency();
// Automatically passes correct currency to Razorpay
```

**Upgrade Prompt:**
```typescript
const currency = useDetectCurrency();
const pricing = SUBSCRIPTION_PRICING[currency].monthly;
// Shows: pricing.display → "$9.99" or "₹299"
```

**Pricing Card:**
```typescript
// Receives currency prop, displays single price
<PricingCard currency={currency} />
```

## Configuration

Pricing is configured in `src/lib/razorpay-config.ts`:

```typescript
export const SUBSCRIPTION_PRICING = {
  USD: {
    monthly: {
      amount: 999,        // $9.99 in cents
      currency: 'USD',
      display: '$9.99',
    },
  },
  INR: {
    monthly: {
      amount: 29900,      // ₹299 in paise
      currency: 'INR',
      display: '₹299',
    },
  },
};
```

## Testing

### Test Indian User
Set your browser/system to:
- Timezone: Asia/Kolkata
- Language: English (India)

Expected: See ₹299

### Test US User
Set your browser/system to:
- Timezone: America/New_York (or any non-India)
- Language: English (US)

Expected: See $9.99

### Manual Testing
You can temporarily modify the detection logic for testing:
```typescript
// In useDetectCurrency hook, force a currency:
return 'INR'; // or 'USD'
```

## Debugging

The detection logic logs the detected currency to console:
```
Detected currency: INR
```
or
```
Detected currency: USD
```

Check browser console to verify correct detection.

## Edge Cases Handled

1. **VPN Users**: Will see pricing based on timezone/locale settings, not actual VPN location
2. **Travelers**: Will see pricing based on their device settings
3. **Detection Failure**: Safely falls back to USD
4. **Multiple Locales**: Checks all language preferences

## Future Enhancements

Potential improvements:
1. **IP-based Geolocation**: Use IP lookup for more accurate detection
2. **User Preference**: Allow users to manually select currency (if needed)
3. **More Currencies**: Add EUR, GBP, etc.
4. **Currency Conversion**: Show equivalent prices in other currencies

## Best Practices

1. **Always show one price**: Don't confuse users with multiple currency options
2. **Match Razorpay currency**: Ensure detected currency matches Razorpay plan
3. **Clear display**: Use proper currency symbols ($ vs ₹)
4. **Consistent experience**: Same currency throughout the flow

## Support

If users see wrong currency:
1. Check their timezone settings
2. Check browser language preferences
3. Verify Razorpay plan IDs are correct for each currency
4. Check console logs for detection output
