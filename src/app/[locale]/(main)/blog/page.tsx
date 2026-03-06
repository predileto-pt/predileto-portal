import Link from "next/link";
import { notFound } from "next/navigation";
import {
  isValidLocale,
  getDictionary,
  localeToDateLocale,
  type Locale,
} from "@/lib/i18n";
import { getAllPosts } from "@/lib/blog";
import { Text } from "@/components/ui/text";

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
        <h1 className="text-base font-bold">{blog.heading}</h1>
        <Text>{blog.subheading}</Text>
      </div>

      <ul className="space-y-1">
        {posts.map((post) => (
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
  );
}
