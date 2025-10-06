"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScrollVelocityContainer, ScrollVelocityRow } from "../ui/scroll-based-velocity";
import { AuroraText } from "../ui/aurora-text";
import { HoverBorderGradient } from "../ui/hover-border-gradient";

export default function MarqueeSec() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const totalTexts = 5;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(Math.floor(Math.random() * totalTexts));
    }, 2000); // Change active text every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex w-full flex-col items-end justify-end overflow-hidden mt-32 mb-24">
        <ScrollVelocityContainer className="text-4xl font-bold tracking-[-0.02em] md:text-7xl md:leading-[5rem]">
          <ScrollVelocityRow baseVelocity={20} direction={1} className="ml-4 px-16">
            Acad AI ○ Acad AI ○ Acad AI ○
          </ScrollVelocityRow>
          <ScrollVelocityRow baseVelocity={20} direction={-1} className="px-16">
            Acad AI ○ Acad AI ○ Acad AI ○
          </ScrollVelocityRow>
        </ScrollVelocityContainer>
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-[35%] bg-gradient-to-r"></div>
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-[35%] bg-gradient-to-l"></div>

      <div className="relative text-right mt-52 p-8 pr-12 w-full">
        <AuroraText className="text-xl md:text-2xl font-semibold tracking-lighter capitalize" colors={["#FF4500", "#FF8C00", "#FFA500", "#FFD700"]} speed={1}>
          It's time to master
        </AuroraText>
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight space-y-4">
          {/* First row - 2 words */}
          <div className="flex justify-end gap-6">
            <span
              className={`transition-all duration-500 ${
                activeIndex === 0
                  ? 'text-white'
                  : 'text-transparent [-webkit-text-stroke:2px_white] [text-stroke:2px_white]'
              }`}
              style={activeIndex !== 0 ? { WebkitTextStroke: '2px white' } : {}}
            >
              Exams.
            </span>
            <span
              className={`transition-all duration-500 ${
                activeIndex === 1
                  ? 'text-white'
                  : 'text-transparent [-webkit-text-stroke:2px_white] [text-stroke:2px_white]'
              }`}
              style={activeIndex !== 1 ? { WebkitTextStroke: '2px white' } : {}}
            >
              Interviews.
            </span>
          </div>

          {/* Second row - 2 words */}
          <div className="flex justify-end gap-6">
            <span
              className={`transition-all duration-500 ${
                activeIndex === 2
                  ? 'text-white'
                  : 'text-transparent [-webkit-text-stroke:2px_white] [text-stroke:2px_white]'
              }`}
              style={activeIndex !== 2 ? { WebkitTextStroke: '2px white' } : {}}
            >
              Skills.
            </span>
            <span
              className={`transition-all duration-500 ${
                activeIndex === 3
                  ? 'text-white'
                  : 'text-transparent [-webkit-text-stroke:2px_white] [text-stroke:2px_white]'
              }`}
              style={activeIndex !== 3 ? { WebkitTextStroke: '2px white' } : {}}
            >
              Projects.
            </span>
          </div>

          {/* Third row - 1 word */}
          <div className="flex justify-end">
            <span
              className={`transition-all duration-500 ${
                activeIndex === 4
                  ? 'text-white'
                  : 'text-transparent [-webkit-text-stroke:2px_white] [text-stroke:2px_white]'
              }`}
              style={activeIndex !== 4 ? { WebkitTextStroke: '2px white' } : {}}
            >
              Everything
            </span>
          </div>
        </h2>

        <div className="mt-8 flex justify-end">
          <HoverBorderGradient
            containerClassName="rounded-full"
            as="button"
            className="dark:bg-black bg-black text-white px-8 py-4 text-lg md:text-xl font-semibold shadow-sm shadow-cyan-700"
            onClick={() => router.push('/signup')}
          >
            <span>Master Now</span>
          </HoverBorderGradient>
        </div>
      </div>

    </div>
  );
}