"use client";

import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BorderTrail } from '@/components/ui/border-trail';
import {
  Check,
  Sparkles,
  PlusIcon,
  ShieldCheckIcon,
  Brain,
  MessageSquare,
  BookOpen,
  FileText,
  Clock,
  Heart,
  AlertCircle,
  Rocket,
  TrendingUp,
  X
} from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { useGeoPricing } from '@/hooks/use-geo-pricing';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const CURRENT_FEATURES = [
  {
    icon: BookOpen,
    title: 'Comprehensive Learning Roadmaps',
    description: 'Detailed, professional-level roadmaps for Frontend, Backend, Full Stack, ML, and DevOps',
  },
  {
    icon: Sparkles,
    title: 'Weekly Learning Resources',
    description: 'Curated articles, tutorials, videos, and projects delivered every week for your domain',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Track your learning journey and monitor completion across roadmap stages',
  },
  {
    icon: BookOpen,
    title: 'Unlimited Roadmap Access',
    description: 'Generate and access roadmaps for multiple domains without restrictions',
  },
];

const UPCOMING_FEATURES = [
  {
    icon: Brain,
    title: 'AI Hyperpersonalization',
    description: 'Roadmaps tailored to your background, goals, learning style, and available time',
    status: 'In Development',
  },
  {
    icon: MessageSquare,
    title: 'Interactive AI Assistant',
    description: '24/7 AI mentor to answer questions and guide you through your learning journey',
    status: 'Coming Soon',
  },
  {
    icon: FileText,
    title: 'AI ATS-Friendly Resume Builder',
    description: 'Create professional, ATS-optimized resumes powered by AI',
    status: 'Coming Soon',
  },
];

const FAQS = [
  {
    question: 'Why is there no free tier anymore?',
    answer: 'My co-founder recently exited the project. Together, we were able to foot the API costs for the market research features that powered the free tier. With his departure, I can no longer sustain these costs alone. This is temporary - I\'m working hard to bring the free tier back as soon as possible.',
  },
  {
    question: 'What happened to hyperpersonalization?',
    answer: 'Hyperpersonalization was the brainchild of my co-founder. With his exit, development has been delayed as I work to implement it on my own. To ensure you still get great value, I\'ve included weekly learning resources earlier than planned - a feature that was supposed to come with hyperpersonalization.',
  },
  {
    question: 'What do I get right now?',
    answer: 'You get comprehensive learning roadmaps for multiple tech domains, weekly curated learning resources (articles, tutorials, projects), progress tracking, and unlimited access to generate roadmaps. I wanted to make sure the paid tier offers real value beyond just roadmaps, but the roadmaps itself are worth what you\'ll be paying',
  },
  {
    question: 'What features are coming?',
    answer: 'I\'m actively working on AI Hyperpersonalization (tailored roadmaps based on your background and goals), an Interactive AI Assistant (24/7 mentor), and an AI ATS-Friendly Resume Builder.',
  },
  {
    question: 'Why should I pay now if features are delayed?',
    answer: 'The weekly learning resources alone provide significant value - curated content specific to your domain saves hours of searching. Plus, as I add hyperpersonalization and other AI features. I\'m keeping prices minimal so it\'s affordable for students worldwide.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'No free trial is offered because the platform has been completely free since September last year. Many users have already experienced the platform, and I wanted to be transparent about the changes rather than offer a limited trial.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes! You can cancel your subscription anytime. However, since there\'s currently no free tier, you\'ll lose access to the platform when your subscription ends. Once the free tier returns, you\'ll be able to downgrade instead.',
  },
  {
    question: 'What happens if I downgrade?',
    answer: 'Since there is currently no free tier available, downgrading means you\'ll lose access to the platform. I\'m working to bring back the free tier so users can continue using basic features even after cancellation.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover).',
  },
  {
    question: 'Why make it paid when a founder left?',
    answer: 'The API costs for market research and AI features are significant. Rather than shut down entirely, I chose to introduce affordable pricing to keep the platform running and continue development. I\'m committed to making this work and bringing back the free tier as soon as financially viable.',
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
        body: JSON.stringify({ interval }),
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

      {/* Important Update Banner */}
      <section className="border-b bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  A Message About Recent Changes
                </h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    My co-founder recently left the project. Together, we were splitting the API costs for market research features,
                    which allowed us to offer a free tier. Unfortunately, I cannot sustain these costs alone.
                  </p>
                  <p>
                    <strong className="text-foreground">This is temporary.</strong> I'm working hard to bring back the free tier.
                    In the meantime, I've kept pricing minimal so students worldwide can afford it. I've also included
                    <strong className="text-foreground"> weekly learning resources</strong> earlier than planned to ensure you get real value.
                  </p>
                  <p className="text-foreground font-medium">
                    Thank you for your understanding and continued support. - Founder
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative min-h-screen overflow-hidden py-24">
        <div className="mx-auto w-full max-w-6xl space-y-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-xl space-y-5"
          >
            <div className="flex justify-center">
              <div className="rounded-lg border px-4 py-1 font-mono text-sm">Pricing</div>
            </div>
            <h1 className="text-center text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl font-headline">
              Affordable Pricing for Students
            </h1>
            <p className="text-muted-foreground text-center text-base md:text-lg">
              Kept minimal so you can invest in your learning without breaking the bank.
              New features will be added at no extra cost.
            </p>
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
                  <div className="mt-10 space-y-4">
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
                        Save 15%
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">Best value - commit to your growth!</p>
                  </div>
                  <div className="mt-10 space-y-4">
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
                <span>Secure payment • Cancel anytime • Future features included free</span>
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
            What You Get Today
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real value from day one, with more features coming soon
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
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

      {/* Upcoming Features */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="mb-4">
            <Rocket className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
          <h2 className="text-4xl font-headline font-bold mb-4">
            Upcoming Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            These features will be added to the platform and the subscription fees will change only after that, but I'll still try keep things affordable to every student out there.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {UPCOMING_FEATURES.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-dashed border-2">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <Badge variant="outline" className="w-fit mb-2">
                    <Clock className="h-3 w-3 mr-1" />
                    {feature.status}
                  </Badge>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Card className="max-w-2xl mx-auto border-primary/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Heart className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div className="text-left">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong className="text-foreground">I'm working solo now,</strong> but I'm committed to making
                    Acad AI the best learning platform for students. These features will roll out as soon as they're ready, I'll update with an announcement. 
                  </p>
                  <p className="text-xs text-muted-foreground">
                    - Founder of Acad AI
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
            Honest answers about the platform, changes, and what to expect
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
              <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
                Start Your Learning Journey Today
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join students worldwide who are mastering tech skills with comprehensive roadmaps and weekly resources.
                More features coming soon at no extra cost.
              </p>
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
                Affordable pricing • Cancel anytime • Future features included
              </p>
            </CardContent>
          </Card>
        </motion.div>
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
