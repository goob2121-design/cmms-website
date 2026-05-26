"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { TickerMessage } from "@/lib/supabase/cms";

type TickerForm = {
  id?: string;
  message: string;
  active: boolean;
  display_order: string;
};

const emptyForm: TickerForm = {
  message: "",
  active: true,
  display_order: "0",
};

const defaultTickerSpeed = "30";
const tickerSpeedPresets = [
  { label: "Faster", value: "18" },
  { label: "Normal", value: "30" },
  { label: "Slower", value: "45" },
];

function toForm(message: TickerMessage): TickerForm {
  return {
    id: message.id,
    message: message.message,
    active: Boolean(message.active),
    display_order: String(message.display_order ?? 0),
  };
}

function toPayload(form: TickerForm) {
  return {
    message: form.message.trim(),
    active: form.active,
    display_order: Number.parseInt(form.display_order, 10) || 0,
  };
}

export default function AdminTickerPage() {
  const router = useRouter();
  const [tickerMessages, setTickerMessages] = useState<TickerMessage[]>([]);
  const [form, setForm] = useState<TickerForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [checking, setChecking] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [tickerSpeed, setTickerSpeed] = useState(defaultTickerSpeed);

  const sortedMessages = useMemo(
    () =>
      [...tickerMessages].sort(
        (a, b) =>
          (a.display_order ?? 0) - (b.display_order ?? 0) ||
          a.message.localeCompare(b.message),
      ),
    [tickerMessages],
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
      await Promise.all([loadTickerMessages(), loadTickerSettings()]);
    }

    initialize();
  }, [router]);

  async function loadTickerMessages() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("ticker_messages")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) setErrorMessage(error.message);
    else setTickerMessages((data ?? []) as TickerMessage[]);
  }

  async function loadTickerSettings() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("setting_key", "homepage_ticker_speed")
      .maybeSingle();

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setTickerSpeed(String(data?.setting_value ?? defaultTickerSpeed));
  }

  function clampTickerSpeed(value: string) {
    const speed = Number.parseInt(value, 10);
    if (!Number.isFinite(speed)) return defaultTickerSpeed;
    return String(Math.min(90, Math.max(10, speed)));
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, type, value } = event.target;
    const checked =
      type === "checkbox" ? (event.target as HTMLInputElement).checked : false;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function editTickerMessage(tickerMessage: TickerMessage) {
    setForm(toForm(tickerMessage));
    setMessage("");
    setErrorMessage("");
  }

  function startNewMessage() {
    setForm(emptyForm);
    setMessage("");
    setErrorMessage("");
  }

  async function saveTickerMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setMessage("");
    setErrorMessage("");

    const payload = toPayload(form);
    if (!payload.message) {
      setErrorMessage("Message is required.");
      return;
    }

    setIsSaving(true);
    const result = form.id
      ? await supabase.from("ticker_messages").update(payload).eq("id", form.id)
      : await supabase.from("ticker_messages").insert(payload);
    setIsSaving(false);

    if (result.error) {
      setErrorMessage(result.error.message);
      return;
    }

    setMessage(form.id ? "Ticker message updated." : "Ticker message added.");
    setForm(emptyForm);
    await loadTickerMessages();
  }

  async function saveTickerSettings(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!supabase) return;
    setMessage("");
    setErrorMessage("");

    const clampedSpeed = clampTickerSpeed(tickerSpeed);
    setIsSavingSettings(true);
    const { error } = await supabase.from("site_settings").upsert(
      {
        setting_key: "homepage_ticker_speed",
        setting_value: clampedSpeed,
      },
      { onConflict: "setting_key" },
    );
    setIsSavingSettings(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setTickerSpeed(clampedSpeed);
    setMessage("Ticker settings saved.");
  }

  async function deleteTickerMessage(tickerMessage: TickerMessage) {
    if (!supabase || !window.confirm("Delete this ticker message?")) return;
    const { error } = await supabase
      .from("ticker_messages")
      .delete()
      .eq("id", tickerMessage.id);

    if (error) setErrorMessage(error.message);
    else {
      setMessage("Ticker message deleted.");
      await loadTickerMessages();
    }
  }

  async function toggleTickerMessage(tickerMessage: TickerMessage) {
    if (!supabase) return;
    const { error } = await supabase
      .from("ticker_messages")
      .update({ active: !tickerMessage.active })
      .eq("id", tickerMessage.id);

    if (error) setErrorMessage(error.message);
    else await loadTickerMessages();
  }

  async function moveTickerMessage(
    tickerMessage: TickerMessage,
    direction: "up" | "down",
  ) {
    if (!supabase) return;
    const currentIndex = sortedMessages.findIndex(
      (item) => item.id === tickerMessage.id,
    );
    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const swapMessage = sortedMessages[nextIndex];

    if (!swapMessage) return;

    const currentOrder = tickerMessage.display_order ?? 0;
    const swapOrder = swapMessage.display_order ?? 0;
    const { error: firstError } = await supabase
      .from("ticker_messages")
      .update({ display_order: swapOrder })
      .eq("id", tickerMessage.id);

    if (firstError) {
      setErrorMessage(firstError.message);
      return;
    }

    const { error: secondError } = await supabase
      .from("ticker_messages")
      .update({ display_order: currentOrder })
      .eq("id", swapMessage.id);

    if (secondError) setErrorMessage(secondError.message);
    else await loadTickerMessages();
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
            Ticker Manager
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Manage Ticker Messages
          </h1>
        </div>
        <Link
          href="/admin/dashboard"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d7a84f]/65 px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:text-[#f4d28b]"
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

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <article className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
          <form
            onSubmit={saveTickerSettings}
            className="mb-6 rounded-md border border-[#d7a84f]/15 bg-black/20 p-4"
          >
            <h2 className="text-2xl font-semibold text-white">
              Ticker Settings
            </h2>
            <label className="mt-5 block">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                Ticker Speed
              </span>
              <input
                type="number"
                min="10"
                max="90"
                value={tickerSpeed}
                onChange={(event) => setTickerSpeed(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]"
              />
            </label>
            <p className="mt-2 text-sm leading-6 text-[#d9c8aa]">
              Lower number = faster. Higher number = slower.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {tickerSpeedPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setTickerSpeed(preset.value)}
                  className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2] transition hover:text-[#f4d28b]"
                >
                  {preset.label}: {preset.value}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={isSavingSettings}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#d7a84f] px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
            >
              {isSavingSettings ? "Saving..." : "Save Settings"}
            </button>
          </form>

          <h2 className="text-2xl font-semibold text-white">Messages</h2>
          <div className="mt-5 space-y-4">
            {sortedMessages.length === 0 ? (
              <p className="text-[#d9c8aa]">No ticker messages found yet.</p>
            ) : null}
            {sortedMessages.map((tickerMessage, index) => (
              <div
                key={tickerMessage.id}
                className="rounded-md border border-[#d7a84f]/15 bg-black/25 p-4"
              >
                <p className="font-semibold text-white">
                  {tickerMessage.message}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#f4d28b]">
                  Order {tickerMessage.display_order ?? 0} /{" "}
                  {tickerMessage.active ? "Active" : "Inactive"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => editTickerMessage(tickerMessage)}
                    className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2] transition hover:text-[#f4d28b]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => moveTickerMessage(tickerMessage, "up")}
                    disabled={index === 0}
                    className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2] transition hover:text-[#f4d28b] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveTickerMessage(tickerMessage, "down")}
                    disabled={index === sortedMessages.length - 1}
                    className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2] transition hover:text-[#f4d28b] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleTickerMessage(tickerMessage)}
                    className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2] transition hover:text-[#f4d28b]"
                  >
                    {tickerMessage.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTickerMessage(tickerMessage)}
                    className="rounded-full border border-red-300/35 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-red-100 transition hover:border-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <form
          onSubmit={saveTickerMessage}
          className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.24)]"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">
              {form.id ? "Edit Message" : "Add Message"}
            </h2>
            {form.id ? (
              <button
                type="button"
                onClick={startNewMessage}
                className="rounded-full border border-[#d7a84f]/45 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#f8efe2] transition hover:text-[#f4d28b]"
              >
                New
              </button>
            ) : null}
          </div>
          <label className="mt-5 block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
              Message
            </span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={4}
              required
              className="mt-2 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 py-3 text-white outline-none focus:border-[#f4d28b]"
            />
          </label>
          <label className="mt-5 block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
              Display Order
            </span>
            <input
              type="number"
              name="display_order"
              value={form.display_order}
              onChange={handleChange}
              className="mt-2 min-h-11 w-full rounded-md border border-[#d7a84f]/25 bg-black/35 px-3 text-white outline-none focus:border-[#f4d28b]"
            />
          </label>
          <label className="mt-5 inline-flex items-center gap-3 text-[#e7d8c2]">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="h-5 w-5 accent-[#d7a84f]"
            />
            Active
          </label>
          <button
            type="submit"
            disabled={isSaving}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#d7a84f] px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
          >
            {isSaving ? "Saving..." : "Save Message"}
          </button>
        </form>
      </section>
    </main>
  );
}
