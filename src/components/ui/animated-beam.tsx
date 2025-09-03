"use client";

import { cn } from "@/lib/utils";
import { motion, useSpring } from "framer-motion";
import React, {
  SVGProps,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

export const AnimatedBeam = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 10,
  reverse = false,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#ff0000",
  gradientStopColor = "#ff0000",
  delay = 0,
  duration = 1,
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}: {
  className?: string;
  containerRef: RefObject<HTMLElement>; // Container ref
  fromRef: RefObject<HTMLElement>; // From element ref
  toRef: RefObject<HTMLElement>; // To element ref
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}) => {
  const [pathD, setPathD] = useState<string | undefined>(undefined);
  const [svgDimensions, setSvgDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Calculate the path's "d" attribute
  useEffect(() => {
    const container = containerRef.current;
    const from = fromRef.current;
    const to = toRef.current;

    if (container && from && to) {
      const containerRect = container.getBoundingClientRect();
      const fromRect = from.getBoundingClientRect();
      const toRect = to.getBoundingClientRect();

      const M_x = fromRect.left - containerRect.left + fromRect.width / 2 + startXOffset;
      const M_y = fromRect.top - containerRect.top + fromRect.height / 2 + startYOffset;

      const L_x = toRect.left - containerRect.left + toRect.width / 2 + endXOffset;
      const L_y = toRect.top - containerRect.top + toRect.height / 2 + endYOffset;

      const Q_x = (M_x + L_x) / 2 + curvature;
      const Q_y = (M_y + L_y) / 2;

      setPathD(
        `M ${M_x},${M_y} Q ${Q_x},${Q_y} ${L_x},${L_y}`
      );
      setSvgDimensions({
        width: containerRect.width,
        height: containerRect.height,
      });
    }
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  ]);

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "pointer-events-none absolute left-0 top-0 transform-gpu",
        className
      )}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />
      <path
        d={pathD}
        strokeWidth={pathWidth}
        stroke={`url(#${gradientStopColor.replace("#", "")})`}
        strokeLinecap="round"
      />
      <defs>
        <motion.linearGradient
          id={gradientStopColor.replace("#", "")}
          gradientUnits="userSpaceOnUse"
          initial={{
            x1: "0%",
            x2: "0%",
            y1: "0%",
            y2: "0%",
          }}
          animate={{
            x1: reverse ? "100%" : "0%",
            y1: reverse ? "100%" : "0%",
            x2: reverse ? "0%" : "100%",
            y2: reverse ? "0%" : "100%",
          }}
          transition={{
            delay,
            duration,
            ease: [0.16, 1, 0.3, 1], // https://easings.net/#easeOutExpo
            repeat: Infinity,
            repeatDelay: 0,
          }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0"></stop>
          <stop stopColor={gradientStartColor}></stop>
          <stop offset="32.5%" stopColor={gradientStopColor}></stop>
          <stop
            offset="100%"
            stopColor={gradientStopColor}
            stopOpacity="0"
          ></stop>
        </motion.linearGradient>
      </defs>
    </svg>
  );
};
