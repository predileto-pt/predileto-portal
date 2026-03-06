import posthog from "posthog-js";

export interface MetricsService {
  trackBookingStarted(propertyId: string): void;
  trackBookingStep(propertyId: string, step: number): void;
  trackBookingCompleted(propertyId: string): void;
  trackBookingAbandoned(propertyId: string, lastStep: number): void;
}

class PostHogMetricsService implements MetricsService {
  trackBookingStarted(propertyId: string) {
    posthog.capture("booking_started", { propertyId });
  }

  trackBookingStep(propertyId: string, step: number) {
    posthog.capture("booking_step", { propertyId, step });
  }

  trackBookingCompleted(propertyId: string) {
    posthog.capture("booking_completed", { propertyId });
  }

  trackBookingAbandoned(propertyId: string, lastStep: number) {
    posthog.capture("booking_abandoned", { propertyId, lastStep });
  }
}

export const metrics: MetricsService = new PostHogMetricsService();
