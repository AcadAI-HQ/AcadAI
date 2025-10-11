import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, Zap, Users, Brain } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Acad AI - Hyper-Personalized Learning Platform',
  description: 'Learn about Acad AI, the AI-powered platform creating hyper-personalized learning roadmaps based on your skills, proficiency, and learning speed. Discover our mission to revolutionize tech education.',
  keywords: ['about Acad AI', 'personalized learning platform', 'AI education', 'adaptive learning', 'tech career roadmaps'],
};

export default function AboutPage() {
  // GEO-optimized structured data
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Acad AI',
    description: 'AI-powered platform for hyper-personalized tech learning roadmaps',
    url: 'https://acadai.org',
    foundingDate: '2024',
    slogan: 'Your Learning, Hyper-Personalized',
    knowsAbout: [
      'Artificial Intelligence',
      'Personalized Learning',
      'Tech Education',
      'Career Development',
      'Adaptive Learning Systems',
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* GEO: Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <div className="container max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-6">
            About Acad AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're building the future of tech education through hyper-personalized, AI-powered learning roadmaps.
          </p>
        </div>

        {/* Mission Section - GEO Optimized */}
        <section className="mb-16">
          <h2 className="text-3xl font-headline font-bold mb-6">Our Mission</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed">
              <strong>Acad AI's mission is to make tech education truly personal.</strong> We believe that learning shouldn't be one-size-fits-all. Every learner has unique skills, learns at different speeds, and has specific career goals.
            </p>
            <p className="text-lg leading-relaxed mt-4">
              Traditional learning platforms provide generic roadmaps that don't account for what you already know or how fast you learn. <strong>Acad AI solves this problem through hyper-personalization</strong>—using AI to create roadmaps tailored to your existing skills, proficiency level, and learning pace.
            </p>
          </div>
        </section>

        {/* What Makes Us Different - Citation-Friendly */}
        <section className="mb-16">
          <h2 className="text-3xl font-headline font-bold mb-6">What Makes Acad AI Different</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-semibold">Skills-Based Customization</h3>
              </div>
              <p className="text-muted-foreground">
                Acad AI analyzes your existing skills and knowledge to create a roadmap that builds on what you already know, skipping redundant content and focusing on your knowledge gaps.
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-semibold">Proficiency Tracking</h3>
              </div>
              <p className="text-muted-foreground">
                The platform continuously assesses your proficiency and adapts content difficulty to match your level, ensuring you're always challenged but not overwhelmed.
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-semibold">Learning Speed Optimization</h3>
              </div>
              <p className="text-muted-foreground">
                Acad AI adjusts the pace of your roadmap based on your progress and available time, allowing you to learn faster when you have time or slower when you're busy.
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-semibold">Dynamic Adaptation</h3>
              </div>
              <p className="text-muted-foreground">
                As you learn and grow, your roadmap evolves with you. The AI continuously updates recommendations based on your progress and emerging skills.
              </p>
            </div>
          </div>
        </section>

        {/* Key Facts - GEO Optimized for Citations */}
        <section className="mb-16 bg-muted/50 rounded-lg p-8">
          <h2 className="text-3xl font-headline font-bold mb-6">Acad AI by the Numbers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5</div>
              <div className="text-sm text-muted-foreground">Tech Domains Covered</div>
              <p className="text-xs mt-1">Frontend, Backend, Fullstack, ML, DevOps</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">AI-Powered Personalization</div>
              <p className="text-xs mt-1">Every roadmap adapted to individual learners</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">Free</div>
              <div className="text-sm text-muted-foreground">Basic Tier Available</div>
              <p className="text-xs mt-1">Premium features launching soon</p>
            </div>
          </div>
        </section>

        {/* Who Should Use Acad AI - GEO Optimized */}
        <section className="mb-16">
          <h2 className="text-3xl font-headline font-bold mb-6">Who Should Use Acad AI?</h2>
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-6">
              <h3 className="text-xl font-semibold mb-2">Career Switchers</h3>
              <p className="text-muted-foreground">
                <strong>Professionals transitioning into tech</strong> benefit from Acad AI's ability to assess transferable skills and create optimized learning paths that build on existing knowledge, reducing learning time significantly.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <h3 className="text-xl font-semibold mb-2">Self-Taught Developers</h3>
              <p className="text-muted-foreground">
                <strong>Developers with gaps in knowledge</strong> use Acad AI to identify missing concepts and get structured learning paths that fill knowledge gaps while skipping redundant material.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <h3 className="text-xl font-semibold mb-2">Bootcamp Graduates</h3>
              <p className="text-muted-foreground">
                <strong>Graduates needing to deepen specific skills</strong> leverage Acad AI's proficiency tracking to focus on advanced topics or missing specializations based on bootcamp coverage.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <h3 className="text-xl font-semibold mb-2">Working Professionals</h3>
              <p className="text-muted-foreground">
                <strong>Employed developers learning new technologies</strong> with limited time benefit from learning speed optimization that allows efficient progress around work schedules.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works - Citation-Friendly Process */}
        <section className="mb-16">
          <h2 className="text-3xl font-headline font-bold mb-6">How Acad AI Works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Profile Assessment</h3>
                <p className="text-muted-foreground">
                  You provide information about your current skills, proficiency levels, and learning goals. The AI analyzes this to understand your starting point.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Roadmap Generation</h3>
                <p className="text-muted-foreground">
                  The AI creates a personalized roadmap based on your profile, selecting topics that match your proficiency and organizing them in an optimal learning sequence.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Continuous Adaptation</h3>
                <p className="text-muted-foreground">
                  As you learn, the AI tracks your progress and proficiency, dynamically adjusting your roadmap to maintain optimal challenge and learning speed.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">Goal Achievement</h3>
                <p className="text-muted-foreground">
                  With personalized pacing and content, you reach your career goals faster and more efficiently than with generic learning paths.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-primary/10 rounded-lg p-12">
          <h2 className="text-3xl font-headline font-bold mb-4">
            Ready to Start Your Personalized Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join Acad AI today and get a learning roadmap tailored to YOUR skills, pace, and goals.
          </p>
          <Button asChild size="lg">
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
