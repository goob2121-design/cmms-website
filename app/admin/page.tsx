"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!supabase) {
      setErrorMessage(
        "Supabase is not configured yet. Check the public Supabase environment variables.",
      );
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage("We could not sign you in. Please check your email and password.");
      return;
    }

    router.replace("/admin/dashboard");
  }

  return (
    <main className="relative z-10 mx-auto flex min-h-svh w-full max-w-xl items-center px-6 pb-14 pt-36 sm:px-8">
      <section className="w-full rounded-lg border border-[#d7a84f]/25 bg-[linear-gradient(135deg,rgba(31,21,10,0.94),rgba(10,7,4,0.96))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.42)] sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#d7a84f]">
          Admin
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          Cumberland Mountain Music
        </h1>
        <p className="mt-3 text-[#d9c8aa]">
          Sign in to manage public website content.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="mt-2 min-h-12 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-4 text-white outline-none transition placeholder:text-[#8b7a60] focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="mt-2 min-h-12 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-4 text-white outline-none transition placeholder:text-[#8b7a60] focus:border-[#f4d28b] focus:ring-2 focus:ring-[#d7a84f]/25"
            />
          </div>

          {errorMessage ? (
            <p className="rounded-md border border-red-300/25 bg-red-950/35 px-4 py-3 text-sm text-red-100">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}
