import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const siteUrl = "https://cumberlandmountainmusic.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Cumberland Mountain Music | Home of The Cumberland Mountain Music Show",
  description:
    "Live bluegrass, gospel, and traditional mountain music from Cumberland Gap, Tennessee. Home of The Cumberland Mountain Music Show.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "Cumberland Mountain Music | Home of The Cumberland Mountain Music Show",
    description:
      "Live bluegrass, gospel, and traditional mountain music from Cumberland Gap, Tennessee. Home of The Cumberland Mountain Music Show.",
    url: siteUrl,
    siteName: "Cumberland Mountain Music",
    images: [
      {
        url: "/cmms-logo.png",
        width: 1200,
        height: 630,
        alt: "Cumberland Mountain Music",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Cumberland Mountain Music | Home of The Cumberland Mountain Music Show",
    description:
      "Live bluegrass, gospel, and traditional mountain music from Cumberland Gap, Tennessee. Home of The Cumberland Mountain Music Show.",
    images: ["/cmms-logo.png"],
  },
  icons: {
    icon: "/cmms-round-logo.png",
    apple: "/cmms-round-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#080604] text-[#f8efe2]">
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(191,142,62,0.18),transparent_32%),linear-gradient(135deg,rgba(15,13,10,0.88),rgba(8,6,4,0.98)_50%,rgba(37,24,12,0.92))]" />
          <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d6a54c]/70 to-transparent" />
          <Navbar />

          {children}

          <footer className="relative z-10 border-t border-[#d7a84f]/15 px-6 py-8 text-center text-sm text-[#bda987] sm:px-8">
            <p>
              Cumberland Mountain Music, Cumberland Gap, Tennessee. Home of The
              Cumberland Mountain Music Show.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
