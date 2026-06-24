import type { MediaItem } from "@/lib/supabase/cms";

type MediaCardProps = {
  item: MediaItem;
};

function getYouTubeVideoId(videoUrl?: string | null) {
  if (!videoUrl) {
    return null;
  }

  try {
    const url = new URL(videoUrl);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        return url.searchParams.get("v");
      }

      const embedMatch = url.pathname.match(/^\/embed\/([^/?#]+)/);
      return embedMatch?.[1] ?? null;
    }
  } catch {
    return null;
  }

  return null;
}

function getVideoThumbnail(item: MediaItem) {
  const thumbnailUrl = item.thumbnail_url?.trim();

  if (thumbnailUrl) {
    return thumbnailUrl;
  }

  const videoId = getYouTubeVideoId(item.video_url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
}

export function MediaCard({ item }: MediaCardProps) {
  if (item.media_type === "photo") {
    return (
      <article className="overflow-hidden rounded-lg border border-[#d7a84f]/18 bg-[#120d08]/85 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="h-64 w-full object-cover"
          />
        ) : null}
        <div className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d7a84f]">
            Photo
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            {item.title}
          </h3>
          {item.caption ? (
            <p className="mt-3 leading-7 text-[#d9c8aa]">{item.caption}</p>
          ) : null}
        </div>
      </article>
    );
  }

  const thumbnailUrl = getVideoThumbnail(item);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-[#d7a84f]/18 bg-[#120d08]/85 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
      {thumbnailUrl ? (
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <img
            src={thumbnailUrl}
            alt={`${item.title} video thumbnail`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.35))]" />
          <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#f4d28b]/55 bg-black/55 text-[#f4d28b] shadow-[0_12px_32px_rgba(0,0,0,0.42)]">
            <span className="ml-1 h-0 w-0 border-y-[9px] border-l-[15px] border-y-transparent border-l-[#f4d28b]" />
          </div>
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d7a84f]">
          Video
        </p>
        <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
        {item.caption ? (
          <p className="mt-3 leading-7 text-[#d9c8aa]">{item.caption}</p>
        ) : null}
        {item.video_url ? (
          <a
            href={item.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 w-fit items-center justify-center rounded-full border border-[#d7a84f]/65 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#f8efe2] transition hover:border-[#f1c86e] hover:text-[#f4d28b]"
          >
            Watch Video
          </a>
        ) : null}
      </div>
    </article>
  );
}
