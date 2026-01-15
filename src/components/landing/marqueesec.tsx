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
    <div className="relative flex w-full flex-col items-end justify-end overflow-hidden mt-16 sm:mt-24 md:mt-32 mb-16 sm:mb-20 md:mb-24">
        <ScrollVelocityContainer className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-[-0.02em] md:leading-[5rem]">
          <ScrollVelocityRow baseVelocity={5} direction={1} className="ml-4 px-8 sm:px-12 md:px-16">
            Frontend ○ Backend ○ Fullstack ○ Machine Learning ○ DevOps ○ Data Science ○ Cybersecurity ○ UI/UX ○ Product Engineering ○ Indie Game Dev ○ AAA Game Dev ○ Android ○ iOS ○ Blockchain ○
          </ScrollVelocityRow>
          <ScrollVelocityRow baseVelocity={5} direction={-1} className="px-8 sm:px-12 md:px-16">
            Frontend ○ Backend ○ Fullstack ○ Machine Learning ○ DevOps ○ Data Science ○ Cybersecurity ○ UI/UX ○ Product Engineering ○ Indie Game Dev ○ AAA Game Dev ○ Android ○ iOS ○ Blockchain ○
          </ScrollVelocityRow>
        </ScrollVelocityContainer>
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-[25%] sm:w-[35%] bg-gradient-to-r"></div>
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-[25%] sm:w-[35%] bg-gradient-to-l"></div>

      <div className="relative text-right mt-24 sm:mt-36 md:mt-52 p-4 sm:p-6 md:p-8 pr-4 sm:pr-8 md:pr-12 w-full">
        <AuroraText className="text-lg sm:text-xl md:text-2xl font-semibold tracking-lighter capitalize" colors={["#FF4500", "#FF8C00", "#FFA500", "#FFD700"]} speed={1}>
          It's time to master
        </AuroraText>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold leading-tight space-y-2 sm:space-y-3 md:space-y-4">
          {/* First row - 2 words */}
          <div className="flex justify-end gap-2 sm:gap-4 md:gap-6">
            <span
              className={`transition-all duration-500 ${
                activeIndex === 0
                  ? 'text-white'
                  : 'text-transparent [-webkit-text-stroke:1px_white] sm:[-webkit-text-stroke:2px_white] [text-stroke:1px_white] sm:[text-stroke:2px_white]'
              }`}
              style={activeIndex !== 0 ? { WebkitTextStroke: window.innerWidth < 640 ? '1px white' : '2px white' } : {}}
            >
              Exams.
            </span>
            <span
              className={`transition-all duration-500 ${
                activeIndex === 1
                  ? 'text-white'
                  : 'text-transparent [-webkit-text-stroke:1px_white] sm:[-webkit-text-stroke:2px_white] [text-stroke:1px_white] sm:[text-stroke:2px_white]'
              }`}
              style={activeIndex !== 1 ? { WebkitTextStroke: window.innerWidth < 640 ? '1px white' : '2px white' } : {}}
            >
              Interviews.
            </span>
          </div>

          {/* Second row - 2 words */}
          <div className="flex justify-end gap-2 sm:gap-4 md:gap-6">
            <span
              className={`transition-all duration-500 ${
                activeIndex === 2
                  ? 'text-white'
                  : 'text-transparent [-webkit-text-stroke:1px_white] sm:[-webkit-text-stroke:2px_white] [text-stroke:1px_white] sm:[text-stroke:2px_white]'
              }`}
              style={activeIndex !== 2 ? { WebkitTextStroke: window.innerWidth < 640 ? '1px white' : '2px white' } : {}}
            >
              Skills.
            </span>
            <span
              className={`transition-all duration-500 ${
                activeIndex === 3
                  ? 'text-white'
                  : 'text-transparent [-webkit-text-stroke:1px_white] sm:[-webkit-text-stroke:2px_white] [text-stroke:1px_white] sm:[text-stroke:2px_white]'
              }`}
              style={activeIndex !== 3 ? { WebkitTextStroke: window.innerWidth < 640 ? '1px white' : '2px white' } : {}}
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
                  : 'text-transparent [-webkit-text-stroke:1px_white] sm:[-webkit-text-stroke:2px_white] [text-stroke:1px_white] sm:[text-stroke:2px_white]'
              }`}
              style={activeIndex !== 4 ? { WebkitTextStroke: window.innerWidth < 640 ? '1px white' : '2px white' } : {}}
            >
              Everything
            </span>
          </div>
        </h2>

        <div className="mt-6 sm:mt-8 flex justify-end">
          <HoverBorderGradient
            containerClassName="rounded-full"
            as="button"
            className="dark:bg-black bg-black text-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg md:text-xl font-semibold shadow-sm shadow-cyan-700"
            onClick={() => router.push('/signup')}
          >
            <span>Master Now</span>
          </HoverBorderGradient>
        </div>
      </div>

    </div>
  );
}