import type { Metadata } from "next";

export const siteUrl = "https://cumberlandmountainmusic.com";
export const siteName = "Cumberland Mountain Music";
export const defaultTitle =
  "Cumberland Mountain Music | Home of The Cumberland Mountain Music Show";
export const defaultDescription =
  "Live bluegrass, gospel, country, and traditional mountain music from Cumberland Gap, Tennessee.";
export const defaultSocialImage = "/cmms-header.png";

type PublicPageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

export function createPublicPageMetadata({
  title,
  description,
  path,
  image = defaultSocialImage,
}: PublicPageMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${path}`,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
