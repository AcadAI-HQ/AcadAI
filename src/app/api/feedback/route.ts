import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { adminAuth } from '@/lib/firebase-admin';

const resend = new Resend(process.env.RESEND_API_KEY);

const FEEDBACK_EMAIL = 'bhaskarjyotipathak8@gmail.com';

// Rate limiting: track requests per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // max requests
const RATE_WINDOW = 60 * 1000; // per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

// Sanitize user input to prevent XSS in emails
function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const feedbackTypeLabels: Record<string, string> = {
  general: 'General Feedback',
  feature: 'Feature Request',
  domain: 'Domain Request',
  bug: 'Bug Report',
};

export async function POST(req: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
               req.headers.get('x-real-ip') ||
               'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    try {
      if (!adminAuth) {
        return NextResponse.json(
          { error: 'Server auth not configured' },
          { status: 500 }
        );
      }
      await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, subject, message, userEmail, userName } = body;

    // Validate required fields
    if (!type || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate feedback type
    if (!['general', 'feature', 'domain', 'bug'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid feedback type' },
        { status: 400 }
      );
    }

    // Sanitize all user inputs to prevent XSS
    const safeSubject = sanitizeHtml(subject);
    const safeMessage = sanitizeHtml(message);
    const safeUserName = userName ? sanitizeHtml(userName) : '';
    const safeUserEmail = userEmail ? sanitizeHtml(userEmail) : '';

    const feedbackTypeLabel = feedbackTypeLabels[type];
    const submitterInfo = safeUserName
      ? `${safeUserName} (${safeUserEmail})`
      : safeUserEmail || 'Anonymous';

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Acad AI Feedback <feedback@resend.dev>',
      to: [FEEDBACK_EMAIL],
      replyTo: userEmail || undefined,
      subject: `[${feedbackTypeLabel}] ${safeSubject}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #29ABE2 0%, #8E2DE2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Acad AI Feedback</h1>
          </div>

          <div style="background: #1a1a1a; padding: 30px; border-radius: 0 0 10px 10px; color: #e0e0e0;">
            <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 5px 0; color: #888; font-size: 12px; text-transform: uppercase;">Feedback Type</p>
              <p style="margin: 0; color: #29ABE2; font-weight: bold; font-size: 16px;">${feedbackTypeLabel}</p>
            </div>

            <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 5px 0; color: #888; font-size: 12px; text-transform: uppercase;">From</p>
              <p style="margin: 0; font-size: 16px;">${submitterInfo}</p>
            </div>

            <div style="background: #2a2a2a; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 5px 0; color: #888; font-size: 12px; text-transform: uppercase;">Subject</p>
              <p style="margin: 0; font-size: 16px; font-weight: bold;">${safeSubject}</p>
            </div>

            <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
              <p style="margin: 0 0 10px 0; color: #888; font-size: 12px; text-transform: uppercase;">Message</p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
            </div>
          </div>

          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
            This feedback was submitted via Acad AI Dashboard
          </p>
        </div>
      `,
      text: `
Acad AI Feedback

Type: ${feedbackTypeLabel}
From: ${submitterInfo}
Subject: ${safeSubject}

Message:
${safeMessage}

---
This feedback was submitted via Acad AI Dashboard
      `.trim(),
    });

    if (error) {
      console.error('[Feedback] Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send feedback email' },
        { status: 500 }
      );
    }

    console.log('[Feedback] Email sent successfully:', data?.id);

    return NextResponse.json({
      success: true,
      message: 'Feedback sent successfully'
    });
  } catch (error: any) {
    console.error('[Feedback] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
