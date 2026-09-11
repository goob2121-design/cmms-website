export type YouTubeVideo = {
  id: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
};

const MAX_RECENT_VIDEOS = 4;

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([\da-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, String.fromCharCode(39))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function readTag(source: string, tag: string) {
  const escapedTag = tag.replace(":", "\\:");
  const match = source.match(
    new RegExp(`<${escapedTag}[^>]*>([\\s\\S]*?)<\\/${escapedTag}>`, "i"),
  );

  return match ? decodeXml(match[1].trim()) : "";
}

export function parseYouTubeFeed(xml: string): YouTubeVideo[] {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)]
    .map((match) => {
      const entry = match[1];
      const id = readTag(entry, "yt:videoId");
      const title = readTag(entry, "title");
      const publishedAt = readTag(entry, "published");

      if (!id || !title) {
        return null;
      }

      return {
        id,
        title,
        publishedAt,
        thumbnailUrl: `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`,
      };
    })
    .filter((video): video is YouTubeVideo => video !== null)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, MAX_RECENT_VIDEOS);
}

export function getHomepageYouTubeVideos(
  videos: YouTubeVideo[],
  fallbackVideoId: string,
): YouTubeVideo[] {
  if (videos.length > 0) {
    return videos.slice(0, MAX_RECENT_VIDEOS);
  }

  const id = fallbackVideoId.trim();

  return id
    ? [
        {
          id,
          title: "Cumberland Mountain Music Show",
          publishedAt: "",
          thumbnailUrl: `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`,
        },
      ]
    : [];
}

export function selectDailyYouTubeVideo(
  videos: YouTubeVideo[],
  fallbackVideoId: string,
  now = new Date(),
): YouTubeVideo | null {
  const pool = getHomepageYouTubeVideos(videos, fallbackVideoId);

  if (pool.length === 0) {
    return null;
  }

  const utcDay = Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) /
      86_400_000,
  );

  return pool[utcDay % pool.length];
}
export async function fetchRecentYouTubeVideos(
  channelId: string,
  revalidateSeconds = 3600,
  fetcher: typeof fetch = fetch,
): Promise<YouTubeVideo[]> {
  const normalizedChannelId = channelId.trim();

  if (!normalizedChannelId) {
    return [];
  }

  try {
    const response = await fetcher(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(normalizedChannelId)}`,
      { next: { revalidate: revalidateSeconds } },
    );

    if (!response.ok) {
      return [];
    }

    return parseYouTubeFeed(await response.text());
  } catch {
    return [];
  }
}
