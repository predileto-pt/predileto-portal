import type { Metadata } from "next";
import { getServerLocale } from "@/lib/server-locale";
import { getDictionary } from "@/lib/i18n";
import { ReviewConsentButton } from "@/components/review-consent-button";

export const metadata: Metadata = {
  title: "Política de privacidade · Predileto",
  description:
    "Como a Predileto utiliza cookies e protege os teus dados pessoais.",
};

const CONTACT_EMAIL = "contacto@predileto.pt";

export default async function PrivacyPolicyPage() {
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);
  const p = dict.privacy;

  return (
    <article className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16">
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-heading text-ink mb-2">
          {p.title}
        </h1>
        <p className="text-xs uppercase tracking-[0.18em] text-ink-muted font-semibold">
          {p.updated}
        </p>
      </header>

      <p className="text-[15px] leading-relaxed text-ink-secondary mb-8">
        {p.intro}
      </p>

      <Section heading={p.essentialHeading}>{p.essentialBody}</Section>
      <Section heading={p.analyticsHeading}>{p.analyticsBody}</Section>
      <Section heading={p.rightsHeading}>{p.rightsBody}</Section>

      <Section heading={p.contactHeading}>
        {p.contactBody}{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="underline underline-offset-2 hover:text-ink"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </Section>

      <Section heading={p.manageHeading}>
        <p className="mb-4">{p.manageBody}</p>
        <ReviewConsentButton label={p.manageButton} />
      </Section>
    </article>
  );
}

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-heading font-bold text-ink mb-2">
        {heading}
      </h2>
      <div className="text-[15px] leading-relaxed text-ink-secondary">
        {children}
      </div>
    </section>
  );
}
