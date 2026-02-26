"use client";
import { motion } from "motion/react";

export function LayoutColumn({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <motion.div className={className} layout transition={{ duration: 0.3, ease: "easeInOut" }}>
      {children}
    </motion.div>
  );
}
