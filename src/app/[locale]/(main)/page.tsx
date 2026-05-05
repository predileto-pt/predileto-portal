import Link from "next/link";
import { notFound } from "next/navigation";
import {
  isValidLocale,
  getDictionary,
  localeToDateLocale,
  type Locale,
} from "@/lib/i18n";
import { getAllPosts } from "@/lib/blog";
import { LocationBrowser } from "@/components/location-browser";
import { HomeHero } from "@/components/landing/home-hero";
import { ProblemSection } from "@/components/landing/problem-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FeaturesSection } from "@/components/landing/features-section";

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
  const latestPosts = getAllPosts().slice(0, 3);

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

      {latestPosts.length > 0 && (
        <div className="col-span-12 px-4 sm:px-6 max-w-6xl mx-auto w-full">
          <h2 className="text-sm font-bold mb-2">
            {(dict as Record<string, Record<string, string>>).homepage
              ?.latestPosts ?? "From Our Blog"}
          </h2>
          <ul className="space-y-1">
            {latestPosts.map((post) => (
              <li key={post.slug} className="text-sm">
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="hover:underline underline-offset-2"
                >
                  <span className="text-gray-400">
                    {new Date(post.date).toLocaleDateString(
                      localeToDateLocale[locale as Locale],
                    )}
                  </span>{" "}
                  <span>{post.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="col-span-12 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-6">
        <LocationBrowser locale={locale} listingSlug="comprar" />
        <LocationBrowser locale={locale} listingSlug="arrendar" />
      </div>
    </div>
  );
}
