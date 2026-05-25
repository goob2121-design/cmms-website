import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cumberland Mountain Music",
  description:
    "Home of The Cumberland Mountain Music Show. Official website coming soon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
