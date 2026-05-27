import type { Metadata } from "next";
import Link from "next/link";
import { SnackShopQuoteRotator } from "@/components/SnackShopQuoteRotator";
import { createPublicPageMetadata } from "@/lib/metadata";
import { getSnackShopSettings } from "@/lib/supabase/snackShop";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Mamaw Gerald's Snack Shop | Cumberland Mountain Music",
  description:
    "Hot dogs, pizza, homemade fried pies, no-bake cookies, fresh coffee, drinks, and hometown concessions at The Cumberland Mountain Music Show.",
  path: "/snack-shop",
});

export const dynamic = "force-dynamic";

const snackFeatures = [
  {
    heading: "Hot Food Favorites",
    imageKey: "hot_food_image_url",
    description:
      "Hot dogs, pizza, and warm food favorites to keep you going before the show or during intermission.",
    funLine: "Mamaw says music sounds better when you ain't hungry.",
  },
  {
    heading: "Homemade Desserts & Treats",
    imageKey: "desserts_image_url",
    description:
      "Homemade fried pies and no-bake cookies are favorites around here, and they usually do not last long.",
    funLine: "Some folks come for the music... some come for the fried pies.",
  },
  {
    heading: "Fresh Coffee & Cold Drinks",
    imageKey: "drinks_image_url",
    description:
      "Fresh coffee, water, and sodas are available to help keep everybody refreshed.",
    funLine: "Coffee for the grownups. Sodas for everybody else.",
  },
  {
    heading: "Intermission Favorites",
    imageKey: "intermission_image_url",
    description:
      "Grab a bite, stretch your legs, and visit Mamaw Gerald's Snack Shop before the music starts back.",
    funLine: "Intermission is short. Mamaw's line might not be.",
  },
];

const menuHighlights = [
  "Hot Dogs",
  "Pizza",
  "Homemade Fried Pies",
  "No-Bake Cookies",
  "Fresh Coffee",
  "Water",
  "Sodas",
];

const hometownLines = [
  "Nobody leaves hungry if Mamaw Gerald can help it.",
  "The fried pies have developed a following of their own.",
  "Fresh coffee, homemade treats, and enough food to keep the music going.",
  "Some folks come for the music... some come for the fried pies.",
  "If Mamaw tells you to get something to eat, you probably better listen.",
  "Menu items and availability may change from show to show.",
  "Homemade items are available while they last.",
  "Intermission is short. Mamaw's line might not be.",
];

