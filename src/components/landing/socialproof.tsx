'use client';

import { motion } from 'framer-motion';
import { Testimonial } from '@/components/ui/clean-testimonial';

export default function SocialProof() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_3fr] gap-12 lg:gap-16 items-start">

          {/* Left 25%: Heading only */}
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-black/50 leading-[1.1] tracking-tight font-headline pt-8"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
          >
            Don&apos;t Trust Us —{" "}
            <span className="text-black">Hear What They Say</span>
          </motion.h2>

          {/* Right 75%: Interactive testimonial */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <Testimonial />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
