"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

const EASE = [0.22, 0.61, 0.36, 1] as const;

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
};

export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.5,
  y = 12,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const initial = shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y };

  return (
    <motion.div
      className={cn(className)}
      initial={initial}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: EASE,
      }}
    >
      {children}
    </motion.div>
  );
}

type PageRevealProps = RevealProps;

export function PageReveal({
  children,
  className,
  delay = 0,
  duration = 0.4,
  y = 8,
}: PageRevealProps) {
  return (
    <Reveal className={className} delay={delay} duration={duration} y={y}>
      {children}
    </Reveal>
  );
}

type StaggerProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
};

export function Stagger({
  children,
  className,
  delay = 0.06,
  stagger = 0.05,
}: StaggerProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      initial={shouldReduceMotion ? "visible" : "hidden"}
      animate="visible"
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : stagger,
            delayChildren: shouldReduceMotion ? 0 : delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  y?: number;
};

export function StaggerItem({
  children,
  className,
  duration = 0.5,
  y = 12,
}: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion();
  const hidden = shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y };

  return (
    <motion.div
      className={cn(className)}
      variants={{
        hidden,
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: shouldReduceMotion ? 0 : duration,
            ease: EASE,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
