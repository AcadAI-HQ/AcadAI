import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <h1 className="text-4xl font-headline font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-headline font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Acad AI's services, you accept and agree to be bound by the terms and provisions
              of this agreement. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Acad AI provides AI-powered learning roadmap generation and educational planning services. Our services include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Comprehensive learning roadmaps for various technology domains</li>
              <li>User profile management and progress tracking</li>
              <li>AI-powered hyperpersonalization (Premium feature)</li>
              <li>Interactive AI chat assistant for learning support (Premium feature)</li>
              <li>Curated resources and learning materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To use certain features of our service, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You must be at least 13 years old to use our services. If you are under 18, you must have parental consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold mb-4">4. Subscription and Payments</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">4.1 Free Tier</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Free users have access to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Comprehensive learning roadmaps for all available domains</li>
              <li>User profile management</li>
              <li>Basic progress tracking</li>
              <li>Monthly curated resources</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Premium Tier</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Premium subscriptions provide access to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>AI-powered hyperpersonalized roadmaps</li>
              <li>Interactive AI chat assistant</li>
              <li>Priority support</li>
              <li>Weekly curated resources</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.3 Payment Terms</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Subscriptions are billed on a recurring basis (monthly or annual)</li>
              <li>All payments are processed securely through our payment provider</li>
              <li>Prices are subject to change with 30 days notice</li>
              <li>Refunds are provided in accordance with our refund policy (see section 5)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold mb-4">5. Cancellation and Refunds</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You may cancel your subscription at any time. Upon cancellation:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>You will retain access to premium features until the end of your current billing period</li>
              <li>No refunds will be provided for partial months or years</li>
              <li>Your account will automatically revert to the free tier</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We offer a 7-day money-back guarantee for first-time subscribers. To request a refund, contact us
              at support@acadai.com within 7 days of your initial purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold mb-4">6. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Use the service for any illegal purpose or in violation of any laws</li>
              <li>Violate or infringe the rights of others</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Transmit viruses, malware, or other malicious code</li>
              <li>Scrape, copy, or redistribute our content without permission</li>
              <li>Use automated systems to access the service without our consent</li>
              <li>Impersonate any person or entity</li>
              <li>Harass, abuse, or harm other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              All content, features, and functionality of Acad AI, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Roadmap content and structure</li>
              <li>Software, code, and algorithms</li>
              <li>Design, graphics, and user interface</li>
              <li>Text, images, and other materials</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              are owned by Acad AI or our licensors and are protected by copyright, trademark, and other intellectual
              property laws. You may not reproduce, distribute, or create derivative works without our express permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold mb-4">8. User-Generated Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of any content you submit to our service (profile information, feedback, etc.).
              However, by submitting content, you grant us a non-exclusive, worldwide, royalty-free license to use,
              display, and process your content to provide and improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold mb-4">9. AI-Generated Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service uses AI (Google Gemini) to generate personalized roadmaps and provide chat assistance.
              While we strive for accuracy, AI-generated content may contain errors or inaccuracies. The content
              is provided for educational purposes and should not be considered professional advice. You are
              responsible for verifying information and making your own decisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold mb-4">10. Third-Party Links and Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service may contain links to third-party websites and resources. We are not responsible for the
              content, accuracy, or practices of these external sites. Accessing third-party content is at your
              own risk and subject to their terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold mb-4">11. Disclaimers and Limitations of Liability</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">11.1 Service Availability</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We provide our service "as is" and "as available" without warranties of any kind. We do not guarantee
              that our service will be uninterrupted, secure, or error-free.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">11.2 Limitation of Liability</h3>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, Acad AI shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred
              directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting
              from your use of our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold mb-4">12. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless Acad AI and its officers, directors, employees, and agents
              from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your
              use of our service or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold mb-4">13. Data Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your use of our service is also governed by our{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              . Please review our Privacy Policy to understand how we collect, use, and protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold mb-4">14. Modifications to Service and Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify or discontinue our service (or any part thereof) at any time with or
              without notice. We may also update these terms from time to time. Continued use of the service after
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold mb-4">15. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may suspend or terminate your account and access to our service at our sole discretion, without
              notice, for conduct that we believe violates these terms or is harmful to other users, us, or third
              parties, or for any other reason.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold mb-4">16. Governing Law and Disputes</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of the jurisdiction in
              which Acad AI operates, without regard to its conflict of law provisions. Any disputes arising from
              these terms or your use of our service shall be resolved through binding arbitration or in the courts
              of that jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold mb-4">17. Severability</h2>
            <p className="text-muted-foreground leading-relaxed">
              If any provision of these terms is found to be invalid or unenforceable, the remaining provisions
              will remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold mb-4">18. Entire Agreement</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms, together with our Privacy Policy, constitute the entire agreement between you and Acad AI
              regarding your use of our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-headline font-bold mb-4">19. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Email: legal@acadai.com</p>
              <p className="text-muted-foreground">Support: support@acadai.com</p>
              <p className="text-muted-foreground">Website: https://acadai.com</p>
            </div>
          </section>

          <div className="mt-12 p-6 bg-muted/30 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              By using Acad AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
