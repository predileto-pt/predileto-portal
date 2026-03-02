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
import { Text } from "@/components/ui/text";

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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Hero */}
      <div className="border border-gray-200 bg-white px-4 py-5">
        <h1 className="text-base font-bold mb-1">{hp?.heading}</h1>
        <Text>{hp?.subheading}</Text>
      </div>

      {/* Buy / Rent links */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href={`/${locale}/comprar`}
          className="group relative overflow-hidden border border-gray-200 px-4 py-4"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0 transition-opacity duration-300 group-hover:opacity-0"
            style={{
              background:
                "linear-gradient(135deg, #d1d5db 0%, #9ca3af 50%, #d1d5db 100%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #1e3a5f 60%, #0f172a 100%)",
            }}
          />
          <span className="relative z-10 text-sm font-bold font-heading group-hover:text-white transition-colors duration-300">
            {dict.nav.buy}
          </span>
        </Link>
        <Link
          href={`/${locale}/arrendar`}
          className="group relative overflow-hidden border border-gray-200 px-4 py-4"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0 transition-opacity duration-300 group-hover:opacity-0"
            style={{
              background:
                "linear-gradient(135deg, #d1d5db 0%, #9ca3af 50%, #d1d5db 100%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #1e3a5f 60%, #0f172a 100%)",
            }}
          />
          <span className="relative z-10 text-sm font-bold font-heading group-hover:text-white transition-colors duration-300">
            {dict.nav.rent}
          </span>
        </Link>
      </div>

      {/* Sources */}
      <div>
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
        <div>
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
      <LocationBrowser locale={locale} listingSlug="comprar" />
      <LocationBrowser locale={locale} listingSlug="arrendar" />
    </div>
  );
}
