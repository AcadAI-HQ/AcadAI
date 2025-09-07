"use client";

import { motion } from "framer-motion";
import { Lightbulb, Code, Users } from "lucide-react";
import Image from "next/image";

const Backstory = () => {
  return (
    <section id="backstory" className="py-20 md:py-28 bg-card">
      <div className="container grid lg:grid-cols-5 gap-16 items-center">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src="https://placehold.co/500x500.png"
            alt="Cofounders of Acad AI"
            data-ai-hint="founder portrait"
            width={500}
            height={500}
            className="rounded-full aspect-square object-cover shadow-2xl mx-auto"
          />
        </motion.div>
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            From Frustration to a <span className="text-accent">Solution</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            "We were once in your shoes. Scrolling endlessly through tutorials, buying courses we never finished, and feeling overwhelmed by the sheer number of 'essential' technologies to learn. I wasted months, if not years, on inefficient learning."
          </p>
          <p className="mt-4 text-muted-foreground text-lg">
            "That's why we built Acad AI. We envisioned a tool that could provide the mentorship and direction we never had—a smart guide that cuts through the noise and delivers a clear, efficient path to success. This platform is the solution I wish I had when I started my journey."
          </p>
          <div className="mt-6 border-t border-border pt-6">
            <h3 className="font-semibold text-foreground">Bhaskar & Disshad, Cofounders of Acad AI</h3>
            <p className="text-sm text-muted-foreground">Developers and lifelong learners</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Backstory;
