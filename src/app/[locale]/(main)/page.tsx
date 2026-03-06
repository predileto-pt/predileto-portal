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


export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const hp = (dict as Record<string, Record<string, string>>).homepage;
  const latestPosts = getAllPosts().slice(0, 3);

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Hero */}
      <section className="landing-hero relative overflow-hidden col-span-12 py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Hero content */}
            <div className="max-w-xl">
              {/* Eyebrow badge */}
              <div
                className="landing-fade-in mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium landing-shimmer"
                style={{
                  borderColor: "hsl(172 66% 50% / 0.3)",
                  backgroundColor: "hsl(172 66% 50% / 0.1)",
                  animationDelay: "0ms",
                }}
              >
                <svg className="h-3.5 w-3.5" style={{ color: "hsl(38 92% 50%)" }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span style={{ color: "hsl(172 66% 50%)" }}>
                  {hp?.eyebrow ?? "Todos os imóveis de Portugal num só lugar"}
                </span>
              </div>

              <h1
                className="landing-fade-in font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
                style={{ animationDelay: "100ms" }}
              >
                {hp?.heading}
                <span className="landing-gradient-text block">
                  {hp?.headingAccent ?? "Encontre a sua casa."}
                </span>
              </h1>

              <p
                className="landing-fade-in mt-6 text-lg leading-relaxed text-gray-500 sm:text-xl"
                style={{ animationDelay: "200ms" }}
              >
                {hp?.subheading}
              </p>

              {/* CTAs */}
              <div
                className="landing-fade-in mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4"
                style={{ animationDelay: "300ms" }}
              >
                <Link
                  href={`/${locale}/comprar`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold font-heading text-white shadow-lg transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "hsl(172 66% 50%)" }}
                >
                  {dict.nav.buy}
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href={`/${locale}/arrendar`}
                  className="inline-flex items-center justify-center gap-2 border border-gray-300 px-6 py-3 text-sm font-bold font-heading transition-colors hover:bg-gray-50"
                >
                  {dict.nav.rent}
                </Link>
              </div>

              {/* Social proof */}
              <div
                className="landing-fade-in mt-10 flex items-center gap-4"
                style={{ animationDelay: "400ms" }}
              >
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="h-4 w-4" style={{ color: "hsl(38 92% 50%)" }} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  {hp?.socialProof ?? "7 fontes agregadas — milhares de imóveis atualizados diariamente"}
                </p>
              </div>
            </div>

            {/* Floating property card */}
            <div className="landing-fade-in hidden lg:block" style={{ animationDelay: "300ms" }}>
              <div className="landing-float relative mx-auto w-80">
                <div
                  className="bg-white border border-gray-200 p-5 space-y-3"
                  style={{ boxShadow: "0 25px 50px -12px hsl(172 66% 50% / 0.1)" }}
                >
                  <div className="flex items-center gap-2 text-base font-bold font-heading">
                    <svg className="h-5 w-5" style={{ color: "hsl(172 66% 50%)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    {hp?.cardTitle ?? "Imóvel em destaque"}
                  </div>
                  <div className="bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-400">{hp?.cardLocation ?? "Localização"}</p>
                    <p className="text-sm font-medium">Lisboa, Estrela</p>
                  </div>
                  <div className="bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-400">{hp?.cardPrice ?? "Preço"}</p>
                    <p className="text-sm font-medium">€ 385.000</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="border border-gray-200 p-2 text-center text-xs text-gray-500">T2</div>
                    <div
                      className="border-2 p-2 text-center text-xs font-medium"
                      style={{ borderColor: "hsl(172 66% 50%)", color: "hsl(172 66% 50%)" }}
                    >
                      85 m²
                    </div>
                    <div className="border border-gray-200 p-2 text-center text-xs text-gray-500">2 WC</div>
                  </div>
                  <div
                    className="w-full py-2 text-center text-sm font-medium text-white"
                    style={{ backgroundColor: "hsl(172 66% 50%)" }}
                  >
                    {hp?.cardCta ?? "Ver detalhes"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sources */}
      <div className="col-span-12 sm:col-span-6 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <h2 className="text-sm font-bold mb-2">
          {hp?.sourcesHeading ?? "We search for you on"}
        </h2>
        <ul className="space-y-1">
          {[
            { name: "Idealista", url: "https://www.idealista.pt" },
            { name: "SAPO Imobiliário", url: "https://casa.sapo.pt" },
            { name: "Imovirtual", url: "https://www.imovirtual.com" },
            { name: "ERA", url: "https://www.era.pt" },
            { name: "Century 21", url: "https://www.century21.pt" },
            { name: "Supercasa", url: "https://supercasa.pt" },
            { name: "CasaYes", url: "https://www.casayes.pt" },
          ].map((source) => (
            <li key={source.name} className="text-sm">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline underline-offset-2"
              >
                <span>{source.name}</span>{" "}
                <span className="text-gray-400">{source.url.replace("https://", "")}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Latest blog posts */}
      {latestPosts.length > 0 && (
        <div className="col-span-12 sm:col-span-6 px-4 sm:px-6 max-w-6xl mx-auto w-full">
          <h2 className="text-sm font-bold mb-2">
            {hp?.latestPosts ?? "From Our Blog"}
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

      {/* Location browsers */}
      <div className="col-span-12 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-6">
        <LocationBrowser locale={locale} listingSlug="comprar" />
        <LocationBrowser locale={locale} listingSlug="arrendar" />
      </div>
    </div>
  );
}
