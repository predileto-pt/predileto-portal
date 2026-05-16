import Link from "next/link";
import type { BlogPost } from "@/lib/blog";
import { localeToDateLocale, type Locale } from "@/lib/i18n";
import { Small } from "@/components/ui/small";

interface BlogSidebarProps {
  locale: string;
  posts: BlogPost[];
}

export function BlogSidebar({ locale, posts }: BlogSidebarProps) {
  if (posts.length === 0) return null;

  return (
    <div className="lg:sticky lg:top-4 border border-gray-200 bg-white p-3">
      <h2 className="text-sm font-bold mb-2">Blog</h2>
      <ul className="space-y-2">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="hover:underline underline-offset-2"
            >
              <span className="text-sm text-gray-600">{post.title}</span>
              <Small className="block">
                {new Date(post.date).toLocaleDateString(
                  localeToDateLocale[locale as Locale],
                )}
              </Small>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
