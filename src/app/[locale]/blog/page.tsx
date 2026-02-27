import Link from "next/link";
import { notFound } from "next/navigation";
import {
  isValidLocale,
  getDictionary,
  localeToDateLocale,
  type Locale,
} from "@/lib/i18n";
import { getAllPosts } from "@/lib/blog";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const blog = (dict as Record<string, Record<string, string>>).blog;
  const posts = getAllPosts();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <h1 className="text-[14px] font-bold">{blog.heading}</h1>
        <p className="text-[12px] text-gray-500">{blog.subheading}</p>
      </div>

      <div>
        {posts.map((post, i) => (
          <Link
            key={post.slug}
            href={`/${locale}/blog/${post.slug}`}
            className={`block border border-gray-200 px-4 py-4 hover:bg-gray-50 transition-colors ${i > 0 ? "-mt-px" : ""}`}
          >
            <h2 className="text-[14px] font-bold">{post.title}</h2>
            <p className="text-[13px] text-gray-600 mt-1">{post.excerpt}</p>
            <p className="text-[11px] text-gray-400 mt-2">
              {new Date(post.date).toLocaleDateString(
                localeToDateLocale[locale as Locale],
                { year: "numeric", month: "long", day: "numeric" },
              )}{" "}
              &middot; {post.author}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
