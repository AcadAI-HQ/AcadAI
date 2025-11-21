#!/bin/bash

# Script to list premium users using Firebase CLI
# This exports all users and processes them locally

echo "Exporting user authentication data..."
firebase auth:export users-export.json --format=JSON --project acadai-a5294

echo ""
echo "Processing users..."

# Read the JSON and display user count
if [ -f "users-export.json" ]; then
    node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('users-export.json', 'utf8'));
    console.log('Total exported users:', data.users.length);
    console.log('');
    console.log('First 5 users:');
    data.users.slice(0, 5).forEach((user, i) => {
        console.log(\`\${i+1}. \${user.email} - UID: \${user.localId}\`);
    });
    "

    echo ""
    echo "✅ User export complete. File saved as users-export.json"
    echo "Note: This only exports auth data. For subscription info, we need Firestore access."
else
    echo "❌ Export failed"
fi
