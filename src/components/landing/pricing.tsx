'use client';
import React from 'react';
import { PlusIcon, ShieldCheckIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { BorderTrail } from '../ui/border-trail';
import Link from 'next/link';

export function Pricing() {
	return (
		<section className="relative min-h-screen overflow-hidden py-24 bg-black">
			<div id="pricing" className="mx-auto w-full max-w-6xl space-y-5 px-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
					viewport={{ once: true }}
					className="mx-auto max-w-xl space-y-5"
				>
					<div className="flex justify-center">
						<div className="rounded-lg border px-4 py-1 font-mono text-white">Pricing</div>
					</div>
					<h2 className="mt-5 text-center text-2xl font-bold tracking-tighter md:text-3xl lg:text-4xl text-white">
						Pricing Based on Your Success
					</h2>
					<p className="text-muted-foreground mt-5 text-center text-sm md:text-base">
						We offer a single price for all our services. We believe that pricing is a critical component of any
						successful business.
					</p>
				</motion.div>

				<div className="relative">
					<div
						className={cn(
							'z--10 pointer-events-none absolute inset-0 size-full',
							'bg-[linear-gradient(to_right,hsl(var(--foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground))_1px,transparent_1px)]',
							'bg-[size:32px_32px]',
							'[mask-image:radial-gradient(ellipse_at_center,black_10%,transparent)]',
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
							<PlusIcon className="absolute -top-3 -left-3  size-5.5 text-white" />
							<PlusIcon className="absolute -top-3 -right-3 size-5.5 text-white" />
							<PlusIcon className="absolute -bottom-3 -left-3 size-5.5 text-white" />
							<PlusIcon className="absolute -right-3 -bottom-3 size-5.5 text-white" />

							<div className="w-full px-4 pt-5 pb-4">
								<div className="space-y-1">
									<div className="flex items-center justify-between">
										<h3 className="leading-none font-semibold text-white">Free</h3>
									</div>
									<p className="text-muted-foreground text-sm">Best for getting started.</p>
								</div>
								<div className="mt-10 space-y-4">
									<div className="text-muted-foreground flex items-end gap-0.5 text-xl">
										<span>₹</span>
										<span className="text-foreground -mb-0.5 text-4xl font-extrabold tracking-tighter md:text-5xl">
											0
										</span>
										<span>/month</span>
									</div>
									<Button className="w-full" variant="outline" asChild>
										<Link href="/signup">Start Your Journey</Link>
									</Button>
								</div>
							</div>
							<div className="relative w-full rounded-lg border px-4 pt-5 pb-4">
								<BorderTrail
									size={100}
								/>
								<div className="space-y-1">
									<div className="flex items-center justify-between">
										<h3 className="leading-none font-semibold text-white">Premium</h3>
										<Badge>BEST VALUE</Badge>
									</div>
									<p className="text-muted-foreground text-sm">Unlock all features & unlimited roadmaps.</p>
								</div>
								<div className="mt-10 space-y-4">
									<div className="text-muted-foreground flex items-end text-xl">
										<span>₹</span>
										<span className="text-foreground -mb-0.5 text-4xl font-extrabold tracking-tighter md:text-5xl">
											199
										</span>
										<span>/month</span>
									</div>
									<Button className="w-full" asChild>
										<Link href="/signup?plan=premium">Go Premium</Link>
									</Button>
								</div>
							</div>
						</div>

						<div className="text-muted-foreground flex items-center justify-center gap-x-2 text-sm">
							<ShieldCheckIcon className="size-4" />
							<span>Access to all features with no hidden fees</span>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}

export default Pricing;
