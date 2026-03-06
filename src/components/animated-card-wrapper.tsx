"use client";

import { motion } from "motion/react";

interface AnimatedCardWrapperProps {
  children: React.ReactNode;
  index: number;
}

export function AnimatedCardWrapper({ children, index }: AnimatedCardWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
