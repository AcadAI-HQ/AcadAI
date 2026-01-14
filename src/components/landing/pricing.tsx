"use client";

import React from 'react';
import { PlusIcon, ShieldCheckIcon, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BorderTrail } from '@/components/ui/border-trail';
import { useGeoPricing } from '@/hooks/use-geo-pricing';
import Link from 'next/link';

export default function Pricing() {
  const pricing = useGeoPricing();

  return (
    <section id="pricing" className="relative min-h-screen overflow-hidden py-24 bg-black">
      <div className="mx-auto w-full max-w-6xl space-y-5 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mx-auto max-w-xl space-y-5"
        >
          <div className="flex justify-center">
            <div className="rounded-lg border border-gray-800 px-4 py-1 font-mono text-white">
              Pricing
            </div>
          </div>
          <h2 className="mt-5 text-center text-2xl font-bold tracking-tighter md:text-3xl lg:text-4xl text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-400 mt-5 text-center text-sm md:text-base">
            {pricing.loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading pricing...
              </span>
            ) : pricing.isIndia ? (
              "Invest in your tech career for less than ₹100 per month"
            ) : (
              "Invest in your tech career for less than a cup of coffee per month"
            )}
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
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="mx-auto w-full max-w-2xl space-y-2"
          >
            <div className="grid md:grid-cols-2 bg-black relative border border-gray-800 p-4">
              <PlusIcon className="absolute -top-3 -left-3 size-5.5 text-gray-700" />
              <PlusIcon className="absolute -top-3 -right-3 size-5.5 text-gray-700" />
              <PlusIcon className="absolute -bottom-3 -left-3 size-5.5 text-gray-700" />
              <PlusIcon className="absolute -right-3 -bottom-3 size-5.5 text-gray-700" />

              {/* Monthly Plan */}
              <div className="w-full px-4 pt-5 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="leading-none font-semibold text-white">Monthly</h3>
                  </div>
                  <p className="text-gray-400 text-sm">Perfect for getting started</p>
                </div>
                <div className="mt-10 space-y-4">
                  {pricing.loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      <span className="text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <div className="text-gray-400 flex items-end gap-0.5 text-xl">
                      <span>{pricing.monthly.symbol}</span>
                      <span className="text-white -mb-0.5 text-4xl font-extrabold tracking-tighter md:text-5xl">
                        {pricing.monthly.price}
                      </span>
                      <span>/month</span>
                    </div>
                  )}
                  <Button className="w-full bg-white text-black hover:bg-gray-200" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </div>
              </div>

              {/* Annual Plan */}
              <div className="relative w-full rounded-lg border border-gray-800 px-4 pt-5 pb-4">
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
                    <h3 className="leading-none font-semibold text-white">Annual</h3>
                    <Badge className="bg-[#29ABE2] text-white border-0">
                      <Sparkles className="h-3 w-3 mr-1 inline" />
                      Save 15%
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm">Best value for committed learners</p>
                </div>
                <div className="mt-10 space-y-4">
                  {pricing.loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      <span className="text-gray-400">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-gray-400 flex items-end text-xl">
                        <span>{pricing.annual.symbol}</span>
                        <span className="text-white -mb-0.5 text-4xl font-extrabold tracking-tighter md:text-5xl">
                          {pricing.annual.price}
                        </span>
                        <span>/year</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        That's just <span className="text-[#29ABE2] font-semibold">
                          {pricing.annual.symbol}{pricing.annual.monthlyEquivalent}/month
                        </span>
                      </p>
                    </>
                  )}
                  <Button className="w-full bg-[#29ABE2] text-white hover:bg-[#2196ce]" asChild>
                    <Link href="/signup">Get Started Now</Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-gray-400 flex items-center justify-center gap-x-2 text-sm">
              <ShieldCheckIcon className="size-4" />
              <span>All plans include full access to our platform. No hidden fees. Cancel anytime.</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
