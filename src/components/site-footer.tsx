import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { getServerLocale } from "@/lib/server-locale";

export async function SiteFooter() {
  const locale = await getServerLocale();
  const dict = await getDictionary(locale);
  const f = dict.footer;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-rule bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
          <div>
            <p className="text-base font-heading font-bold text-ink mb-1.5">
              {dict.nav.title}
            </p>
            <p className="text-sm text-ink-secondary max-w-sm leading-relaxed">
              {f.tagline}
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-heading">
            <Link
              href="/politica-privacidade"
              className="text-ink-secondary hover:text-ink transition-colors"
            >
              {f.privacy}
            </Link>
            <Link
              href="/imobiliarias"
              className="text-ink-secondary hover:text-ink transition-colors"
            >
              {f.agencies}
            </Link>
          </nav>
        </div>
        <div className="mt-10 pt-6 border-t border-rule text-[11px] uppercase tracking-[0.18em] text-ink-muted font-semibold">
          © {year} {dict.nav.title}. {f.rights}
        </div>
      </div>
    </footer>
  );
}
