"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LocationTree as LocationTreeData } from "@/lib/estate-os";
import { Title } from "@/components/ui/title";
import { Text } from "@/components/ui/text";

interface LocationTreeProps {
  locale: string;
  mode: "comprar" | "arrendar";
  heading: string;
  subheading: string;
}

export function LocationTreeSection({
  locale,
  mode,
  heading,
  subheading,
}: LocationTreeProps) {
  const [tree, setTree] = useState<LocationTreeData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/listings/locations")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: LocationTreeData | null) => {
        if (!cancelled) setTree(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const country = tree?.countries[0];

  return (
    <section className="col-span-12 border-t border-rule bg-paper">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-2xl mb-12">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary font-semibold mb-3">
            Índice
          </p>
          <Title variant="section" level={2} className="text-balance">
            {heading}
          </Title>
          <Text variant="lead" className="mt-3">
            {subheading}
          </Text>
        </div>

        {!country ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10 animate-pulse">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 w-40 bg-gray-200" />
                <div className="h-px w-full bg-gray-100" />
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-gray-100" />
                  <div className="h-3 w-5/6 bg-gray-100" />
                  <div className="h-3 w-3/4 bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
            {country.districts.map((district) => {
              const districtHref = `/${mode}?district=${encodeURIComponent(
                district.name,
              )}`;
              return (
                <div key={district.name}>
                  <Link
                    href={districtHref}
                    className="group inline-flex items-baseline gap-2 mb-2"
                  >
                    <span className="font-heading text-lg font-bold text-ink group-hover:text-primary transition-colors">
                      {district.name}
                    </span>
                    <span className="text-[11px] text-ink-muted">
                      {district.municipalities.length}
                    </span>
                    <span
                      aria-hidden
                      className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      →
                    </span>
                  </Link>
                  <div className="h-px w-12 bg-primary/40 mb-3" />
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    {district.municipalities.map((m, i) => {
                      const href = `/${mode}?district=${encodeURIComponent(
                        district.name,
                      )}&municipality=${encodeURIComponent(m.name)}`;
                      return (
                        <span key={m.name}>
                          <Link
                            href={href}
                            className="text-ink-secondary hover:text-primary hover:underline underline-offset-2"
                          >
                            {m.name}
                          </Link>
                          {i < district.municipalities.length - 1 ? (
                            <span className="text-ink-muted/60"> · </span>
                          ) : (
                            ""
                          )}
                        </span>
                      );
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
