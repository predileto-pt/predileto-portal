import Link from "next/link";
import { Title } from "@/components/ui/title";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

type Copy = Record<string, string>;

/* ──────────────────────────────────────────────────────────────────
   Trust strip — sits right under the hero. Stats divided by rules.
   ────────────────────────────────────────────────────────────────── */
export function HomeTrustStrip({ copy }: { copy: Copy }) {
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
          {copy.eyebrow}
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
   Prompt examples — clickable AI search prompts.
   ────────────────────────────────────────────────────────────────── */
export function HomePromptExamples({
  copy,
  locale,
}: {
  copy: Copy;
  locale: string;
}) {
  const prompts = [
    { text: copy.p1, mode: "comprar" as const },
    { text: copy.p2, mode: "comprar" as const },
    { text: copy.p3, mode: "arrendar" as const },
    { text: copy.p4, mode: "comprar" as const },
    { text: copy.p5, mode: "comprar" as const },
    { text: copy.p6, mode: "comprar" as const },
  ];

  return (
    <section className="col-span-12 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl mb-10">
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold mb-3">
            {copy.eyebrow}
          </p>
          <Title variant="section" level={2}>
            {copy.heading}
          </Title>
          <Text variant="lead" className="mt-3">
            {copy.subheading}
          </Text>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((p, i) => {
            const href = `/${p.mode}?q=${encodeURIComponent(p.text)}`;
            return (
              <li key={i}>
                <Link
                  href={href}
                  className="group flex items-start gap-3 bg-paper border border-rule p-4 hover:border-primary/40 hover:bg-primary/[0.02] transition-colors"
                >
                  <span
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-primary/10 text-primary"
                    aria-hidden
                  >
                    <SparkleIcon />
                  </span>
                  <span className="flex-1 min-w-0 text-sm text-ink leading-relaxed">
                    “{p.text}”
                  </span>
                  <span
                    className="shrink-0 text-xs font-heading font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                    aria-hidden
                  >
                    {copy.tryNow}
                    <ArrowIcon />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Context showcase — "real cost of living" with mock UI on the side.
   ────────────────────────────────────────────────────────────────── */
export function HomeContextShowcase({ copy }: { copy: Copy }) {
  const bullets = [
    copy.bullet1,
    copy.bullet2,
    copy.bullet3,
    copy.bullet4,
  ];
  const items = [
    { label: copy.mockItem1Label, value: copy.mockItem1Value },
    { label: copy.mockItem2Label, value: copy.mockItem2Value },
    { label: copy.mockItem3Label, value: copy.mockItem3Value },
    { label: copy.mockItem4Label, value: copy.mockItem4Value },
    { label: copy.mockItem5Label, value: copy.mockItem5Value },
    { label: copy.mockItem6Label, value: copy.mockItem6Value },
  ];

  return (
    <section className="col-span-12 bg-paper-muted border-y border-rule py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:gap-14 lg:grid-cols-2 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold mb-3">
              {copy.eyebrow}
            </p>
            <Title variant="section" level={2} className="mb-4">
              {copy.heading}
            </Title>
            <Text variant="lead" className="mb-6">
              {copy.subheading}
            </Text>
            <ul className="space-y-2.5">
              {bullets.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-ink"
                >
                  <CheckIcon />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-paper border border-rule shadow-sm p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-rule">
              <div>
                <h3 className="font-heading text-base font-bold">
                  {copy.mockTitle}
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  {copy.mockMonthly}
                </p>
              </div>
              <span className="font-heading text-xl font-bold tracking-heading text-primary">
                {copy.mockPrice}
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              {items.map((it, i) => (
                <li
                  key={i}
                  className="flex flex-col text-xs"
                >
                  <span className="text-ink-muted">{it.label}</span>
                  <span className="font-medium text-ink mt-0.5">{it.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Comparison table — Predileto vs traditional portals.
   ────────────────────────────────────────────────────────────────── */
export function HomeCompareSection({ copy }: { copy: Copy }) {
  const rows = [
    { label: copy.row1Label, old: copy.row1Old, neu: copy.row1New, oldOk: false, newOk: true },
    { label: copy.row2Label, old: copy.row2Old, neu: copy.row2New, oldOk: false, newOk: true },
    { label: copy.row3Label, old: copy.row3Old, neu: copy.row3New, oldOk: false, newOk: true },
    { label: copy.row4Label, old: copy.row4Old, neu: copy.row4New, oldOk: false, newOk: true },
    { label: copy.row5Label, old: copy.row5Old, neu: copy.row5New, oldOk: false, newOk: true },
    { label: copy.row6Label, old: copy.row6Old, neu: copy.row6New, oldOk: false, newOk: true },
    { label: copy.row7Label, old: copy.row7Old, neu: copy.row7New, oldOk: false, newOk: true },
  ];

  return (
    <section className="col-span-12 py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="max-w-2xl mb-10">
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold mb-3">
            {copy.eyebrow}
          </p>
          <Title variant="section" level={2}>
            {copy.heading}
          </Title>
          <Text variant="lead" className="mt-3">
            {copy.subheading}
          </Text>
        </div>

        <div className="border border-rule bg-paper overflow-hidden">
          <div className="grid grid-cols-[1.5fr_1fr_1fr] border-b border-rule bg-paper-muted">
            <div className="px-4 py-3 text-xs uppercase tracking-wider text-ink-muted font-semibold" />
            <div className="px-4 py-3 text-sm font-heading font-bold text-ink-secondary text-center border-l border-rule">
              {copy.colOld}
            </div>
            <div className="px-4 py-3 text-sm font-heading font-bold text-primary text-center border-l border-rule bg-primary/[0.04]">
              {copy.colNew}
            </div>
          </div>
          <ul>
            {rows.map((r, i) => (
              <li
                key={i}
                className={cn(
                  "grid grid-cols-[1.5fr_1fr_1fr] items-center text-sm",
                  i !== rows.length - 1 && "border-b border-rule",
                )}
              >
                <span className="px-4 py-3.5 text-ink">{r.label}</span>
                <span className="px-4 py-3.5 text-center text-ink-muted border-l border-rule flex items-center justify-center gap-2">
                  <CrossIcon />
                  <span>{r.old}</span>
                </span>
                <span className="px-4 py-3.5 text-center text-ink border-l border-rule bg-primary/[0.04] flex items-center justify-center gap-2 font-medium">
                  <CheckIcon />
                  <span>{r.neu}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Testimonials — three quote cards.
   ────────────────────────────────────────────────────────────────── */
export function HomeTestimonials({ copy }: { copy: Copy }) {
  const items = [
    { quote: copy.t1Quote, author: copy.t1Author, role: copy.t1Role },
    { quote: copy.t2Quote, author: copy.t2Author, role: copy.t2Role },
    { quote: copy.t3Quote, author: copy.t3Author, role: copy.t3Role },
  ];

  return (
    <section className="col-span-12 bg-paper-muted border-y border-rule py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl mb-10">
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold mb-3">
            {copy.eyebrow}
          </p>
          <Title variant="section" level={2}>
            {copy.heading}
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
   FAQ — accordion via native <details>.
   ────────────────────────────────────────────────────────────────── */
export function HomeFaq({ copy }: { copy: Copy }) {
  const items = [
    { q: copy.q1, a: copy.a1 },
    { q: copy.q2, a: copy.a2 },
    { q: copy.q3, a: copy.a3 },
    { q: copy.q4, a: copy.a4 },
    { q: copy.q5, a: copy.a5 },
    { q: copy.q6, a: copy.a6 },
  ];

  return (
    <section className="col-span-12 py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold mb-3">
            {copy.eyebrow}
          </p>
          <Title variant="section" level={2}>
            {copy.heading}
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
   Final CTA — gradient banner with two CTAs.
   ────────────────────────────────────────────────────────────────── */
export function HomeFinalCta({
  copy,
  locale,
}: {
  copy: Copy;
  locale: string;
}) {
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
              {copy.heading}
            </h2>
            <p
              className="mt-4 text-base sm:text-lg"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              {copy.subheading}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/comprar`}
                className="inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-bold font-heading bg-white text-primary shadow-md transition-opacity hover:opacity-90"
              >
                {copy.primary}
                <ArrowIcon />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-7 py-3 text-sm font-bold font-heading text-white border border-white/40 transition-colors hover:bg-white/10"
              >
                {copy.secondary}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
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

function CrossIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5 shrink-0 text-ink-muted"
      aria-hidden
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
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

function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
      aria-hidden
    >
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="M6 6l2.5 2.5" />
      <path d="M15.5 15.5 18 18" />
      <path d="M6 18l2.5-2.5" />
      <path d="M15.5 8.5 18 6" />
    </svg>
  );
}
