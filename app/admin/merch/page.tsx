"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { MerchProduct } from "@/lib/supabase/cms";

type MerchForm = {
  id?: string;
  title: string;
  description: string;
  price: string;
  image_url: string;
  product_url: string;
  display_order: string;
  published: boolean;
};

type FetchedProduct = {
  title: string;
  price: string;
  image_url: string;
  product_url: string;
};

const emptyForm: MerchForm = {
  title: "",
  description: "",
  price: "",
  image_url: "",
  product_url: "",
  display_order: "0",
  published: true,
};

function toForm(product: MerchProduct): MerchForm {
  return {
    id: product.id,
    title: product.title,
    description: product.description ?? "",
    price: product.price ?? "",
    image_url: product.image_url ?? "",
    product_url: product.product_url,
    display_order: String(product.display_order ?? 0),
    published: Boolean(product.published),
  };
}

export default function AdminMerchPage() {
  const router = useRouter();
  const [products, setProducts] = useState<MerchProduct[]>([]);
  const [form, setForm] = useState<MerchForm>(emptyForm);
  const [checking, setChecking] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const sortedProducts = useMemo(
    () =>
      [...products].sort(
        (a, b) =>
          (a.display_order ?? 0) - (b.display_order ?? 0) ||
          a.title.localeCompare(b.title),
      ),
    [products],
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
      await loadProducts();
    }

    initialize();
  }, [router]);

  async function loadProducts() {
    if (!supabase) {
      return;
    }

    const { data, error } = await supabase
      .from("merch_products")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setProducts((data ?? []) as MerchProduct[]);
  }

  function updateField(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    const checked =
      event.target instanceof HTMLInputElement &&
      event.target.type === "checkbox"
        ? event.target.checked
        : false;

    setForm((current) => ({
      ...current,
      [name]:
        event.target instanceof HTMLInputElement &&
        event.target.type === "checkbox"
          ? checked
          : value,
    }));
  }

  async function fetchProduct() {
    setMessage("");
    setErrorMessage("");

    if (!form.product_url.trim()) {
      setErrorMessage("Paste a Fourthwall product URL first.");
      return;
    }

    setFetching(true);
    const response = await fetch("/api/merch/fetch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: form.product_url.trim() }),
    });
    const result = (await response.json()) as
      | FetchedProduct
      | { error?: string };
    setFetching(false);

    if (!response.ok) {
      setErrorMessage(
        "error" in result && result.error
          ? result.error
          : "Unable to fetch product details.",
      );
      return;
    }

    const fetched = result as FetchedProduct;
    setForm((current) => ({
      ...current,
      title: fetched.title,
      price: fetched.price,
      image_url: fetched.image_url,
      product_url: fetched.product_url,
    }));
    setMessage("Product details fetched. Review and save when ready.");
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!supabase) {
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      price: form.price.trim() || null,
      image_url: form.image_url.trim() || null,
      product_url: form.product_url.trim(),
      display_order: Number.parseInt(form.display_order, 10) || 0,
      published: form.published,
    };

    if (!payload.title || !payload.product_url) {
      setErrorMessage("Title and Product URL are required.");
      return;
    }

    const result = form.id
      ? await supabase.from("merch_products").update(payload).eq("id", form.id)
      : await supabase
          .from("merch_products")
          .upsert(payload, { onConflict: "product_url" });

    if (result.error) {
      setErrorMessage(result.error.message);
      return;
    }

    setMessage(form.id ? "Merch product updated." : "Merch product added.");
    setForm(emptyForm);
    await loadProducts();
  }

  function editProduct(product: MerchProduct) {
    setForm(toForm(product));
    setMessage("");
    setErrorMessage("");
  }

  async function deleteProduct(product: MerchProduct) {
    if (
      !supabase ||
      !window.confirm(`Delete "${product.title}" from the merch page?`)
    ) {
      return;
    }

    const { error } = await supabase
      .from("merch_products")
      .delete()
      .eq("id", product.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Merch product deleted.");
    if (form.id === product.id) {
      setForm(emptyForm);
    }
    await loadProducts();
  }

  async function toggleProduct(product: MerchProduct) {
    if (!supabase) {
      return;
    }

    const { error } = await supabase
      .from("merch_products")
      .update({ published: !product.published })
      .eq("id", product.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadProducts();
  }

  if (checking) {
    return (
      <main className="relative z-10 mx-auto min-h-svh max-w-6xl px-6 pt-40 text-[#e7d8c2]">
        Checking admin session...
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto min-h-svh w-full max-w-7xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="flex flex-col gap-5 border-b border-[#d7a84f]/18 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
            Merch Manager
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Manage Merch
          </h1>
        </div>
        <Link
          href="/admin/dashboard"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2]"
        >
          Dashboard
        </Link>
      </section>

      {message ? (
        <p className="mt-6 rounded-md border border-emerald-300/25 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-100">
          {message}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="mt-6 rounded-md border border-red-300/25 bg-red-950/35 px-4 py-3 text-sm text-red-100">
          {errorMessage}
        </p>
      ) : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <article className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-5">
          <h2 className="text-2xl font-semibold text-white">Products</h2>
          <div className="mt-5 space-y-4">
            {sortedProducts.length === 0 ? (
              <p className="text-[#d9c8aa]">
                No merch products saved yet. The public page will use fallback
                products until you add items here.
              </p>
            ) : null}
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-md border border-[#d7a84f]/15 bg-black/25 p-4"
              >
                <div className="flex gap-4">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt=""
                      className="h-20 w-20 rounded-md object-cover"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white">
                      {product.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#d9c8aa]">
                      {product.price ?? "No price"} /{" "}
                      {product.published ? "Published" : "Draft"}
                    </p>
                    <p className="mt-1 truncate text-xs text-[#bda987]">
                      {product.product_url}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => editProduct(product)}
                    className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleProduct(product)}
                    className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2]"
                  >
                    {product.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProduct(product)}
                    className="rounded-full border border-red-300/35 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <form
          onSubmit={saveProduct}
          className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-5"
        >
          <h2 className="text-2xl font-semibold text-white">
            {form.id ? "Edit Product" : "Add Product"}
          </h2>
          <label className="mt-4 block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
              Fourthwall Product URL
            </span>
            <input
              name="product_url"
              value={form.product_url}
              onChange={updateField}
              required
              className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]"
            />
          </label>
          <button
            type="button"
            onClick={fetchProduct}
            disabled={fetching}
            className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7a84f]/65 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] disabled:opacity-60"
          >
            {fetching ? "Fetching..." : "Fetch From Fourthwall"}
          </button>

          <label className="mt-4 block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
              Title
            </span>
            <input
              name="title"
              value={form.title}
              onChange={updateField}
              required
              className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
              Price
            </span>
            <input
              name="price"
              value={form.price}
              onChange={updateField}
              className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
              Image URL
            </span>
            <input
              name="image_url"
              value={form.image_url}
              onChange={updateField}
              className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]"
            />
          </label>
          {form.image_url ? (
            <img
              src={form.image_url}
              alt="Product preview"
              className="mt-4 h-48 w-full rounded-md object-cover"
            />
          ) : null}
          <label className="mt-4 block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
              Description
            </span>
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              rows={4}
              className="mt-2 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 py-3 text-white outline-none focus:border-[#f4d28b]"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
              Display Order
            </span>
            <input
              name="display_order"
              type="number"
              value={form.display_order}
              onChange={updateField}
              className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]"
            />
          </label>
          <label className="mt-5 inline-flex items-center gap-3 text-[#e7d8c2]">
            <input
              type="checkbox"
              name="published"
              checked={form.published}
              onChange={updateField}
              className="h-5 w-5 accent-[#d7a84f]"
            />
            Published
          </label>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07]">
              Save Product
            </button>
            {form.id ? (
              <button
                type="button"
                onClick={() => setForm(emptyForm)}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/45 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#f8efe2]"
              >
                Clear
              </button>
            ) : null}
          </div>
        </form>
      </section>
    </main>
  );
}
