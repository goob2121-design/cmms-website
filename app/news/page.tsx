import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedNewsPosts } from "@/lib/supabase/cms";

export const metadata: Metadata = {
  title: "News | Cumberland Mountain Music",
  description:
    "Latest Cumberland Mountain Music news, announcements, and show updates from Cumberland Gap, Tennessee.",
  alternates: {
    canonical: "/news",
  },
};

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) {
    return "Recently posted";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function NewsPage() {
  const posts = await getPublishedNewsPosts();

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
          News
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Cumberland Mountain Music News
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#e7d8c2]">
          Announcements, guest reveals, photos, and updates from The Cumberland
          Mountain Music Show.
        </p>
      </section>

      {posts.length > 0 ? (
        <section className="mt-10 grid gap-5 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-lg border border-[#d7a84f]/18 bg-[#120d08]/85 shadow-[0_18px_55px_rgba(0,0,0,0.24)]"
            >
              {post.image_url ? (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="h-56 w-full object-cover"
                />
              ) : null}
              <div className="p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d7a84f]">
                  {formatDate(post.published_at)}
                </p>
                <h2 className="mt-4 text-2xl font-semibold text-white">
                  {post.title}
                </h2>
                {post.excerpt ? (
                  <p className="mt-3 leading-7 text-[#d9c8aa]">
                    {post.excerpt}
                  </p>
                ) : null}
                <Link
                  href={`/news/${post.slug}`}
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7a84f]/65 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
                >
                  Read More
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="mt-10 rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-6 text-[#d9c8aa] shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
          No news posted yet.
        </section>
      )}
    </main>
  );
}
