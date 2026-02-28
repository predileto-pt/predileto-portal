import Link from "next/link";
import { notFound } from "next/navigation";
import {
  isValidLocale,
  getDictionary,
  localeToDateLocale,
  type Locale,
} from "@/lib/i18n";
import { getAllPosts } from "@/lib/blog";

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
      <div className="border border-gray-200 px-4 py-5">
        <h1 className="text-[14px] font-bold mb-1">{hp?.heading}</h1>
        <p className="text-[12px] text-gray-500 leading-relaxed">
          {hp?.subheading}
        </p>
      </div>

      {/* Buy / Rent links */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href={`/${locale}/comprar`}
          className="border border-gray-200 px-4 py-4 hover:bg-gray-50 transition-colors"
        >
          <span className="text-[13px] font-bold">{dict.nav.buy}</span>
        </Link>
        <Link
          href={`/${locale}/arrendar`}
          className="border border-gray-200 px-4 py-4 hover:bg-gray-50 transition-colors"
        >
          <span className="text-[13px] font-bold">{dict.nav.rent}</span>
        </Link>
      </div>

      {/* Sources */}
      <div>
        <h2 className="text-[13px] font-bold mb-2">
          {hp?.sourcesHeading ?? "We search for you on"}
        </h2>
        <ul className="space-y-1">
          {[
            { name: "Idealista", url: "https://www.idealista.pt" },
            { name: "SAPO Imobiliário", url: "https://casa.sapo.pt" },
            { name: "Imovirtual", url: "https://www.imovirtual.com" },
            { name: "ERA", url: "https://www.era.pt" },
            { name: "RE/MAX", url: "https://www.remax.pt" },
            { name: "Century 21", url: "https://www.century21.pt" },
            { name: "Supercasa", url: "https://supercasa.pt" },
            { name: "CasaYes", url: "https://www.casayes.pt" },
          ].map((source) => (
            <li key={source.name} className="text-[12px]">
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
          <h2 className="text-[13px] font-bold mb-2">
            {hp?.latestPosts ?? "From Our Blog"}
          </h2>
          <ul className="space-y-1">
            {latestPosts.map((post) => (
              <li key={post.slug} className="text-[12px]">
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
    </div>
  );
}
