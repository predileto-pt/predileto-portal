"use client";

import { motion } from "motion/react";

const TOTAL_STEPS = 5;

export function ProgressBar({ currentStep }: { currentStep: number }) {
  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
      <motion.div
        className="h-full bg-blue-600"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    </div>
  );
}
