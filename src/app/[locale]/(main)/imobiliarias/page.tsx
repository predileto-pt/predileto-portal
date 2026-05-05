import { notFound } from "next/navigation";
import { isValidLocale, getDictionary, type Locale } from "@/lib/i18n";
import { ScreenshotCarousel } from "@/components/screenshot-carousel";
import { HeroAuroraBackground } from "@/components/landing/hero-aurora-background";
import {
  TrustStrip,
  PainSection,
  DeepFeatures,
  AIShowcase,
  WorkflowSection,
  TestimonialsSection,
  PricingSection,
  FAQSection,
  FinalCTA,
} from "@/components/landing/agencies-sections";
import fs from "fs";
import path from "path";

function getScreenshots(): string[] {
  const dir = path.join(process.cwd(), "public", "screenshots");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort()
    .map((f) => `/screenshots/${f}`);
}

export default async function AgenciesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const ag = (dict as Record<string, Record<string, string>>).agencies;
  const screenshots = getScreenshots();

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Hero */}
      <section className="landing-hero relative overflow-hidden col-span-12 py-20 sm:py-28 lg:py-36">
        <HeroAuroraBackground />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            {/* Eyebrow */}
            <div
              className="landing-fade-in mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium landing-shimmer"
              style={{
                borderColor: "hsl(172 66% 50% / 0.3)",
                backgroundColor: "hsl(172 66% 50% / 0.1)",
                animationDelay: "0ms",
              }}
            >
              <svg
                className="h-3.5 w-3.5"
                style={{ color: "hsl(38 92% 50%)" }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-4" />
                <path d="M9 9h1" />
                <path d="M9 13h1" />
                <path d="M9 17h1" />
              </svg>
              <span style={{ color: "hsl(172 66% 50%)" }}>{ag.eyebrow}</span>
            </div>

            <h1
              className="landing-fade-in font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
              style={{ animationDelay: "100ms" }}
            >
              {ag.heading}
              <span className="landing-gradient-text block">
                {ag.headingAccent}
              </span>
            </h1>

            <p
              className="landing-fade-in mt-6 text-lg leading-relaxed text-gray-500 sm:text-xl"
              style={{ animationDelay: "200ms" }}
            >
              {ag.subheading}
            </p>

            <div
              className="landing-fade-in mt-8"
              style={{ animationDelay: "300ms" }}
            >
              <a
                href="mailto:contacto@predileto.pt"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold font-heading text-white shadow-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: "hsl(172 66% 50%)" }}
              >
                {ag.cta}
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <TrustStrip copy={ag} />

      <PainSection copy={ag} />

      <DeepFeatures copy={ag} />

      <AIShowcase copy={ag} />

      <WorkflowSection copy={ag} />

      {/* Screenshots carousel */}
      {screenshots.length > 0 && (
        <section className="col-span-12 px-4 sm:px-6 max-w-6xl mx-auto w-full py-14 sm:py-20">
          <h2 className="font-heading text-2xl font-bold mb-6 text-center">
            {ag.screenshotsHeading}
          </h2>
          <ScreenshotCarousel images={screenshots} />
        </section>
      )}

      <TestimonialsSection copy={ag} />

      <PricingSection copy={ag} />

      <FAQSection copy={ag} />

      <FinalCTA copy={ag} />
    </div>
  );
}
