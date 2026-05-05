"use client";

import { motion, useReducedMotion } from "motion/react";

const ORBS = [
  {
    color: "hsl(172 66% 50% / 0.55)",
    className: "-top-32 -left-32 h-[520px] w-[520px] opacity-40",
    animate: {
      x: [0, 60, -20, 0],
      y: [0, 40, 80, 0],
      scale: [1, 1.15, 0.95, 1],
    },
    duration: 18,
  },
  {
    color: "hsl(38 92% 50% / 0.5)",
    className: "top-1/4 -right-40 h-[600px] w-[600px] opacity-30",
    animate: {
      x: [0, -50, 30, 0],
      y: [0, 60, -30, 0],
      scale: [1, 0.9, 1.1, 1],
    },
    duration: 22,
  },
  {
    color: "hsl(180 60% 55% / 0.45)",
    className: "-bottom-32 left-1/3 h-[460px] w-[460px] opacity-25",
    animate: {
      x: [0, 40, -60, 0],
      y: [0, -30, 20, 0],
      scale: [1, 1.05, 0.95, 1],
    },
    duration: 26,
  },
];

export function HeroAuroraBackground() {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${orb.className}`}
          style={{
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
          }}
          animate={reduce ? undefined : orb.animate}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, hsl(172 66% 50% / 0.08) 50%, transparent 70%)",
        }}
        animate={
          reduce
            ? undefined
            : {
                backgroundPosition: ["-200% 0%", "200% 0%"],
              }
        }
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
