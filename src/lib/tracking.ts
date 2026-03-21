import posthog from "posthog-js";

export type IntentLevel = "hot" | "warm" | "cold";

export interface TrackingEvent {
  event: string;
  properties: Record<string, unknown>;
}

export interface CTASignal {
  type: "schedule_visit" | "request_info" | "financing_simulation";
  propertyId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

class TrackingService {
  private propertyViewStart: number | null = null;
  private maxScrollDepth = 0;
  private propertyId: string | null = null;
  private scrollHandler: (() => void) | null = null;

  trackPropertyView(propertyId: string) {
    this.propertyId = propertyId;
    this.propertyViewStart = Date.now();
    this.maxScrollDepth = 0;

    posthog.capture("property_viewed", { propertyId });

    this.scrollHandler = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const depth = Math.round((scrollTop / docHeight) * 100);
        if (depth > this.maxScrollDepth) {
          this.maxScrollDepth = depth;
        }
      }
    };
    window.addEventListener("scroll", this.scrollHandler, { passive: true });
  }

  trackPropertyLeave() {
    if (this.scrollHandler) {
      window.removeEventListener("scroll", this.scrollHandler);
      this.scrollHandler = null;
    }

    if (this.propertyId && this.propertyViewStart) {
      const timeOnPage = Math.round((Date.now() - this.propertyViewStart) / 1000);
      posthog.capture("property_engagement", {
        propertyId: this.propertyId,
        timeOnPageSeconds: timeOnPage,
        maxScrollDepth: this.maxScrollDepth,
      });
    }

    this.propertyId = null;
    this.propertyViewStart = null;
    this.maxScrollDepth = 0;
  }

  trackSectionViewed(propertyId: string, section: string) {
    posthog.capture("section_viewed", { propertyId, section });
  }

  trackCTAClicked(signal: CTASignal) {
    posthog.capture("cta_clicked", {
      ctaType: signal.type,
      propertyId: signal.propertyId,
      ...signal.metadata,
    });
  }

  trackScheduleVisit(propertyId: string, data: { name: string; phone: string; preferredDate?: string }) {
    this.trackCTAClicked({
      type: "schedule_visit",
      propertyId,
      timestamp: new Date().toISOString(),
      metadata: { hasPreferredDate: !!data.preferredDate },
    });
  }

  trackRequestInfo(propertyId: string, data: { topic: string; message?: string }) {
    this.trackCTAClicked({
      type: "request_info",
      propertyId,
      timestamp: new Date().toISOString(),
      metadata: { topic: data.topic, hasMessage: !!data.message },
    });
  }

  trackFinancingSimulation(propertyId: string, data: { loanAmount: number; termYears: number; rate: number }) {
    this.trackCTAClicked({
      type: "financing_simulation",
      propertyId,
      timestamp: new Date().toISOString(),
      metadata: data,
    });
  }
}

export const tracking = new TrackingService();
