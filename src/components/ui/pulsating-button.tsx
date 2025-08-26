"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

interface PulsatingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pulseColor?: string;
  duration?: string;
  asChild?: boolean;
}

export const PulsatingButton = React.forwardRef<
  HTMLButtonElement,
  PulsatingButtonProps
>(
  (
    {
      className,
      children,
      pulseColor = "#ffffff",
      duration = "1.5s",
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          "relative flex cursor-pointer items-center justify-center rounded-full bg-primary px-8 py-4 text-center text-lg font-semibold text-primary-foreground",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
          "before:absolute before:inset-0 before:size-full before:rounded-full before:bg-inherit before:opacity-50 before:animate-pulse",
          className,
        )}
        style={
          {
            "--pulse-color": pulseColor,
            "--duration": duration,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </Comp>
    );
  },
);

PulsatingButton.displayName = "PulsatingButton";