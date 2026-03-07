"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { metrics } from "@/lib/metrics";
import { BookingFormProvider } from "./booking-form-context";
import { ProgressBar } from "./progress-bar";
import { BackButton } from "./back-button";
import { Step1Agreement } from "./step-1-agreement";
import { Step2PersonalInfo } from "./step-2-personal-info";
import { Step3ContactInfo } from "./step-3-contact-info";
import { Step3Documents } from "./step-3-documents";
import { Step5Review } from "./step-5-review";
import { Step6Success } from "./step-6-success";

const COOKIE_PREFIX = "booking-step-";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${COOKIE_MAX_AGE}`;
}

interface BookingClientPageProps {
  locale: string;
  propertyId: string;
}

export function BookingClientPage({ locale, propertyId }: BookingClientPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const cookieKey = `${COOKIE_PREFIX}${propertyId}`;
  const urlStep = searchParams.get("step");
  const initialStep = urlStep ? Number(urlStep) : null;
  const cookieStep = typeof window !== "undefined" ? getCookie(cookieKey) : null;
  const resolvedStep = initialStep ?? (cookieStep ? Number(cookieStep) : 1);

  const [step, setStep] = useState(resolvedStep);
  const [direction, setDirection] = useState(1);
  const trackedStart = useRef(false);
  const prevStepRef = useRef(step);

  // Track booking start once
  useEffect(() => {
    if (!trackedStart.current) {
      trackedStart.current = true;
      metrics.trackBookingStarted(propertyId);
      metrics.trackBookingStep(propertyId, step);
    }
  }, [propertyId, step]);

  // Sync step to URL and cookie, track only on actual step changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("step") !== String(step)) {
      params.set("step", String(step));
      router.replace(`${pathname}?${params.toString()}`);
    }
    setCookie(cookieKey, String(step));

    if (prevStepRef.current !== step) {
      metrics.trackBookingStep(propertyId, step);
      prevStepRef.current = step;
    }
  }, [step, pathname, router, searchParams, cookieKey, propertyId]);

  // Track abandonment on unmount
  useEffect(() => {
    const currentStep = step;
    return () => {
      if (currentStep < 6) {
        metrics.trackBookingAbandoned(propertyId, currentStep);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => {
      const next = Math.min(s + 1, 6);
      if (next === 6) metrics.trackBookingCompleted(propertyId);
      return next;
    });
  }, [propertyId]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  let stepContent: React.ReactNode;
  switch (step) {
    case 1:
      stepContent = <Step1Agreement onNext={goNext} />;
      break;
    case 2:
      stepContent = <Step2PersonalInfo onNext={goNext} onBack={goBack} />;
      break;
    case 3:
      stepContent = <Step3ContactInfo onNext={goNext} onBack={goBack} />;
      break;
    case 4:
      stepContent = <Step3Documents onNext={goNext} onBack={goBack} />;
      break;
    case 5:
      stepContent = <Step5Review propertyId={propertyId} onNext={goNext} onBack={goBack} />;
      break;
    case 6:
      stepContent = <Step6Success locale={locale} />;
      break;
    default:
      stepContent = <Step1Agreement onNext={goNext} />;
  }

  return (
    <BookingFormProvider>
      <ProgressBar currentStep={step} />
      <BackButton locale={locale} />

      <div className="flex items-center justify-center min-h-screen px-4 py-16">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full"
          >
            {stepContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </BookingFormProvider>
  );
}
