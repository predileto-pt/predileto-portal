"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Title } from "@/components/ui/title";
import { Text } from "@/components/ui/text";
import { Small } from "@/components/ui/small";
import { HomeIllustration } from "@/components/landing/home-illustration";

type Mode = "buy" | "rent";

interface HeroCopy {
  eyebrow: string;
  heading: string;
  headingAccent: string;
  subheading: string;
  placeholderBuy: string;
  placeholderRent: string;
  modeBuy: string;
  modeRent: string;
  submit: string;
  free: string;
}

interface HomeHeroProps {
  locale: string;
  copy: HeroCopy;
}

const routeFor: Record<Mode, "comprar" | "arrendar"> = {
  buy: "comprar",
  rent: "arrendar",
};

export function HomeHero({ locale, copy }: HomeHeroProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("buy");
  const [query, setQuery] = useState("");

  const canSubmit = query.trim().length > 0;

  function submit() {
    if (!canSubmit) return;
    const path = `/${routeFor[mode]}`;
    const qs = new URLSearchParams({ q: query.trim() }).toString();
    router.push(`${path}?${qs}`);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    submit();
  }

  const placeholder =
    mode === "buy" ? copy.placeholderBuy : copy.placeholderRent;

  return (
    <section className="col-span-12 py-14 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-heading font-semibold text-primary">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              {copy.eyebrow}
            </span>

            <div className="mt-6 space-y-2">
              <Title
                variant="display"
                level={1}
                className="text-left tracking-heading"
              >
                {copy.heading}
              </Title>
              <Title
                variant="display"
                level={1}
                className="landing-gradient-text text-left tracking-heading"
              >
                {copy.headingAccent}
              </Title>
            </div>

            <Text variant="lead" className="mt-4 max-w-lg">
              {copy.subheading}
            </Text>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-3"
              data-type="home-hero-composer"
            >
              <ModeToggle mode={mode} onChange={setMode} copy={copy} />

              <div className="grid grid-cols-[1fr_auto] items-end gap-2 border border-rule bg-paper shadow-sm p-2"
                style={{ borderRadius: 20 }}
              >
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit();
                    }
                  }}
                  placeholder={placeholder}
                  rows={1}
                  aria-label={placeholder}
                  className="w-full resize-none bg-transparent outline-none leading-body placeholder:text-ink-muted overflow-auto py-1.5 px-2 text-sm max-h-40"
                  style={{ fieldSizing: "content" } as React.CSSProperties}
                />
                <button
                  type="submit"
                  disabled={!canSubmit}
                  aria-label={copy.submit}
                  className="rounded-full bg-ink text-paper flex items-center justify-center shrink-0 disabled:opacity-30 hover:opacity-80 transition-opacity h-9 w-9 cursor-pointer disabled:cursor-not-allowed"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </button>
              </div>

              <Small variant="meta" className="flex items-center gap-1.5">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
                  aria-hidden
                />
                {copy.free}
              </Small>
            </form>
          </div>

          <div className="hidden lg:block">
            <HomeIllustration className="w-full max-w-[520px] h-auto mx-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ModeToggle({
  mode,
  onChange,
  copy,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
  copy: HeroCopy;
}) {
  return (
    <div
      role="tablist"
      aria-label="Tipo de pesquisa"
      className="inline-flex rounded-full border border-rule bg-paper p-0.5"
    >
      <ToggleButton
        active={mode === "buy"}
        onClick={() => onChange("buy")}
        label={copy.modeBuy}
      />
      <ToggleButton
        active={mode === "rent"}
        onClick={() => onChange("rent")}
        label={copy.modeRent}
      />
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "px-3.5 py-1 text-xs font-heading font-semibold rounded-full cursor-pointer transition-colors",
        active
          ? "bg-ink text-paper"
          : "text-ink-subtle hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
