# Development Scripts

## Grant Premium Access (Testing)

Multiple methods to grant premium access to `disshad.k.p@gmail.com` for testing purposes.

### Method 1: Web UI (EASIEST) ⭐

1. Start the development server (if not running):
   ```bash
   npm run dev
   ```

2. Sign in to the app with `disshad.k.p@gmail.com`

3. Visit: **http://localhost:9002/dev/grant-premium**

4. Click the "Grant Premium Access" button

5. You'll be redirected to dashboard with premium access!

### Method 2: Browser Console

1. Sign in to the app at http://localhost:9002

2. Open browser console (F12 or Ctrl+Shift+I)

3. Copy and paste the contents of `grant-premium-browser.js` into the console

4. Press Enter

5. Refresh the page

### Method 3: Node.js Script (Requires Firebase Admin SDK)

If you have `firebase-service-account.json`:

```bash
# Install dependencies first
npm install

# Run the script with your email
node scripts/grant-premium.js disshad.k.p@gmail.com
```

### Method 4: Client SDK Script (Requires UID)

```bash
# Get your UID from browser console first:
# 1. Sign in to the app
# 2. Open console and type: firebase.auth().currentUser.uid
# 3. Copy the UID

node scripts/grant-premium-client.mjs <your-uid>
```

---

## What Gets Set

When you grant premium access, the following is added to your Firestore user document:

```json
{
  "subscription": {
    "tier": "premium",
    "status": "active",
    "subscriptionStartDate": "2025-11-16T...",
    "autoRenew": true,
    "currency": "USD",
    "amount": 0
  },
  "premiumGrantedAt": "timestamp",
  "premiumGrantedBy": "dev-testing"
}
```

---

## Security Notes

⚠️ **IMPORTANT FOR PRODUCTION:**

1. Delete the `/dev/grant-premium` page before deploying
2. Remove or restrict access to these scripts
3. The web UI only works for `disshad.k.p@gmail.com`
4. Scripts are development-only tools

---

## Troubleshooting

**"You must be signed in"**
- Sign in to the app first

**"Unauthorized email"**
- Only `disshad.k.p@gmail.com` can use these tools
- Check you're signed in with the correct account

**"Firebase not initialized"**
- Make sure the app is running
- Check `.env.local` has correct Firebase config

**Changes not showing**
- Hard refresh the page (Ctrl+Shift+R)
- Clear browser cache
- Check browser console for errors
