import type { MediaItem } from "@/lib/supabase/cms";

type MediaCardProps = {
  item: MediaItem;
};

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

  return (
    <article className="flex h-full flex-col rounded-lg border border-[#d7a84f]/18 bg-[#120d08]/85 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
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
    </article>
  );
}
