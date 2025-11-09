'use client';
import React from 'react';
import { PlusIcon, ShieldCheckIcon, Check, Sparkles, MessageCircle, Zap, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { BorderTrail } from '../ui/border-trail';
import { useDetectCurrency } from '@/components/pricing/currency-selector';
import { SUBSCRIPTION_PRICING } from '@/lib/razorpay-config';
import Link from 'next/link';

export function PricingSection() {
	const currency = useDetectCurrency();
	const pricing = SUBSCRIPTION_PRICING[currency].monthly;

	return (
		<section className="relative min-h-screen overflow-hidden py-24 mt-16">
			<div id="pricing" className="mx-auto w-full max-w-6xl space-y-5 px-32">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
					viewport={{ once: true }}
					className="mx-auto max-w-xl space-y-5"
				>
					<div className="flex justify-center">
						<div className="rounded-lg border px-4 py-1 font-mono">Pricing</div>
					</div>
					<h2 className="mt-5 text-center text-2xl font-bold tracking-tighter md:text-3xl lg:text-4xl">
						Start Free, Upgrade When Ready
					</h2>
					<p className="text-muted-foreground mt-5 text-center text-sm md:text-base">
						Get started with comprehensive roadmaps for free. Upgrade to unlock AI-powered personalization and weekly resources.
					</p>
				</motion.div>

				<div className="relative">
					<div
						className={cn(
							'z--10 pointer-events-none absolute inset-0 size-full',
							'bg-[linear-gradient(to_right,--theme(--color-foreground/.2)_1px,transparent_1px),linear-gradient(to_bottom,--theme(--color-foreground/.2)_1px,transparent_1px)]',
							'bg-[size:32px_32px]',
							'[mask-image:radial-gradient(ellipse_at_center,var(--background)_10%,transparent)]',
						)}
					/>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
						viewport={{ once: true }}
						className="mx-auto w-full max-w-2xl space-y-2"
					>
						<div className="grid md:grid-cols-2 bg-background relative border p-4">
							<PlusIcon className="absolute -top-3 -left-3  size-5.5" />
							<PlusIcon className="absolute -top-3 -right-3 size-5.5" />
							<PlusIcon className="absolute -bottom-3 -left-3 size-5.5" />
							<PlusIcon className="absolute -right-3 -bottom-3 size-5.5" />

							{/* Free Tier */}
							<div className="w-full px-4 pt-5 pb-4 flex flex-col">
								<div className="space-y-1">
									<div className="flex items-center justify-between">
										<h3 className="leading-none font-semibold">Free</h3>
									</div>
									<p className="text-muted-foreground text-sm">Perfect for getting started</p>
								</div>
								<div className="mt-6 space-y-4 flex-1 flex flex-col">
									<div className="text-muted-foreground flex items-end gap-0.5 text-xl">
										<span>$</span>
										<span className="text-foreground -mb-0.5 text-4xl font-extrabold tracking-tighter md:text-5xl">
											0
										</span>
										<span>/month</span>
									</div>

									{/* Free Features */}
									<ul className="space-y-2.5 text-sm flex-1">
										<li className="flex items-start gap-2">
											<Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
											<span>All Learning Roadmaps</span>
										</li>
										<li className="flex items-start gap-2">
											<Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
											<span>Monthly Learning Resources</span>
										</li>
										<li className="flex items-start gap-2">
											<Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
											<span>Progress Tracking</span>
										</li>
									</ul>

									<Button className="w-full mt-auto" variant="outline" asChild>
										<Link href="/signup">Get Started Free</Link>
									</Button>
								</div>
							</div>

							{/* Premium Tier */}
							<div className="relative w-full rounded-lg border px-4 pt-5 pb-4 flex flex-col">
								<BorderTrail
									style={{
										boxShadow:
											'0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)',
									}}
									size={100}
								/>
								<div className="space-y-1">
									<div className="flex items-center justify-between">
										<h3 className="leading-none font-semibold flex items-center gap-2">
											Premium
											<Crown className="h-4 w-4 text-primary" />
										</h3>
										<Badge>Popular</Badge>
									</div>
									<p className="text-muted-foreground text-sm">Unlock your full potential</p>
								</div>
								<div className="mt-6 space-y-4 flex-1 flex flex-col">
									<div className="text-muted-foreground flex items-end text-xl">
										<span className="text-sm">{currency === 'USD' ? '$' : '₹'}</span>
										<span className="text-foreground -mb-0.5 text-4xl font-extrabold tracking-tighter md:text-5xl">
											{currency === 'USD' ? '9.99' : '299'}
										</span>
										<span>/month</span>
									</div>

									{/* Premium Features */}
									<ul className="space-y-2.5 text-sm flex-1">
										<li className="flex items-start gap-2">
											<Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
											<span>Everything in Free</span>
										</li>
										<li className="flex items-start gap-2">
											<Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
											<span className="font-medium">AI Hyperpersonalization</span>
										</li>
										<li className="flex items-start gap-2">
											<MessageCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
											<span className="font-medium">Interactive Chat Assistant</span>
										</li>
										<li className="flex items-start gap-2">
											<Zap className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
											<span className="font-medium">Weekly Learning Resources</span>
										</li>
										<li className="flex items-start gap-2">
											<Crown className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
											<span className="font-medium">Priority Support</span>
										</li>
									</ul>

									<Button className="w-full mt-auto" asChild>
										<Link href="/signup">Start Free Trial</Link>
									</Button>
								</div>
							</div>
						</div>

						<div className="text-muted-foreground flex items-center justify-center gap-x-2 text-sm">
							<ShieldCheckIcon className="size-4" />
							<span>No credit card required • Cancel anytime</span>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}

export default PricingSection;
