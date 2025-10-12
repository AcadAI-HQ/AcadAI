/**
 * Script to send email verification to existing users who haven't verified their accounts
 *
 * Usage:
 * 1. Make sure you have firebase-admin installed: npm install firebase-admin
 * 2. Download your Firebase service account key from Firebase Console
 * 3. Set FIREBASE_SERVICE_ACCOUNT_PATH environment variable to the path of your service account JSON file
 * 4. Run: npx tsx scripts/send-verification-emails.ts
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin SDK
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
  console.error('❌ Error: FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not set');
  console.log('Please set it to the path of your Firebase service account JSON file');
  console.log('Example: export FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json');
  process.exit(1);
}

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Error: Service account file not found at: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

interface EmailVerificationResult {
  email: string;
  success: boolean;
  error?: string;
}

async function sendVerificationEmails() {
  console.log('🚀 Starting email verification process...\n');

  const results: EmailVerificationResult[] = [];
  let processedCount = 0;
  let sentCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  try {
    // List all users
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users;

    console.log(`📊 Found ${users.length} total users in the system\n`);

    for (const user of users) {
      processedCount++;
      const email = user.email || 'no-email';

      // Skip users who are already verified
      if (user.emailVerified) {
        console.log(`⏭️  [${processedCount}/${users.length}] Skipped ${email} (already verified)`);
        skippedCount++;
        results.push({ email, success: true });
        continue;
      }

      // Skip users without email (shouldn't happen, but be safe)
      if (!user.email) {
        console.log(`⏭️  [${processedCount}/${users.length}] Skipped user ${user.uid} (no email)`);
        skippedCount++;
        results.push({ email: 'no-email', success: false, error: 'No email address' });
        continue;
      }

      try {
        // Generate email verification link
        const link = await admin.auth().generateEmailVerificationLink(user.email);

        console.log(`✅ [${processedCount}/${users.length}] Generated verification link for ${email}`);
        console.log(`   Link: ${link}`);

        sentCount++;
        results.push({ email, success: true });

        // Note: Firebase Admin SDK only generates the link. You need to send it via your email service
        // If you want to automatically send emails, you'll need to integrate with an email service like:
        // - SendGrid
        // - Mailgun
        // - AWS SES
        // - Resend
        // For now, we're just logging the links

      } catch (error: any) {
        console.error(`❌ [${processedCount}/${users.length}] Failed for ${email}: ${error.message}`);
        errorCount++;
        results.push({ email, success: false, error: error.message });
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total users processed: ${processedCount}`);
    console.log(`✅ Already verified: ${skippedCount}`);
    console.log(`📧 Verification links generated: ${sentCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('='.repeat(60));

    // Write results to a file
    const outputPath = path.join(process.cwd(), 'verification-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Detailed results saved to: ${outputPath}`);

    // Write links to a file for manual email sending
    if (sentCount > 0) {
      const linksPath = path.join(process.cwd(), 'verification-links.txt');
      const linksContent = results
        .filter(r => r.success && !r.error)
        .map(r => `${r.email}: Check console output for link`)
        .join('\n');

      console.log(`\n⚠️  IMPORTANT: To actually send these emails, you need to:`);
      console.log(`1. Integrate an email service (SendGrid, Mailgun, AWS SES, etc.)`);
      console.log(`2. Use the generated links from the console output`);
      console.log(`3. Or use Firebase's built-in email templates (requires additional setup)`);
    }

  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Alternative: Send verification emails using Firebase Auth directly (client-side approach)
// This requires users to be logged in, so we export this as a separate function
export async function sendVerificationEmailToCurrentUser() {
  console.log('\n' + '='.repeat(60));
  console.log('ALTERNATIVE APPROACH: Client-Side Verification');
  console.log('='.repeat(60));
  console.log('\nIf you want to send verification emails to already-signed-up users,');
  console.log('you can add a "Resend Verification Email" button in your UI that calls:');
  console.log('\n```typescript');
  console.log('import { sendEmailVerification } from "firebase/auth";');
  console.log('import { auth } from "@/lib/firebase";');
  console.log('');
  console.log('const user = auth.currentUser;');
  console.log('if (user && !user.emailVerified) {');
  console.log('  await sendEmailVerification(user);');
  console.log('  alert("Verification email sent!");');
  console.log('}');
  console.log('```\n');
}

// Run the script
sendVerificationEmails()
  .then(() => {
    sendVerificationEmailToCurrentUser();
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
