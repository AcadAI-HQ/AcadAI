'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Marquee } from '../ui/marquee';
import { AuroraText } from '../ui/aurora-text';
import { HoverBorderGradient } from '../ui/hover-border-gradient';
import Link from 'next/link';


// Unique reviews data
const testimonials = [
  {
    name: 'Kshitiz Pranay',
    username: '@pranay_k',
    body: "I've used plenty of learning tools, but Acad AI actually adapts to market needs. It's like having an AI mentor that knows what recruiters want.",
    img: 'https://randomuser.me/api/portraits/men/32.jpg',
    country: '🇮🇳 India',
  },
  {
    name: 'Sarah Chen',
    username: '@sarah_codes',
    body: 'Finally, a platform that tells me exactly what companies are hiring for today. No more outdated tutorials or guessing what to learn next!',
    img: 'https://randomuser.me/api/portraits/women/68.jpg',
    country: '🇺🇸 USA',
  },
  {
    name: 'Marco Rossi',
    username: '@marco_fullstack',
    body: 'The roadmaps are incredibly comprehensive. From foundational concepts to advanced topics, everything I need to land my dream tech job is here.',
    img: 'https://randomuser.me/api/portraits/men/51.jpg',
    country: '🇮🇹 Italy',
  },
  {
    name: 'Aman Sachan',
    username: '@aman_sh',
    body: 'Acad AI helped me identify my strengths and guided me step-by-step toward my career goals. The personalized roadmap that updates daily was very helpful. I\'m looking really forward to their new features.',
    img: 'https://randomuser.me/api/portraits/men/53.jpg',
    country: '🇮🇳 India',
  },
  {
    name: 'Jake Thompson',
    username: '@jake_devops',
    body: 'I love that it analyzes actual job postings to create the roadmaps. No more wasting time on skills that companies aren\'t even looking for.',
    img: 'https://randomuser.me/api/portraits/men/33.jpg',
    country: '🇺🇸 USA',
  },
  {
    name: 'Sophie Dubois',
    username: '@sophie_frontend',
    body: 'The comprehensive coverage is amazing. I went from zero to landing my first frontend job in just 4 months thanks to Acad AI\'s clear roadmap!',
    img: 'https://randomuser.me/api/portraits/women/22.jpg',
    country: '🇫🇷 France',
  },
  {
    name: 'Kenji Tanaka',
    username: '@kenji_backend',
    body: 'Best part? I look really forward to having the hyperpersonalization part of the platform and their skill tracking feature.',
    img: 'https://randomuser.me/api/portraits/men/85.jpg',
    country: '🇯🇵 Japan',
  },
  {
    name: 'Emily Rodriguez',
    username: '@emily_learns',
    body: 'As a career changer, I was lost. Acad AI gave me a clear, logical learning path based on current industry needs. Game changer!',
    img: 'https://randomuser.me/api/portraits/women/45.jpg',
    country: '🇨🇦 Canada',
  },
  {
    name: 'Luis Martinez',
    username: '@luis_stack',
    body: 'The roadmaps include everything - tools, frameworks, best practices, even specialized applications. It\'s like having a senior dev mentor for free!',
    img: 'https://randomuser.me/api/portraits/men/62.jpg',
    country: '🇪🇸 Spain',
  },
  {
    name: 'Ankit Kumar',
    username: '@kr_ankit',
    body: 'In respect to the services provided here is unparalled to online courses, the finely currated roadmap and advanced market analysis is very useful in today\'s tech market.',
    img: 'https://randomuser.me/api/portraits/men/63.jpg',
    country: '🇮🇳 India',
  }
];

function TestimonialCard({ img, name, username, body, country }: (typeof testimonials)[number]) {
  return (
    <Card className="w-72 shadow-md shadow-black/8">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <Avatar className="size-11">
            <AvatarImage src={img} alt="@reui_io" />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <figcaption className="text-base font-medium text-foreground flex items-center gap-1.5">
              {name} <span className="text-sm">{country}</span>
            </figcaption>
            <p className="text-sm font-medium text-muted-foreground">{username}</p>
          </div>
        </div>
        <blockquote className="mt-4 text-base text-secondary-foreground leading-relaxed">{body}</blockquote>
      </CardContent>
    </Card>
  );
}

export default function Testimonials() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center w-full px-4 py-12 lg:py-0">
      {/* Left side - Text content */}
      <div className="flex-1 lg:h-[300px] flex flex-col text-center lg:text-left">
          <AuroraText className="text-base sm:text-lg md:text-xl font-semibold tracking-lighter capitalize px-4 lg:pl-4 lg:pr-0" colors={["#8A2BE2", "#9932CC", "#BA55D3", "#DDA0DD"]} speed={1}>Trusted by devs and students worldwide</AuroraText>
          <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#111827] leading-tight p-4 lg:pr-8'>What our users are saying about Acad AI</h1>
          <div className='mx-auto lg:ml-4 lg:mx-0 mt-6 lg:mt-8'>
            <Link href="/signup">
              <HoverBorderGradient>Join Them Today</HoverBorderGradient>
            </Link>
          </div>
      </div>

      {/* Right side - Marquee */}
      <div className="relative flex h-[500px] sm:h-[600px] lg:h-[700px] w-full lg:max-w-[850px] flex-row items-center justify-center overflow-hidden lg:mr-12">
        <div
          className="flex flex-row items-center gap-2 sm:gap-3 lg:gap-4"
          style={{
            transform:
              'perspective(1000px) translateX(-50px) rotateX(10deg) rotateY(-5deg) rotateZ(10deg)',
          }}
        >
          {/* Show 2 columns on mobile, 4 on desktop */}
          {/* Vertical Marquee (downwards) */}
          <Marquee vertical pauseOnHover repeat={3}>
            {testimonials.map((review, idx) => (
              <TestimonialCard key={`${review.username}-1-${idx}`} {...review} />
            ))}
          </Marquee>
          {/* Vertical Marquee (upwards) */}
          <Marquee vertical pauseOnHover reverse repeat={3}>
            {testimonials.map((review, idx) => (
              <TestimonialCard key={`${review.username}-2-${idx}`} {...review} />
            ))}
          </Marquee>
          {/* Vertical Marquee (downwards) - Hidden on small screens */}
          <Marquee vertical pauseOnHover repeat={3} className="hidden md:block">
            {testimonials.map((review, idx) => (
              <TestimonialCard key={`${review.username}-3-${idx}`} {...review} />
            ))}
          </Marquee>
          {/* Vertical Marquee (upwards) - Hidden on small screens */}
          <Marquee vertical pauseOnHover reverse repeat={3} className="hidden md:block">
            {testimonials.map((review, idx) => (
              <TestimonialCard key={`${review.username}-4-${idx}`} {...review} />
            ))}
          </Marquee>
        </div>

        {/* Gradient overlays to mask all edges */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 sm:h-32 bg-gradient-to-b from-white to-transparent z-10"></div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-32 bg-gradient-to-t from-white to-transparent z-10"></div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 lg:w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 lg:w-32 bg-gradient-to-l from-white to-transparent z-10"></div>
      </div>
    </div>
  );
}
