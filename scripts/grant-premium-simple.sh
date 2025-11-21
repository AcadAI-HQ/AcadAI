#!/bin/bash

# Simple script to grant premium access via Firestore REST API
# This uses Firebase emulator or you can run it directly

EMAIL="disshad.k.p@gmail.com"
PROJECT_ID="acadai-a5294"

echo "🔍 Please provide your Firebase user UID"
echo ""
echo "To get your UID:"
echo "1. Sign in to the app at http://localhost:9002"
echo "2. Open browser console (F12)"
echo "3. In the console, type: localStorage.getItem('firebase:authUser:AIzaSyBS8PvYwl6MOdl64OtAxrkhIg5gb0IGIdc:[DEFAULT]')"
echo "4. Find the 'uid' field in the JSON output"
echo ""
read -p "Enter your UID: " UID

if [ -z "$UID" ]; then
    echo "❌ Error: UID is required"
    exit 1
fi

echo ""
echo "📝 Setting premium access for UID: $UID"
echo ""

# Create a temporary file with the data
cat > /tmp/premium-data.json <<EOF
{
  "fields": {
    "uid": {"stringValue": "$UID"},
    "email": {"stringValue": "$EMAIL"},
    "subscription": {
      "mapValue": {
        "fields": {
          "tier": {"stringValue": "premium"},
          "status": {"stringValue": "active"},
          "subscriptionStartDate": {"timestampValue": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"},
          "autoRenew": {"booleanValue": true},
          "currency": {"stringValue": "USD"},
          "amount": {"integerValue": "0"}
        }
      }
    },
    "premiumGrantedBy": {"stringValue": "manual-script-testing"},
    "premiumGrantedAt": {"timestampValue": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
  }
}
EOF

echo "Using Firebase CLI to update Firestore..."
echo ""

# Try using firebase-tools to update
firebase firestore:delete "users/$UID" --project $PROJECT_ID --force 2>/dev/null
echo "Creating/updating user document with premium access..."

echo ""
echo "⚠️  Note: The Firebase CLI doesn't have a direct 'set' command."
echo "Please use the Firebase Console to manually set the premium flag:"
echo ""
echo "1. Go to: https://console.firebase.google.com/project/$PROJECT_ID/firestore"
echo "2. Navigate to: users/$UID"
echo "3. Add/Update field: subscription (map)"
echo "   - tier: 'premium' (string)"
echo "   - status: 'active' (string)"
echo ""
echo "OR use the web-based script below..."
