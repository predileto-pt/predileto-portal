import Link from "next/link";
import { notFound } from "next/navigation";
import {
  isValidLocale,
  getDictionary,
  localeToDateLocale,
  type Locale,
} from "@/lib/i18n";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();

  const post = getPostBySlug(slug);
  if (!post) notFound();

  const dict = await getDictionary(locale as Locale);
  const blog = (dict as Record<string, Record<string, string>>).blog;

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/${locale}/blog`}
        className="text-sm text-gray-400 hover:text-gray-600 inline-block mb-4"
      >
        &larr; {blog.backToList}
      </Link>

      <article className="border border-gray-200 px-4 py-4">
        <header className="pb-3 mb-4 border-b border-gray-100">
          <h1 className="text-base font-bold">{post.title}</h1>
          <p className="text-xs text-gray-400 mt-1">
            {blog.by} {post.author} &middot; {blog.publishedOn}{" "}
            {new Date(post.date).toLocaleDateString(
              localeToDateLocale[locale as Locale],
              { year: "numeric", month: "long", day: "numeric" },
            )}
          </p>
        </header>

        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.htmlContent }}
        />
      </article>
    </div>
  );
}
