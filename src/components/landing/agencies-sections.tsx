import { Title } from "@/components/ui/title";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type Copy = Record<string, string>;

/* ──────────────────────────────────────────────────────────────────
   Trust strip — sits right under the hero. Stats divided by rules.
   ────────────────────────────────────────────────────────────────── */
export function TrustStrip({ copy }: { copy: Copy }) {
  const stats = [
    { value: copy.stat1Value, label: copy.stat1Label },
    { value: copy.stat2Value, label: copy.stat2Label },
    { value: copy.stat3Value, label: copy.stat3Label },
    { value: copy.stat4Value, label: copy.stat4Label },
  ];

  return (
    <section className="col-span-12 border-y border-rule bg-paper">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <p className="text-center text-xs uppercase tracking-[0.18em] text-ink-muted mb-6">
          {copy.trustEyebrow}
        </p>
        <dl className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-rule [&>*]:px-4">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <dt className="font-heading text-3xl sm:text-4xl font-bold tracking-heading">
                <span className="landing-gradient-text">{s.value}</span>
              </dt>
              <dd className="mt-1 text-xs text-ink-secondary leading-snug">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Pain section — 4 specific pains for agencies.
   ────────────────────────────────────────────────────────────────── */
export function PainSection({ copy }: { copy: Copy }) {
  const points = [
    { title: copy.painPoint1Title, body: copy.painPoint1Body, icon: <PainIcon1 /> },
    { title: copy.painPoint2Title, body: copy.painPoint2Body, icon: <PainIcon2 /> },
    { title: copy.painPoint3Title, body: copy.painPoint3Body, icon: <PainIcon3 /> },
    { title: copy.painPoint4Title, body: copy.painPoint4Body, icon: <PainIcon4 /> },
  ];

  return (
    <section className="col-span-12 border-b border-rule bg-paper-muted py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl mb-10">
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold mb-3">
            {copy.painEyebrow}
          </p>
          <Title variant="section" level={2}>
            {copy.painHeading}
          </Title>
          <Text variant="lead" className="mt-3">
            {copy.painSubheading}
          </Text>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {points.map((p, i) => (
            <li
              key={i}
              className="bg-paper border border-rule p-5 flex gap-4"
            >
              <div className="shrink-0 w-10 h-10 rounded-full bg-paper-muted flex items-center justify-center text-ink-secondary">
                {p.icon}
              </div>
              <div className="space-y-1.5 min-w-0">
                <Title variant="card" level={3}>
                  {p.title}
                </Title>
                <Text variant="body" className="text-ink-secondary">
                  {p.body}
                </Text>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Deep features — alternating left/right with mock UI.
   ────────────────────────────────────────────────────────────────── */
export function DeepFeatures({ copy }: { copy: Copy }) {
  const items = [
    {
      title: copy.deep1Title,
      body: copy.deep1Body,
      bullets: [copy.deep1Bullet1, copy.deep1Bullet2, copy.deep1Bullet3],
      mock: <MockListing />,
    },
    {
      title: copy.deep2Title,
      body: copy.deep2Body,
      bullets: [copy.deep2Bullet1, copy.deep2Bullet2, copy.deep2Bullet3],
      mock: <MockVideo />,
    },
    {
      title: copy.deep3Title,
      body: copy.deep3Body,
      bullets: [copy.deep3Bullet1, copy.deep3Bullet2, copy.deep3Bullet3],
      mock: <MockScreening />,
    },
    {
      title: copy.deep4Title,
      body: copy.deep4Body,
      bullets: [copy.deep4Bullet1, copy.deep4Bullet2, copy.deep4Bullet3],
      mock: <MockPortals />,
    },
  ];

  return (
    <section className="col-span-12 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl mb-12">
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold mb-3">
            {copy.deepEyebrow}
          </p>
          <Title variant="section" level={2}>
            {copy.deepHeading}
          </Title>
          <Text variant="lead" className="mt-3">
            {copy.deepSubheading}
          </Text>
        </div>

        <div className="space-y-16 sm:space-y-24">
          {items.map((item, i) => {
            const reverse = i % 2 === 1;
            return (
              <div
                key={i}
                className={cn(
                  "grid gap-8 lg:gap-12 items-center lg:grid-cols-2",
                  reverse && "lg:[&>*:first-child]:order-2",
                )}
              >
                <div>
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 text-primary font-heading font-bold text-sm mb-4">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <Title variant="section" level={3} className="mb-3">
                    {item.title}
                  </Title>
                  <Text variant="lead" className="text-ink-secondary mb-6">
                    {item.body}
                  </Text>
                  <ul className="space-y-2.5">
                    {item.bullets.map((b, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-sm text-ink"
                      >
                        <CheckIcon />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border border-rule bg-paper p-2 sm:p-3 shadow-sm">
                  {item.mock}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   AI Showcase — dark contrast section.
   ────────────────────────────────────────────────────────────────── */
export function AIShowcase({ copy }: { copy: Copy }) {
  const caps = [
    { title: copy.aiCap1Title, body: copy.aiCap1Body, icon: <AIIcon1 /> },
    { title: copy.aiCap2Title, body: copy.aiCap2Body, icon: <AIIcon2 /> },
    { title: copy.aiCap3Title, body: copy.aiCap3Body, icon: <AIIcon3 /> },
    { title: copy.aiCap4Title, body: copy.aiCap4Body, icon: <AIIcon4 /> },
  ];

  return (
    <section
      className="col-span-12 relative overflow-hidden py-16 sm:py-24"
      style={{ backgroundColor: "#0e1c1b" }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, hsl(172 66% 50% / 0.25) 0%, transparent 55%), radial-gradient(ellipse at 90% 100%, hsl(38 92% 50% / 0.18) 0%, transparent 50%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl mb-12">
          <p className="text-xs uppercase tracking-[0.18em] font-semibold mb-3" style={{ color: "hsl(172 66% 60%)" }}>
            {copy.aiEyebrow}
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-heading text-white">
            {copy.aiHeading}
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
            {copy.aiSubheading}
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {caps.map((c, i) => (
            <li
              key={i}
              className="p-5 backdrop-blur-sm transition-colors hover:bg-white/[0.06]"
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="w-9 h-9 flex items-center justify-center mb-4"
                style={{
                  backgroundColor: "hsl(172 66% 50% / 0.15)",
                  color: "hsl(172 66% 60%)",
                }}
              >
                {c.icon}
              </div>
              <h3 className="font-heading text-base font-bold text-white mb-2">
                {c.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Workflow — 4 numbered steps with connector line.
   ────────────────────────────────────────────────────────────────── */
export function WorkflowSection({ copy }: { copy: Copy }) {
  const steps = [
    { title: copy.workflowStep1Title, body: copy.workflowStep1Body },
    { title: copy.workflowStep2Title, body: copy.workflowStep2Body },
    { title: copy.workflowStep3Title, body: copy.workflowStep3Body },
    { title: copy.workflowStep4Title, body: copy.workflowStep4Body },
  ];

  return (
    <section className="col-span-12 bg-paper-muted border-y border-rule py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl mb-12 text-center mx-auto">
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold mb-3">
            {copy.workflowEyebrow}
          </p>
          <Title variant="section" level={2}>
            {copy.workflowHeading}
          </Title>
        </div>

        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative">
          <div
            className="hidden lg:block absolute top-5 left-[12.5%] right-[12.5%] h-px"
            style={{
              background:
                "linear-gradient(to right, hsl(172 66% 50% / 0.4), hsl(38 92% 50% / 0.4))",
            }}
            aria-hidden
          />
          {steps.map((s, i) => (
            <li
              key={i}
              className="relative bg-paper border border-rule p-5"
            >
              <div className="absolute -top-3 left-5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-xs font-heading font-bold">
                {i + 1}
              </div>
              <div className="pt-2">
                <Title variant="card" level={3} className="mb-2">
                  {s.title}
                </Title>
                <Text variant="body" className="text-ink-secondary">
                  {s.body}
                </Text>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Testimonials — three quote cards.
   ────────────────────────────────────────────────────────────────── */
export function TestimonialsSection({ copy }: { copy: Copy }) {
  const items = [
    {
      quote: copy.testimonial1Quote,
      author: copy.testimonial1Author,
      role: copy.testimonial1Role,
    },
    {
      quote: copy.testimonial2Quote,
      author: copy.testimonial2Author,
      role: copy.testimonial2Role,
    },
    {
      quote: copy.testimonial3Quote,
      author: copy.testimonial3Author,
      role: copy.testimonial3Role,
    },
  ];

  return (
    <section className="col-span-12 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl mb-12">
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold mb-3">
            {copy.testimonialsEyebrow}
          </p>
          <Title variant="section" level={2}>
            {copy.testimonialsHeading}
          </Title>
        </div>

        <ul className="grid gap-5 lg:grid-cols-3">
          {items.map((t, i) => (
            <li
              key={i}
              className="bg-paper border border-rule p-6 flex flex-col"
            >
              <QuoteIcon />
              <blockquote className="mt-4 text-base text-ink leading-relaxed flex-1">
                “{t.quote}”
              </blockquote>
              <footer className="mt-6 pt-4 border-t border-rule flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-heading font-bold text-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(172 66% 50%), hsl(38 92% 50%))",
                  }}
                  aria-hidden
                >
                  {t.author.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-bold">{t.author}</p>
                  <p className="text-xs text-ink-muted">{t.role}</p>
                </div>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Pricing — three tiers, middle highlighted.
   ────────────────────────────────────────────────────────────────── */
export function PricingSection({ copy }: { copy: Copy }) {
  type Feature = { label: string; comingSoon?: boolean };
  type Tier = {
    name: string;
    price: string;
    period: string;
    desc: string;
    badge?: string;
    features: Feature[];
    cta: string;
    highlighted: boolean;
  };
  const tiers: Tier[] = [
    {
      name: copy.pricingTier1Name,
      price: copy.pricingTier1Price,
      period: copy.pricingTier1Period,
      desc: copy.pricingTier1Desc,
      features: [
        { label: copy.pricingTier1Feat1 },
        { label: copy.pricingTier1Feat2 },
        { label: copy.pricingTier1Feat3 },
        { label: copy.pricingTier1Feat4 },
      ],
      cta: copy.pricingTier1Cta,
      highlighted: false,
    },
    {
      name: copy.pricingTier2Name,
      price: copy.pricingTier2Price,
      period: copy.pricingTier2Period,
      desc: copy.pricingTier2Desc,
      badge: copy.pricingTier2Badge,
      features: [
        { label: copy.pricingTier2Feat1 },
        { label: copy.pricingTier2Feat2 },
        { label: copy.pricingTier2Feat3, comingSoon: true },
        { label: copy.pricingTier2Feat4, comingSoon: true },
        { label: copy.pricingTier2Feat5 },
      ],
      cta: copy.pricingTier2Cta,
      highlighted: true,
    },
    {
      name: copy.pricingTier3Name,
      price: copy.pricingTier3Price,
      period: copy.pricingTier3Period,
      desc: copy.pricingTier3Desc,
      features: [
        { label: copy.pricingTier3Feat1 },
        { label: copy.pricingTier3Feat2 },
        { label: copy.pricingTier3Feat3 },
        { label: copy.pricingTier3Feat4 },
        { label: copy.pricingTier3Feat5 },
      ],
      cta: copy.pricingTier3Cta,
      highlighted: false,
    },
  ];

  return (
    <section className="col-span-12 bg-paper-muted border-y border-rule py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl mb-12 text-center mx-auto">
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold mb-3">
            {copy.pricingEyebrow}
          </p>
          <Title variant="section" level={2}>
            {copy.pricingHeading}
          </Title>
          <Text variant="lead" className="mt-3">
            {copy.pricingSubheading}
          </Text>
        </div>

        <ul className="grid gap-5 lg:grid-cols-3 items-stretch">
          {tiers.map((t, i) => (
            <li
              key={i}
              className={cn(
                "relative bg-paper p-7 flex flex-col",
                t.highlighted
                  ? "border-2 border-primary shadow-lg lg:-mt-2 lg:-mb-2"
                  : "border border-rule",
              )}
            >
              {t.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-heading font-bold px-3 py-1">
                  {t.badge}
                </span>
              )}
              <h3 className="font-heading text-lg font-bold mb-1">{t.name}</h3>
              <p className="text-sm text-ink-secondary mb-5">{t.desc}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-heading text-4xl font-bold tracking-heading">
                  {t.price}
                </span>
                {t.period && (
                  <span className="text-sm text-ink-muted">{t.period}</span>
                )}
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {t.features.map((f, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-ink"
                  >
                    <CheckIcon />
                    <span className="flex-1">
                      {f.label}
                      {f.comingSoon && (
                        <span className="ml-2 inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-accent-warm/15 text-[hsl(38_92%_35%)]">
                          {copy.pricingComingSoon}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href="mailto:contacto@predileto.pt"
                className={cn(
                  "inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold font-heading transition-opacity hover:opacity-90",
                  t.highlighted
                    ? "bg-primary text-white shadow-md"
                    : "bg-paper border border-ink text-ink",
                )}
              >
                {t.cta}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   FAQ — accordion via native <details>.
   ────────────────────────────────────────────────────────────────── */
export function FAQSection({ copy }: { copy: Copy }) {
  const items = [
    { q: copy.faq1Q, a: copy.faq1A },
    { q: copy.faq2Q, a: copy.faq2A },
    { q: copy.faq3Q, a: copy.faq3A },
    { q: copy.faq4Q, a: copy.faq4A },
    { q: copy.faq5Q, a: copy.faq5A },
    { q: copy.faq6Q, a: copy.faq6A },
  ];

  return (
    <section className="col-span-12 py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold mb-3">
            {copy.faqEyebrow}
          </p>
          <Title variant="section" level={2}>
            {copy.faqHeading}
          </Title>
        </div>

        <ul className="border-t border-rule">
          {items.map((it, i) => (
            <li key={i} className="border-b border-rule">
              <details className="group">
                <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="text-base font-heading font-bold">
                    {it.q}
                  </span>
                  <span className="shrink-0 w-6 h-6 flex items-center justify-center text-ink-muted transition-transform group-open:rotate-45">
                    <PlusIcon />
                  </span>
                </summary>
                <div className="pb-5 -mt-1 text-sm text-ink-secondary leading-relaxed pr-10">
                  {it.a}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Final CTA — gradient banner.
   ────────────────────────────────────────────────────────────────── */
export function FinalCTA({ copy }: { copy: Copy }) {
  return (
    <section className="col-span-12 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className="relative overflow-hidden p-10 sm:p-14 text-center"
          style={{
            background:
              "linear-gradient(135deg, hsl(172 66% 42%) 0%, hsl(172 66% 32%) 60%, hsl(38 92% 50%) 130%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
            aria-hidden
          />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-heading text-white">
              {copy.finalCtaHeading}
            </h2>
            <p className="mt-4 text-base sm:text-lg" style={{ color: "rgba(255,255,255,0.85)" }}>
              {copy.finalCtaSubheading}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:contacto@predileto.pt"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-bold font-heading bg-white text-primary shadow-md transition-opacity hover:opacity-90"
              >
                {copy.finalCtaPrimary}
                <ArrowIcon />
              </a>
              <a
                href="mailto:contacto@predileto.pt?subject=Demo%20Predileto"
                className="inline-flex items-center justify-center px-7 py-3 text-sm font-bold font-heading text-white border border-white/40 transition-colors hover:bg-white/10"
              >
                {copy.finalCtaSecondary}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Mock UIs (used in DeepFeatures)
   ────────────────────────────────────────────────────────────────── */
function MockListing() {
  return (
    <div className="bg-canvas border border-rule p-4 space-y-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-ink-muted">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        A gerar descrição com IA…
      </div>
      <div className="h-32 bg-paper-muted border border-rule" />
      <div className="space-y-1.5">
        <div className="h-3 bg-paper-muted w-3/4" />
        <div className="h-3 bg-paper-muted w-full" />
        <div className="h-3 bg-paper-muted w-5/6" />
      </div>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {["T2", "Varanda", "Vista mar", "Garagem"].map((tag) => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 border border-rule bg-paper text-ink-secondary"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function MockVideo() {
  return (
    <div className="bg-canvas border border-rule p-4 space-y-3">
      <div className="relative aspect-video bg-paper-muted border border-rule flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <button
          className="relative w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-primary"
          aria-label="play"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <span className="absolute bottom-2 right-2 text-[10px] px-1.5 py-0.5 bg-black/60 text-white">
          0:42
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold">IA</span>
        <span className="text-ink-secondary">Para: Ana Costa · Foco: jardim, vista</span>
      </div>
    </div>
  );
}

function MockScreening() {
  const rows = [
    { name: "Ana Costa", score: 92, label: "Aprovado" },
    { name: "Pedro Silva", score: 78, label: "A rever" },
    { name: "Rita Lopes", score: 45, label: "Rejeitado" },
  ];
  const colors: Record<string, string> = {
    Aprovado: "bg-primary/10 text-primary",
    "A rever": "bg-accent-warm/10 text-[hsl(38_92%_40%)]",
    Rejeitado: "bg-paper-muted text-ink-muted",
  };
  return (
    <div className="bg-canvas border border-rule p-4 space-y-2">
      <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-1">
        Pipeline de candidatos
      </div>
      {rows.map((r) => (
        <div
          key={r.name}
          className="flex items-center justify-between gap-3 px-3 py-2 bg-paper border border-rule"
        >
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{r.name}</div>
            <div className="text-[10px] text-ink-muted">Score {r.score}/100</div>
          </div>
          <span className={cn("text-[10px] font-bold px-2 py-0.5", colors[r.label])}>
            {r.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function MockPortals() {
  const portals = [
    { name: "Idealista", status: "Sincronizado" },
    { name: "Imovirtual", status: "Sincronizado" },
    { name: "Casa Sapo", status: "Sincronizado" },
    { name: "Predileto", status: "Publicado" },
  ];
  return (
    <div className="bg-canvas border border-rule p-4 space-y-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-ink-muted mb-1">
        <span>Apartamento T2 · Lisboa</span>
        <span className="text-primary">Atualizado há 2m</span>
      </div>
      {portals.map((p) => (
        <div
          key={p.name}
          className="flex items-center justify-between px-3 py-2 bg-paper border border-rule"
        >
          <span className="text-sm font-medium">{p.name}</span>
          <span className="flex items-center gap-1.5 text-[11px] text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {p.status}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Icons
   ────────────────────────────────────────────────────────────────── */
function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 mt-0.5 shrink-0 text-primary"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-7 h-7 text-primary/30"
      aria-hidden
    >
      <path d="M9.4 7.5C6.8 8.6 5 11.1 5 14v3h5v-5H7.5c0-1.6 1-3 2.4-3.6L9.4 7.5zm9 0C15.8 8.6 14 11.1 14 14v3h5v-5h-2.5c0-1.6 1-3 2.4-3.6L18.4 7.5z" />
    </svg>
  );
}

function PainIcon1() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <rect x="3" y="4" width="8" height="6" rx="1" />
      <rect x="13" y="4" width="8" height="6" rx="1" />
      <rect x="3" y="14" width="8" height="6" rx="1" />
      <rect x="13" y="14" width="8" height="6" rx="1" />
    </svg>
  );
}

function PainIcon2() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

function PainIcon3() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  );
}

function PainIcon4() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <line x1="14" y1="14" x2="21" y2="21" />
      <line x1="21" y1="14" x2="14" y2="21" />
    </svg>
  );
}

function AIIcon1() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <path d="M14 4h6v6" />
      <path d="M10 14 21 3" />
      <path d="M9 21H4a1 1 0 0 1-1-1v-5" />
      <path d="m3 21 8-8" />
    </svg>
  );
}

function AIIcon2() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 4 4 5-5" />
    </svg>
  );
}

function AIIcon3() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function AIIcon4() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden>
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  );
}
