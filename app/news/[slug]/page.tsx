import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedNewsPostBySlug } from "@/lib/supabase/cms";

type NewsPostPageProps = {
  params: Promise<{ slug: string }>;
};

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

export async function generateMetadata({
  params,
}: NewsPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedNewsPostBySlug(slug);

  if (!post) {
    return {
      title: "News Not Found | Cumberland Mountain Music",
    };
  }

  return {
    title: `${post.title} | Cumberland Mountain Music`,
    description:
      post.excerpt ??
      "Cumberland Mountain Music news and updates from Cumberland Gap, Tennessee.",
    alternates: {
      canonical: `/news/${post.slug}`,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function NewsPostPage({ params }: NewsPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedNewsPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <article className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
          News
        </p>
        <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#f4d28b]">
          {formatDate(post.published_at)}
        </p>
        {post.image_url ? (
          <div className="mt-8 overflow-hidden rounded-lg border border-[#d7a84f]/25 bg-black/25 shadow-[0_18px_55px_rgba(0,0,0,0.28)]">
            <img
              src={post.image_url}
              alt={post.title}
              className="h-auto w-full object-cover"
            />
          </div>
        ) : null}
        <div className="mx-auto mt-8 max-w-3xl whitespace-pre-line text-left text-lg leading-8 text-[#e7d8c2]">
          {post.body || post.excerpt || "More details will be posted soon."}
        </div>
        <Link
          href="/news"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
        >
          Back to News
        </Link>
      </article>
    </main>
  );
}
