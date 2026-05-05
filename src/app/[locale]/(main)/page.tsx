import { notFound } from "next/navigation";
import {
  isValidLocale,
  getDictionary,
  type Locale,
} from "@/lib/i18n";
import { HomeHero } from "@/components/landing/home-hero";
import { ProblemSection } from "@/components/landing/problem-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FeaturesSection } from "@/components/landing/features-section";
import {
  HomeTrustStrip,
  HomePromptExamples,
  HomeContextShowcase,
  HomeCompareSection,
  HomeTestimonials,
  HomeFaq,
  HomeFinalCta,
} from "@/components/landing/home-sections";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const sections = dict as unknown as Record<string, Record<string, string>>;
  const hp = sections.homeHero;
  const problem = sections.homeProblem;
  const how = sections.homeHow;
  const features = sections.homeFeatures;
  const trust = sections.homeTrust;
  const prompts = sections.homePrompts;
  const context = sections.homeContext;
  const compare = sections.homeCompare;
  const testimonials = sections.homeTestimonials;
  const faq = sections.homeFaq;
  const finalCta = sections.homeFinalCta;

  return (
    <div className="grid grid-cols-12 gap-6">
      <HomeHero
        locale={locale}
        copy={{
          eyebrow: hp?.eyebrow ?? "",
          heading: hp?.heading ?? "",
          headingAccent: hp?.headingAccent ?? "",
          subheading: hp?.subheading ?? "",
          placeholderBuy: hp?.placeholderBuy ?? "",
          placeholderRent: hp?.placeholderRent ?? "",
          modeBuy: hp?.modeBuy ?? dict.nav.buy,
          modeRent: hp?.modeRent ?? dict.nav.rent,
          submit: hp?.submit ?? "",
          free: hp?.free ?? "",
        }}
      />

      <HomeTrustStrip copy={trust} />

      <ProblemSection
        copy={{
          heading: problem?.heading ?? "",
          subheading: problem?.subheading ?? "",
          pain1Title: problem?.pain1Title ?? "",
          pain1Body: problem?.pain1Body ?? "",
          pain2Title: problem?.pain2Title ?? "",
          pain2Body: problem?.pain2Body ?? "",
          pain3Title: problem?.pain3Title ?? "",
          pain3Body: problem?.pain3Body ?? "",
        }}
      />

      <HomePromptExamples copy={prompts} locale={locale} />

      <div id="how-it-works" className="col-span-12 contents">
        <HowItWorksSection
          copy={{
            heading: how?.heading ?? "",
            subheading: how?.subheading ?? "",
            step1Title: how?.step1Title ?? "",
            step1Body: how?.step1Body ?? "",
            step2Title: how?.step2Title ?? "",
            step2Body: how?.step2Body ?? "",
            step3Title: how?.step3Title ?? "",
            step3Body: how?.step3Body ?? "",
          }}
        />
      </div>

      <HomeContextShowcase copy={context} />

      <FeaturesSection
        copy={{
          heading: features?.heading ?? "",
          subheading: features?.subheading ?? "",
          feat1Title: features?.feat1Title ?? "",
          feat1Body: features?.feat1Body ?? "",
          feat2Title: features?.feat2Title ?? "",
          feat2Body: features?.feat2Body ?? "",
          feat3Title: features?.feat3Title ?? "",
          feat3Body: features?.feat3Body ?? "",
          feat4Title: features?.feat4Title ?? "",
          feat4Body: features?.feat4Body ?? "",
          feat5Title: features?.feat5Title ?? "",
          feat5Body: features?.feat5Body ?? "",
          feat6Title: features?.feat6Title ?? "",
          feat6Body: features?.feat6Body ?? "",
        }}
      />

      <HomeCompareSection copy={compare} />

      <HomeTestimonials copy={testimonials} />

      <HomeFaq copy={faq} />

      <HomeFinalCta copy={finalCta} locale={locale} />
    </div>
  );
}
