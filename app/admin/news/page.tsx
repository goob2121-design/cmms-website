"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";
import { supabase } from "@/lib/supabase/client";
import type { NewsPost } from "@/lib/supabase/cms";

type NewsForm = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  image_url: string;
  published_at: string;
  published: boolean;
};

const emptyForm: NewsForm = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  image_url: "",
  published_at: new Date().toISOString().slice(0, 16),
  published: true,
};

export default function AdminNewsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [form, setForm] = useState<NewsForm>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [checking, setChecking] = useState(true);

  const sortedPosts = useMemo(
    () =>
      [...posts].sort((a, b) =>
        (b.published_at ?? "").localeCompare(a.published_at ?? ""),
      ),
    [posts],
  );

  useEffect(() => {
    async function initialize() {
      if (!supabase) {
        setErrorMessage("Supabase is not configured yet.");
        setChecking(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/admin");
        return;
      }
      setChecking(false);
      await loadPosts();
    }
    initialize();
  }, [router]);

  async function loadPosts() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("news_posts")
      .select("*")
      .order("published_at", { ascending: false });
    if (error) setErrorMessage(error.message);
    else setPosts((data ?? []) as NewsPost[]);
  }

  function updateField(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value, type } = event.target;
    const checked =
      type === "checkbox" ? (event.target as HTMLInputElement).checked : false;
    if (name === "slug") setSlugTouched(true);
    setForm((current) => {
      const next = {
        ...current,
        [name]: type === "checkbox" ? checked : value,
      };
      if (name === "title" && !slugTouched && !current.id) {
        next.slug = slugify(value);
      }
      if (name === "slug") {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  function editPost(post: NewsPost) {
    setForm({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      body: post.body ?? "",
      image_url: post.image_url ?? "",
      published_at: post.published_at
        ? post.published_at.slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      published: Boolean(post.published),
    });
    setSlugTouched(true);
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setMessage("");
    setErrorMessage("");
    const slug = slugify(form.slug || form.title);
    const payload = {
      title: form.title.trim(),
      slug,
      excerpt: form.excerpt.trim() || null,
      body: form.body.trim() || null,
      image_url: form.image_url.trim() || null,
      published: form.published,
      published_at: form.published_at
        ? new Date(form.published_at).toISOString()
        : new Date().toISOString(),
    };
    const result = form.id
      ? await supabase.from("news_posts").update(payload).eq("id", form.id)
      : await supabase.from("news_posts").insert(payload);
    if (result.error) {
      setErrorMessage(result.error.message);
      return;
    }
    setMessage(form.id ? "News post updated." : "News post added.");
    setForm(emptyForm);
    setSlugTouched(false);
    await loadPosts();
  }

  async function deletePost(post: NewsPost) {
    if (!supabase || !window.confirm(`Delete "${post.title}"?`)) return;
    const { error } = await supabase.from("news_posts").delete().eq("id", post.id);
    if (error) setErrorMessage(error.message);
    else {
      setMessage("News post deleted.");
      await loadPosts();
    }
  }

  async function togglePost(post: NewsPost) {
    if (!supabase) return;
    const { error } = await supabase
      .from("news_posts")
      .update({ published: !post.published })
      .eq("id", post.id);
    if (error) setErrorMessage(error.message);
    else await loadPosts();
  }

  if (checking) {
    return <main className="relative z-10 mx-auto min-h-svh max-w-6xl px-6 pt-40 text-[#e7d8c2]">Checking admin session...</main>;
  }

  return (
    <main className="relative z-10 mx-auto min-h-svh w-full max-w-7xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="flex flex-col gap-5 border-b border-[#d7a84f]/18 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">News Manager</p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Manage News</h1>
        </div>
        <Link href="/admin/dashboard" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:text-[#f4d28b]">Dashboard</Link>
      </section>
      {message ? <p className="mt-6 rounded-md border border-emerald-300/25 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-100">{message}</p> : null}
      {errorMessage ? <p className="mt-6 rounded-md border border-red-300/25 bg-red-950/35 px-4 py-3 text-sm text-red-100">{errorMessage}</p> : null}
      <section className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <article className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-5">
          <h2 className="text-2xl font-semibold text-white">Posts</h2>
          <div className="mt-5 space-y-4">
            {sortedPosts.map((post) => (
              <div key={post.id} className="rounded-md border border-[#d7a84f]/15 bg-black/25 p-4">
                <h3 className="font-semibold text-white">{post.title}</h3>
                <p className="mt-1 text-sm text-[#d9c8aa]">{post.slug}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => editPost(post)} className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2]">Edit</button>
                  <button onClick={() => togglePost(post)} className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2]">{post.published ? "Unpublish" : "Publish"}</button>
                  <button onClick={() => deletePost(post)} className="rounded-full border border-red-300/35 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-red-100">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </article>
        <form onSubmit={savePost} className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-5">
          <h2 className="text-2xl font-semibold text-white">{form.id ? "Edit Post" : "Add Post"}</h2>
          {(["title", "slug", "image_url"] as const).map((field) => (
            <label key={field} className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">{field.replace("_", " ")}</span>
              <input name={field} value={form[field]} onChange={updateField} required={field === "title"} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]" />
            </label>
          ))}
          <label className="mt-4 block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Published At</span>
            <input type="datetime-local" name="published_at" value={form.published_at} onChange={updateField} className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]" />
          </label>
          <label className="mt-4 block"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Excerpt</span><textarea name="excerpt" value={form.excerpt} onChange={updateField} rows={3} className="mt-2 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 py-3 text-white outline-none focus:border-[#f4d28b]" /></label>
          <label className="mt-4 block"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">Body</span><textarea name="body" value={form.body} onChange={updateField} rows={8} className="mt-2 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 py-3 text-white outline-none focus:border-[#f4d28b]" /></label>
          <label className="mt-5 inline-flex items-center gap-3 text-[#e7d8c2]"><input type="checkbox" name="published" checked={form.published} onChange={updateField} className="h-5 w-5 accent-[#d7a84f]" />Published</label>
          <button className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07]">Save Post</button>
        </form>
      </section>
    </main>
  );
}
