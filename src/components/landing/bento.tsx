"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Globe } from "../ui/globe";
import { BentoGrid, BentoCard } from "../ui/bento-grid";
import { AnimatedList } from "../ui/animated-list";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { useUserCount } from "@/hooks/use-user-count";
import { COBEOptions } from "cobe";
import { InteractiveHoverButton } from "../ui/interactive-hover-button";
import { InteractiveGridPattern } from "../ui/interactive-grid-pattern";

const DARK_GLOBE_CONFIG: COBEOptions = {
  width: 600,
  height: 600,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [0.3, 0.3, 0.3],
  markerColor: [0.1, 0.8, 1],
  glowColor: [0.1, 0.1, 0.1],
  markers: [],
};

const domains = [
  "Frontend",
  "Backend",
  "Fullstack",
  "DevOps",
  "Cyber Security",
  "Machine Learning",
  "Data Scientist",
  "Blockchain Developer",
];

export default function Bento() {
  const { userCount } = useUserCount();
  const [isRoadmapHovered, setIsRoadmapHovered] = useState(false);

  return (
    <section className="w-full py-16 md:py-24 bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Everything You Need
          </h2>
          <p className="mt-4 text-base md:text-lg text-white/60 max-w-xl mx-auto">
            Powerful features to accelerate your tech career journey
          </p>
        </motion.div>

        <BentoGrid className="grid-cols-1 md:grid-cols-4 gap-4">
          <BentoCard
            name="Global Market Analysis"
            className="md:col-span-2 md:row-span-2 border border-gray-800"
            background={
              <div className="absolute bottom-0 right-0 w-[100%] h-[100%]">
                <Globe className="h-full w-full" config={DARK_GLOBE_CONFIG} />
              </div>
            }
            description="Real-time insights into what companies worldwide are hiring for. Stay ahead of the curve."
            href="#about"
            cta="Explore Markets"
          />

          <BentoCard
            name="Roadmaps for Any Domain"
            className="md:col-span-2 border border-gray-800"
            background={
              isRoadmapHovered ? (
                <AnimatedList
                  className="absolute inset-0 p-6 flex flex-col justify-center"
                  delay={2000}
                >
                  {domains.map((domain) => (
                    <div
                      key={domain}
                      className="flex items-center gap-3 rounded-lg bg-black p-3 backdrop-blur-sm"
                      style={{ boxShadow: "0 2px 8px rgba(255,255,255,0.2)" }}
                    >
                      <div className="h-2 w-2 rounded-full bg-white" />
                      <span className="text-base text-white/70">{domain}</span>
                    </div>
                  ))}
                </AnimatedList>
              ) : (
                <div className="absolute inset-0 flex flex-col justify-start p-6 space-y-4">
                  {domains.slice(0, 3).map((domain, i) => (
                    <div
                      key={domain}
                      className="flex items-center gap-3 rounded-lg bg-black p-3 backdrop-blur-sm"
                      style={{
                        opacity: 1 - i * 0.2,
                        boxShadow: "0 2px 8px rgba(255,255,255,0.2)",
                      }}
                    >
                      <div className="h-2 w-2 rounded-full bg-white" />
                      <span className="text-base text-white/70">{domain}</span>
                    </div>
                  ))}
                </div>
              )
            }
            description="From Frontend to Blockchain - comprehensive learning paths for every tech domain."
            href="/signup"
            cta="Start Learning"
            onMouseEnter={() => setIsRoadmapHovered(true)}
            onMouseLeave={() => setIsRoadmapHovered(false)}
          />

          <BentoCard
            name="Hyperpersonalization"
            className="md:col-span-1 border border-gray-800"
            background={
              <InteractiveGridPattern/>
            }
            description="Customize the roadmaps to suit your skills, proficiency and learning speed"
            href="#"
            cta="Coming Soon"
          />

          <div className="md:col-span-1 flex flex-col items-center justify-center p-6 rounded-xl bg-background shadow-lg border border-gray-800">
            <h3 className="mb-4 text-xl md:text-2xl font-bold text-white text-center">
              Join {userCount.toLocaleString()}+ devs and students
            </h3>
            <p className="mb-6 text-sm text-white/70 align-center">
              Don't trust us. Trust the market data.
            </p>
            <InteractiveHoverButton
              className="bg-[#000000] text-white hover:bg-[#29ABE2]/90"
            >
              <a href="/signup">
                Get Started Free
              </a>
            </InteractiveHoverButton>
          </div>
        </BentoGrid>
      </div>
    </section>
  );
}