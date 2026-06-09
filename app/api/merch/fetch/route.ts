type MerchFetchResult = {
  title: string;
  price: string;
  image_url: string;
  product_url: string;
};

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function getMetaContent(html: string, name: string) {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']*)["']`,
    "i",
  );
  const match = html.match(pattern);
  return match?.[1] ? decodeHtml(match[1].trim()) : "";
}

function getProductPrice(html: string) {
  const priceBlock = html.match(
    /data-testid=["']product\.price["'][^>]*>([\s\S]*?)<\/span>/i,
  );
  const priceMatch = priceBlock?.[1]?.match(/\$[0-9][0-9.,]*/);

  if (priceMatch?.[0]) {
    return priceMatch[0];
  }

  return html.match(/\$[0-9][0-9.,]*/)?.[0] ?? "";
}

function isFourthwallUrl(url: URL) {
  return (
    url.hostname === "cumberland-mountain-music-shop.fourthwall.com" &&
    url.pathname.includes("/products/")
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    url?: unknown;
  } | null;
  const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";

  if (!rawUrl) {
    return Response.json({ error: "Product URL is required." }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return Response.json({ error: "Enter a valid product URL." }, { status: 400 });
  }

  if (!isFourthwallUrl(url)) {
    return Response.json(
      { error: "Use a Cumberland Mountain Music Fourthwall product URL." },
      { status: 400 },
    );
  }

  const response = await fetch(url.toString(), {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; CumberlandMountainMusicMerchBot/1.0)",
    },
  });

  if (!response.ok) {
    return Response.json(
      { error: "Fourthwall product could not be loaded." },
      { status: 502 },
    );
  }

  const html = await response.text();
  const result: MerchFetchResult = {
    title: getMetaContent(html, "og:title"),
    price: getProductPrice(html),
    image_url: getMetaContent(html, "og:image"),
    product_url: url.toString(),
  };

  if (!result.title || !result.image_url) {
    return Response.json(
      { error: "Product details were not found on that Fourthwall page." },
      { status: 422 },
    );
  }

  return Response.json(result);
}
