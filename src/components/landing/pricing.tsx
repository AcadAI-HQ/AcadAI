'use client';
import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function Pricing() {
	return (
		<section className="relative overflow-hidden py-24 bg-black">
			<div id="pricing" className="mx-auto w-full max-w-4xl space-y-8 px-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
					viewport={{ once: true }}
					className="mx-auto max-w-2xl space-y-5 text-center"
				>
					<div className="flex justify-center">
						<div className="rounded-lg border px-4 py-1 font-mono text-white">Our Mission</div>
					</div>
					<h2 className="mt-5 text-2xl font-bold tracking-tighter md:text-3xl lg:text-4xl text-white">
						Completely Free, For Now.
					</h2>
					<p className="text-muted-foreground mt-5 text-lg">
						We've been there—stuck in tutorial hell, overwhelmed by choices, and unsure of the right path. We're building Acad AI to be the mentor we wish we had, a tool that shows you exactly what companies are hiring for right now.
					</p>
          <p className="text-muted-foreground mt-4 text-lg">
            That's why this platform is currently free. We're covering all the API costs and server expenses from our own pockets. Our only goal is to provide a clear, effective path for students and career-changers, so you don't have to face the same struggles we did.
          </p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
					viewport={{ once: true }}
					className="flex justify-center"
				>
					<Button size="lg" asChild className="bg-white text-black hover:bg-gray-200">
						<Link href="/signup">
              Start Your Journey for Free
              <Heart className="ml-2 h-5 w-5" />
            </Link>
					</Button>
				</motion.div>
			</div>
		</section>
	);
}

export default Pricing;
