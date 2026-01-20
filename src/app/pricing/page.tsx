"use client";

import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BorderTrail } from '@/components/ui/border-trail';
import {
  Check,
  Sparkles,
  PlusIcon,
  ShieldCheckIcon,
  Brain,
  BookOpen,
  TrendingUp,
  Layers,
  Target,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { useGeoPricing } from '@/hooks/use-geo-pricing';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { trackCheckoutStarted } from '@/lib/analytics';

const CURRENT_FEATURES = [
  {
    icon: BookOpen,
    title: 'Industry-Standard Roadmaps',
    description: 'Structured learning paths across 14 tech domains - designed like professional training programs',
  },
  {
    icon: Sparkles,
    title: 'Weekly Curated Resources',
    description: 'Fresh articles, tutorials, videos, and projects delivered every week - saving you hours of research',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Monitor your completion across roadmap stages and see your growth over time',
  },
  {
    icon: Layers,
    title: 'Unlimited Domain Access',
    description: 'Switch between any tech domain anytime - explore Frontend today, ML tomorrow',
  },
  {
    icon: Target,
    title: 'Career-Focused Content',
    description: 'Learn what employers actually want - including testing, deployment, and production best practices',
  },
  {
    icon: Zap,
    title: 'Instant Access',
    description: 'Start learning immediately with no setup required - all content available from day one',
  },
];


// Helper to format domain names nicely
const formatDomain = (domain: string): string => {
  const domainMap: Record<string, string> = {
    'frontend': 'Frontend Development',
    'backend': 'Backend Development',
    'fullstack': 'Full Stack Development',
    'ml': 'Machine Learning',
    'devops': 'DevOps',
    'data-science': 'Data Science',
    'cybersecurity': 'Cybersecurity',
    'ui-ux': 'UI/UX Design',
    'product-engineering': 'Product Engineering',
    'game-dev-indie': 'Indie Game Development',
    'game-dev-aaa': 'AAA Game Development',
    'android': 'Android Development',
    'iOS': 'iOS Development',
    'blockchain': 'Blockchain Development',
  };
  return domainMap[domain] || domain;
};

const FAQS = [
  {
    question: 'What domains are covered?',
    answer: 'We cover 14 tech domains including Frontend, Backend, Full Stack, Machine Learning, DevOps, and more. Each roadmap provides comprehensive coverage from fundamentals to advanced topics, with industry-relevant tools and frameworks.',
  },
  {
    question: 'How often is the content updated?',
    answer: 'Roadmaps are regularly updated to reflect current industry standards and emerging technologies. Weekly learning resources are curated fresh each week to keep you aligned with market demands.',
  },
  {
    question: 'Can I access multiple roadmaps?',
    answer: 'Yes! Your subscription gives you unlimited access to all 14 roadmaps. Switch between any domain whenever you want.',
  },
  {
    question: 'What makes these roadmaps different?',
    answer: 'Our roadmaps are structured like professional training programs - covering not just what to learn, but the optimal order, practical projects, and real-world context. They include testing, deployment, and production considerations that most free resources skip.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, absolutely. Cancel anytime with no questions asked. Your access continues until the end of your billing period.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards including Visa, Mastercard, American Express, and Discover.',
  },
  {
    question: 'Can I suggest new roadmap topics?',
    answer: 'Definitely! We actively listen to user feedback. If there\'s a domain or specialization you\'d like covered, let us know and we\'ll prioritize based on demand.',
  },
];

type Interval = 'monthly' | 'yearly';

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { monthly, annual } = useGeoPricing();

  const handleCheckout = async (interval: Interval) => {
    try {
      // Track checkout initiation
      const currency = monthly.symbol === '₹' ? 'INR' : 'USD';
      trackCheckoutStarted(interval, currency);

      const token = await auth.currentUser?.getIdToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        headers['x-dev-uid'] = process.env.NEXT_PUBLIC_DEV_UID || 'dev_test_user';
        headers['x-dev-email'] = process.env.NEXT_PUBLIC_DEV_EMAIL || 'dev+test@acadai.dev';
        headers['x-dev-name'] = process.env.NEXT_PUBLIC_DEV_NAME || 'Dev Test';
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({ interval, currency }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to start checkout');
      window.location.href = data.checkout_url;
    } catch (e: any) {
      console.error(e);
      toast({
        title: 'Checkout failed',
        description: e?.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Brain className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl">Acad AI</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild variant="outline">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>


      {/* Pricing Section */}
      <section className="relative min-h-screen overflow-hidden py-24">
        <div className="mx-auto w-full max-w-6xl space-y-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-2xl space-y-5"
          >
            <div className="flex justify-center">
              <div className="rounded-lg border px-4 py-1 font-mono text-sm">Pricing</div>
            </div>

            {/* Personalized Hero for logged-in users */}
            {user && (user.interestedDomains?.length || user.lastGeneratedDomain) ? (
              <>
                <h1 className="text-center text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl font-headline">
                  Hey {user.displayName?.split(' ')[0] || 'there'}, ready to master{' '}
                  <span className="bg-gradient-to-r from-[#29ABE2] to-[#8E2DE2] bg-clip-text text-transparent">
                    {formatDomain(user.interestedDomains?.[0] || user.lastGeneratedDomain || '')}
                  </span>?
                </h1>
                <p className="text-muted-foreground text-center text-base md:text-lg">
                  {user.skills && user.skills.length > 0 ? (
                    <>
                      Build on your {user.skills.slice(0, 3).join(', ')} skills with our structured roadmap and weekly curated resources.
                    </>
                  ) : (
                    <>
                      Get unlimited access to your personalized roadmap and weekly curated resources to accelerate your journey.
                    </>
                  )}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-center text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl font-headline">
                  Master In-Demand Tech Skills
                </h1>
                <p className="text-muted-foreground text-center text-base md:text-lg">
                  Industry-standard roadmaps and curated resources to accelerate your career.
                  Join thousands of developers building real skills.
                </p>
              </>
            )}
          </motion.div>

          <div className="relative">
            <div
              className={cn(
                'z--10 pointer-events-none absolute inset-0 size-full',
                'bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)]',
                'bg-[size:32px_32px]',
                '[mask-image:radial-gradient(ellipse_at_center,black_10%,transparent)]',
              )}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto w-full max-w-2xl space-y-3"
            >
              <div className="grid md:grid-cols-2 bg-black relative border border-gray-800 p-4">
                <PlusIcon className="absolute -top-3 -left-3 size-5.5 text-gray-700" />
                <PlusIcon className="absolute -top-3 -right-3 size-5.5 text-gray-700" />
                <PlusIcon className="absolute -bottom-3 -left-3 size-5.5 text-gray-700" />
                <PlusIcon className="absolute -right-3 -bottom-3 size-5.5 text-gray-700" />

                {/* Monthly Plan */}
                <div className="w-full px-4 pt-5 pb-4 bg-black">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="leading-none font-semibold">Monthly</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">Pay month-to-month, cancel anytime</p>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#29ABE2]" />
                      <span>14 Industry-standard roadmaps</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#29ABE2]" />
                      <span>Weekly curated learning resources</span>
                    </li>
                  </ul>
                  <div className="mt-6 space-y-4">
                    <div className="text-muted-foreground flex items-end gap-0.5 text-xl">
                      <span>{monthly.symbol}</span>
                      <span className="text-foreground -mb-0.5 text-4xl font-extrabold tracking-tighter md:text-5xl">
                        {monthly.price}
                      </span>
                      <span>/month</span>
                    </div>
                    <Button
                      className="w-full bg-white text-black hover:bg-gray-200"
                      onClick={() => handleCheckout('monthly')}
                    >
                      Start Learning
                    </Button>
                  </div>
                </div>

                {/* Yearly Plan */}
                <div className="relative w-full rounded-lg border border-gray-800 px-4 pt-5 pb-4 bg-black">
                  <BorderTrail
                    className="bg-white"
                    style={{
                      boxShadow:
                        '0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)',
                    }}
                    size={100}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="leading-none font-semibold">Yearly</h3>
                      <Badge className="bg-[#29ABE2] text-white border-0">
                        <Sparkles className="h-3 w-3 mr-1 inline" />
                        Save {annual.savingsPercent}%
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">Best value - commit to your growth!</p>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#29ABE2]" />
                      <span>14 Industry-standard roadmaps</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#29ABE2]" />
                      <span>Weekly curated learning resources</span>
                    </li>
                  </ul>
                  <div className="mt-6 space-y-4">
                    <div className="text-muted-foreground flex items-end text-xl">
                      <span>{annual.symbol}</span>
                      <span className="text-foreground -mb-0.5 text-4xl font-extrabold tracking-tighter md:text-5xl">
                        {annual.price}
                      </span>
                      <span>/year</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      That's just <span className="text-[#29ABE2] font-semibold">
                        {annual.symbol}{annual.monthlyEquivalent}/month
                      </span>
                    </p>
                    <Button
                      className="w-full bg-[#29ABE2] text-white hover:bg-[#2196ce]"
                      onClick={() => handleCheckout('yearly')}
                    >
                      Get Started
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-muted-foreground flex items-center justify-center gap-x-2 text-sm">
                <ShieldCheckIcon className="size-4" />
                <span>Secure payment • Cancel anytime • All features included</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What's Included Now */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4" variant="secondary">
            <Check className="h-3 w-3 mr-1" />
            Available Now
          </Badge>
          <h2 className="text-4xl font-headline font-bold mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools and resources to accelerate your tech career
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {CURRENT_FEATURES.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>


      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-headline font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about the platform
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto space-y-4"
        >
          {FAQS.map((faq, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm md:text-base text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <Card className="border-2 border-primary">
            <CardContent className="pt-12 pb-12">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-6" />
              {user && (user.interestedDomains?.length || user.lastGeneratedDomain) ? (
                <>
                  <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
                    Start Your {formatDomain(user.interestedDomains?.[0] || user.lastGeneratedDomain || '')} Journey Today
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    {user.displayName?.split(' ')[0]}, your personalized roadmap is waiting.
                    Get instant access to structured learning paths and weekly resources.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
                    Ready to Accelerate Your Career?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Join developers worldwide who are building in-demand skills with industry-standard roadmaps
                    and curated weekly resources.
                  </p>
                </>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="text-lg px-8"
                  onClick={() => handleCheckout('yearly')}
                >
                  Get Started Now
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
                {!user && (
                  <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                    <Link href="/signup">Create Account</Link>
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Cancel anytime • Unlimited roadmaps • Weekly resources included
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Founder's Note - Small, humble section */}
      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">From the founder:</span> Acad AI started as a passion project to help students navigate tech careers.
            Your support keeps the platform running and the content fresh.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-headline font-semibold">Acad AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Acad AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
