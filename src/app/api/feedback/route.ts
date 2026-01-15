import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FEEDBACK_EMAIL = 'bhaskarjyotipathak8@gmail.com';

const feedbackTypeLabels: Record<string, string> = {
  general: 'General Feedback',
  feature: 'Feature Request',
  domain: 'Domain Request',
  bug: 'Bug Report',
};

export async function POST(req: NextRequest) {
  try {
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

    const feedbackTypeLabel = feedbackTypeLabels[type];
    const submitterInfo = userName
      ? `${userName} (${userEmail})`
      : userEmail || 'Anonymous';

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Acad AI Feedback <feedback@resend.dev>',
      to: [FEEDBACK_EMAIL],
      replyTo: userEmail || undefined,
      subject: `[${feedbackTypeLabel}] ${subject}`,
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
              <p style="margin: 0; font-size: 16px; font-weight: bold;">${subject}</p>
            </div>

            <div style="background: #2a2a2a; padding: 15px; border-radius: 8px;">
              <p style="margin: 0 0 10px 0; color: #888; font-size: 12px; text-transform: uppercase;">Message</p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
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
Subject: ${subject}

Message:
${message}

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
