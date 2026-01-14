# Firebase Service Account Setup Guide

## What is a Firebase Service Account?

A Firebase Service Account is a credential file that allows your server-side code (webhooks, API routes) to authenticate with Firebase and perform admin operations like updating user data in Firestore.

**Why you need it:** When a user pays through DodoPayments, the webhook needs to update their Firestore subscription status. Without this file, the webhook can't access Firestore, so users would pay but never get premium access.

---

## Step 1: Download the Service Account

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **acadai-a5294**
3. Click the **⚙️ gear icon** → **Project Settings**
4. Click the **Service Accounts** tab
5. Click **"Generate new private key"** button
6. Click **"Generate key"** in the confirmation dialog
7. A JSON file will download automatically

---

## Step 2: Save the File Locally

1. Rename the downloaded file to: `firebase-service-account.json`
2. Move it to: `backend/firebase-service-account.json` (in your project root)

```bash
# Your project structure should look like:
AcadAI/
├── backend/
│   └── firebase-service-account.json  ← Put it here
├── src/
├── public/
└── ...
```

**IMPORTANT:** This file is already in `.gitignore` - never commit it to git!

---

## Step 3: Production Deployment

For production (Vercel/Netlify/etc.), **don't upload the JSON file**. Instead:

1. Open the `firebase-service-account.json` file
2. Copy the **entire JSON content**
3. In your hosting platform (Vercel/Netlify), add this environment variable:

```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"acadai-a5294",...entire JSON content...}
```

Remove the `FIREBASE_SERVICE_ACCOUNT_PATH` variable in production - only use `FIREBASE_SERVICE_ACCOUNT`.

---

## Step 4: Configure DodoPayments Webhook

In your [DodoPayments Dashboard](https://app.dodopayments.com):

1. Go to **Developer** → **Webhooks**
2. Add a new webhook endpoint:
   - **URL:** `https://acadai.org/api/webhook/dodo-payments`
   - **Events:** Select all subscription events:
     - `subscription.active`
     - `subscription.cancelled`
     - `subscription.expired`
     - `subscription.failed`
     - `subscription.renewed`
3. Save and note the **webhook secret** (already in your `.env.local`)

---

## Verification

After setting up the service account, test the payment flow:

1. Sign up with a test email
2. Go through checkout with test card
3. Check if the webhook updates your user's subscription in Firestore
4. Verify you can access the dashboard after payment

### Test Cards for DodoPayments:
- **Success:** `4242 4242 4242 4242` (any future expiry, any CVV)
- **Decline:** `4000 0000 0000 0002`

---

## Troubleshooting

**Error: "Failed to initialize Firebase Admin"**
- Check that `firebase-service-account.json` exists in the `backend/` folder
- Verify the JSON file is valid (should start with `{"type":"service_account"...`)

**Webhook not updating subscriptions:**
- Verify webhook URL is configured in DodoPayments dashboard
- Check webhook secret matches in `.env.local`
- View webhook logs in DodoPayments dashboard to see if they're being received

**Users pay but don't get access:**
- Service account file is missing or invalid
- Webhook URL is wrong
- Firestore rules might be blocking writes (they're correct in your setup)

---

## Security Notes

✅ **DO:**
- Keep `firebase-service-account.json` in `.gitignore`
- Use environment variables in production
- Rotate the service account key periodically (generate new one)

❌ **DON'T:**
- Commit the service account file to git
- Share the file publicly
- Include it in client-side code
- Deploy it to static hosting

---

**Need help?** Check the Firebase Admin SDK docs: https://firebase.google.com/docs/admin/setup
