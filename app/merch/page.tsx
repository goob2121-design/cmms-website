import Image from "next/image";
import type { Metadata } from "next";
import { getPublishedMerchProducts, type MerchProduct } from "@/lib/supabase/cms";

const merchShareImage = "https://www.cumberlandmountainmusic.com/cmms-og-image.jpg";

export const metadata: Metadata = {
  title: "Cumberland Mountain Music Show Merch",
  description: "Official merchandise for the Cumberland Mountain Music Show.",
  alternates: {
    canonical: "https://www.cumberlandmountainmusic.com/merch",
  },
  openGraph: {
    title: "Cumberland Mountain Music Show Merch",
    description: "Official merchandise for the Cumberland Mountain Music Show.",
    url: "https://www.cumberlandmountainmusic.com/merch",
    siteName: "Cumberland Mountain Music",
    images: [
      {
        url: merchShareImage,
        width: 1200,
        height: 630,
        alt: "Cumberland Mountain Music Show Merch",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cumberland Mountain Music Show Merch",
    description: "Official merchandise for the Cumberland Mountain Music Show.",
    images: [merchShareImage],
  },
};

type MerchProductCard = {
  title: string;
  description: string;
  price: string;
  image: string;
  href: string;
};

const fallbackProducts: MerchProductCard[] = [
  {
    title: "Cumberland Mountain Music T-Shirt",
    description:
      "A comfortable everyday shirt for show nights, road trips, and fans of live mountain music.",
    price: "$12.50",
    image:
      "https://imgproxy.fourthwall.dev/czSyHhgJrQ0lnH_yzeHkfS2VAvNYxBekuZJniA-Y3cY/w:1200/sm:1/enc/6HRBAwQBl41_soMC/Ji3kohTAzNZACK7R/3j0uqWKW_0Lg4rK_/YLINWpSzvq335hn9/BoJH7e-nP-Ntx31l/NoXiERu-bQy8Bjk3/PfnEDLWCiu7tmZue/DOseZEkNNRY_m0hn/J2h8lISYHCmujxaX/-3R38g25o2oxM1Di/Rt9IVq24E2zKzrST/0XeeFNZ5bHXA7eax/0IG9F_wq8xkS0qsw/akWb_mcWLu7LaZfg/FC2Afm_QTTc.png",
    href: "https://cumberland-mountain-music-shop.fourthwall.com/products/cumberland-mountain-music-show-t",
  },
  {
    title: "Cumberland Mountain Music Band T-Shirt",
    description:
      "A band-style shirt for folks who want a little more stage-night energy in their merch.",
    price: "$18.45",
    image:
      "https://imgproxy.fourthwall.dev/ExUlfWThtC1MMjwHmhy4ahvBGQw7qokzJEAxE4HZm2Y/w:1200/sm:1/enc/t3Ar5QXnKxBL8Oek/Ag4Pmuvs1fGGLYB1/Xzg-WZTebcUQBKzB/Nv2LiIMyk7u7swA3/Uw92XYJHRy18e6ll/TYU3SBl5aXcpcPP0/DLowmOIJdxl8-dOL/9wMBNkGefGNkTkcT/qM3GP20q0SwVMxvg/cvfnAMnLG4Hr3wx_/HWFM2UCC3ucKbYjK/ZWhsn4jYKXLssiNI/fYN8JjM_L8cNzwQg/fOhwsUUVqNnD22EF/y2RVENh5XqM.png",
    href: "https://cumberland-mountain-music-shop.fourthwall.com/products/cumberland-mountain-music-show-band-t",
  },
  {
    title: "Cumberland Mountain Music Hat",
    description:
      "A classic cap with Cumberland Mountain Music style for the show, the porch, or the road.",
    price: "$18.65",
    image:
      "https://imgproxy.fourthwall.dev/0ki2r8-6S7UPiShWNcqDkw74BveqF5ufLugOFbQrA64/w:1200/sm:1/enc/KumBAeD-XXR7f6L_/sZjzR2BWVHFFn3HK/a4hbBuhAa4Z6jG2u/f-YIzt2cYgQ4HlFM/m8LueAsuk3VNo7iU/FVb3ax_Axzk4Js9_/m46bqolXe_4gUEGB/wk7yWYegnn0goxZr/lDZ12zOn1goNHZib/Po9IHTYaytN7WA9K/wKlPlk0PexhtbVvh/j_ON2ng2As63dh4y/I0-2j0rEEh8PJEJJ/d5-JqMULlNhlkvra/_JrcKdFeD14.png",
    href: "https://cumberland-mountain-music-shop.fourthwall.com/products/cumberland-mountain-music-show-hat",
  },
  {
    title: "Cumberland Mountain Music Trucker Hat",
    description:
      "A breathable trucker hat made for long days, live music, and Cumberland Gap pride.",
    price: "$15.95",
    image:
      "https://imgproxy.fourthwall.dev/br5NzGORwIdtF8EuXC_3jsq5qK0vAKEOqzZyT-S3lKw/w:1200/sm:1/enc/hGitBjaJi7F8tGwr/6bKc9jEe_rX3Fa-_/joAr7clHxMOoWyRq/LGxeSxF6FHrsJYMQ/_2rYABVlQq59eGq-/k13lQtdxkFX5H0nJ/5MhQaCrJ0-TsZz-H/FrgJLVuLCgDLVPrj/QFjssApFm7uaIZXC/pweGLX0t-ba_SVuu/0WnfaA4dRuNHxpin/Q9SrSOYDt8m3SaWr/PFLzBBCI1Ir099lS/MrEes7Q3jRQQ3LPR/g0J4Zb5nNo0.png",
    href: "https://cumberland-mountain-music-shop.fourthwall.com/products/cumberland-mountain-music-show-trucker-hat",
  },
  {
    title: "Cumberland Mountain Music Hoodie",
    description:
      "A cozy hoodie for cool evenings, festival weather, and staying warm between sets.",
    price: "$31.00",
    image:
      "https://imgproxy.fourthwall.dev/5tC5KZB-Zg3PvurwkoxSv9mNPH56aV3t2MhZJVngJZg/w:1200/sm:1/enc/nSsPMw6Aj09JSkeq/jn8e-vIZJCH_JtDr/v7tisk0Y99vdTxBy/qVygzir12eybOGq9/j75nZXWVVTlGnXVO/AyqYNm92MJHFaiAP/rLBaR4jSKMYWQ19k/P8NDkUaHTYjQGChb/74Xh2e2WXZVgYle_/1ejHAhf2TrRF5yb9/V7pR8s2Chbw5LQ6F/fsj7Ee-aRseoXIYa/FFZH6KY7jmYs3AMI/FuIELUy8zNd5pTpj/XUPl8fddtg0.png",
    href: "https://cumberland-mountain-music-shop.fourthwall.com/products/cumberland-mountain-music-show-hoodie",
  },
  {
    title: "Cumberland Mountain Music Coffee Mug",
    description:
      "A sturdy mug for morning coffee, late-night picking sessions, and everyday support.",
    price: "$11.95",
    image:
      "https://imgproxy.fourthwall.dev/JHlcaV8r6E6SIpsygWF2fmMQjGn3yLKnXc7fHJSRWL4/w:1200/sm:1/enc/zPx-coDQ-wAMsEX2/0qTojKo_8OsyD940/9YFrsholBipyCHWT/pGKi-8y-aU3C1Uv4/uZb6gvzxz_bl6qyd/RHA_3gas1xKSCA4I/NMXUgCqAV3oCTbhM/ekYKEHlQEypnx7qN/XeDuiwLsAJLqbj3D/J5ul4izlL49Wt-Ll/v4JnJBZmu8nVCOON/3PCRtpry3F1HLIqV/rGnKmoeUeOCWTEWo/Qa4r35K49NLfam7k/2gVDZQVRIZQ.png",
    href: "https://cumberland-mountain-music-shop.fourthwall.com/products/cumberland-mountain-music-show-coffee-mug",
  },
];

export const dynamic = "force-dynamic";

function toProductCard(product: MerchProduct): MerchProductCard {
  return {
    title: product.title,
    description:
      product.description?.trim() ||
      "Official Cumberland Mountain Music merch fulfilled securely through Fourthwall.",
    price: product.price?.trim() || "Current price on Fourthwall",
    image: product.image_url?.trim() || "/cmms-round-logo.png",
    href: product.product_url,
  };
}

export default async function MerchPage() {
  const databaseProducts = await getPublishedMerchProducts();
  const products =
    databaseProducts.length > 0
      ? databaseProducts.map(toProductCard)
      : fallbackProducts;

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-40 sm:px-8 lg:pb-20">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d7a84f]">
          Merch
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Official Cumberland Mountain Music Merch.
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#e7d8c2]">
          Wear the show, share the music, and support Cumberland Mountain Music
          wherever you go.
        </p>
      </section>

      <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.href}
            className="flex h-full flex-col overflow-hidden rounded-lg border border-[#d7a84f]/18 bg-[#120d08]/85 shadow-[0_18px_55px_rgba(0,0,0,0.24)]"
          >
            <a
              href={product.href}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,rgba(31,21,10,0.92),rgba(10,7,4,0.96))]"
              aria-label={`Buy ${product.title}`}
            >
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
                unoptimized
              />
            </a>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="text-xl font-semibold text-white">
                {product.title}
              </h2>
              <p className="mt-3 leading-7 text-[#d9c8aa]">
                {product.description}
              </p>
              <div className="mt-auto pt-4">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f4d28b]">
                  {product.price}
                </p>
                <a
                  href={product.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#d7a84f] px-5 py-3 text-center text-sm font-bold uppercase tracking-[0.14em] text-[#120d07] transition hover:-translate-y-0.5 hover:bg-[#f1c86e]"
                >
                  Buy
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-lg border border-[#d7a84f]/18 bg-black/25 p-5 text-center text-[#d9c8aa]">
        Orders are fulfilled securely through Fourthwall.
      </section>
    </main>
  );
}