export default async function SnackShopPage() {
  const settings = await getSnackShopSettings();
  const isActive = settings?.active ?? false;
  const menuImageUrl = isActive ? settings?.menu_image_url : null;
  const menuPdfUrl = isActive ? settings?.menu_pdf_url : null;

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
            Concessions
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Mamaw Gerald&apos;s Snack Shop
          </h1>
          <p className="mt-5 text-xl font-semibold leading-8 text-[#f4d28b]">
            Fresh coffee, homemade treats, and enough food to keep the music
            going.
          </p>
          <div className="mt-6 space-y-5 text-lg leading-8 text-[#e7d8c2]">
            <p>
              At every Cumberland Mountain Music Show, there&apos;s one place
              that keeps folks coming back hungry: Mamaw Gerald&apos;s Snack
              Shop.
            </p>
            <p>
              Run by Bryan Turner&apos;s mother, Mamaw Gerald, the snack shop
              has become part of the CMMS tradition itself. Whether you need a
              hot dog before the music starts, fresh coffee during
              intermission, or one of Mamaw&apos;s homemade fried pies before
              heading home, there&apos;s a good chance she&apos;s got something
              cooking.
            </p>
          </div>
        </div>

        <aside className="rounded-lg border border-[#d7a84f]/22 bg-[linear-gradient(135deg,rgba(31,21,10,0.94),rgba(10,7,4,0.96))] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.32)]">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#f4d28b]">
            Mamaw Says
          </p>
          <p className="mt-4 text-2xl font-semibold leading-snug text-white">
            {isActive && settings?.mamaw_message
              ? settings.mamaw_message
              : "Nobody leaves hungry if Mamaw Gerald can help it."}
          </p>
          <p className="mt-5 leading-7 text-[#d9c8aa]">
            Some folks come for the music... some come for the fried pies.
          </p>
        </aside>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {snackFeatures.map((feature) => {
          const imageUrl =
            isActive && settings
              ? settings[
                  feature.imageKey as
                    | "hot_food_image_url"
                    | "desserts_image_url"
                    | "drinks_image_url"
                    | "intermission_image_url"
                ]
              : null;

          return (
            <article
              key={feature.heading}
              className="flex h-full flex-col overflow-hidden rounded-lg border border-[#d7a84f]/18 bg-[#120d08]/80 shadow-[0_14px_45px_rgba(0,0,0,0.2)]"
            >
              {imageUrl ? (
                <div className="h-44 shrink-0 border-b border-[#d7a84f]/14 bg-black/24 sm:h-48 lg:h-40 xl:h-44">
                  <img
                    src={imageUrl}
                    alt={feature.heading}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d7a84f]/35 bg-black/25 text-lg text-[#f4d28b]">
                  *
                </div>
                <h2 className="mt-4 text-xl font-semibold leading-snug text-white">
                  {feature.heading}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-[#d9c8aa]">
                  {feature.description}
                </p>
                <p className="mt-5 rounded-md border border-[#d7a84f]/14 bg-black/22 p-3 text-sm font-semibold leading-6 text-[#f4d28b]">
                  {feature.funLine}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      <SnackShopQuoteRotator lines={hometownLines} />

      <section className="mt-5 rounded-lg border border-[#d7a84f]/18 bg-black/20 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d7a84f]">
          Usually On The Table
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {menuHighlights.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[#d7a84f]/25 bg-[#120d08]/80 px-4 py-2 text-sm font-semibold text-[#f8efe2]"
            >
              {item}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm leading-6 text-[#bda987]">
          The fried pies have developed a following of their own.
        </p>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <article className="rounded-lg border border-[#d7a84f]/20 bg-[#120d08]/85 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.24)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d7a84f]">
                Menu
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                This Month&apos;s Menu
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#bda987]">
                Menu items and availability may change from show to show. Some
                homemade items are available while they last.
              </p>
            </div>
            {menuPdfUrl ? (
              <a
                href={menuPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7a84f]/65 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
              >
                Download Menu
              </a>
            ) : null}
          </div>

          {menuImageUrl ? (
            <div className="mt-6 overflow-hidden rounded-lg border border-[#d7a84f]/20 bg-black/25">
              <img
                src={menuImageUrl}
                alt="Mamaw Gerald's Snack Shop menu"
                className="h-auto w-full object-contain"
              />
            </div>
          ) : (
            <div className="mt-6 flex min-h-72 items-center justify-center rounded-lg border border-dashed border-[#d7a84f]/28 bg-black/24 p-8 text-center">
              <p className="max-w-sm text-xl font-semibold leading-8 text-[#f4d28b]">
                This month&apos;s snack menu is coming soon.
              </p>
            </div>
          )}
        </article>

        <aside className="rounded-lg border border-[#d7a84f]/20 bg-[linear-gradient(135deg,rgba(31,21,10,0.88),rgba(10,7,4,0.96))] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
          <h2 className="text-2xl font-semibold text-white">
            Supporting the Show
          </h2>
          {isActive && settings?.special_text ? (
            <div className="mt-5 rounded-md border border-[#d7a84f]/18 bg-black/24 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4d28b]">
                Special This Month
              </p>
              <p className="mt-2 leading-7 text-[#e7d8c2]">
                {settings.special_text}
              </p>
            </div>
          ) : null}
          <p className="mt-5 leading-7 text-[#d9c8aa]">
            All concessions help support the Cumberland Mountain Music Show and
            help keep live music thriving in Cumberland Gap.
          </p>
          <Link
            href="/show-dates"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#d7a84f] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
          >
            See Show Dates
          </Link>
        </aside>
      </section>
    </main>
  );
}
