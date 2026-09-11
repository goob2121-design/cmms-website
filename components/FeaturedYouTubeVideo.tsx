"use client";

import { type ReactNode, useState } from "react";
import { type YouTubeVideo } from "@/lib/youtube-feed";

type FeaturedYouTubeVideoProps = {
  video: YouTubeVideo | null;
  channelUrl: string;
  children: ReactNode;
};

export function FeaturedYouTubeVideo({
  video,
  channelUrl,
  children,
}: FeaturedYouTubeVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="w-full">
      <div className="grid items-center gap-7 lg:grid-cols-[minmax(0,11fr)_minmax(320px,9fr)] lg:gap-10">
        <div className="min-w-0">{children}</div>

        <div className="min-w-0">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.22em] text-[#f4d28b] lg:text-left">
            Watch CMMS
          </p>
          <div className="overflow-hidden rounded-lg border border-[#d7a84f]/35 bg-black shadow-[0_18px_48px_rgba(0,0,0,0.42),0_0_28px_rgba(215,168,79,0.08)]">
            {!video ? (
              <div className="flex aspect-video w-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(215,168,79,0.13),transparent_55%),#080604] p-6 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d9c8aa]">
                  Featured video coming soon
                </p>
              </div>
            ) : isPlaying ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?autoplay=1&rel=0`}
                title={video.title}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                className="group relative block aspect-video w-full overflow-hidden bg-black text-left focus:outline-none focus:ring-2 focus:ring-[#f4d28b] focus:ring-inset"
                aria-label={`Play ${video.title}`}
              >
                <img
                  src={video.thumbnailUrl}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.015]"
                />
                <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.54))]" />
                <span className="absolute bottom-3 left-4 right-4 line-clamp-2 text-sm font-semibold leading-5 text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)] sm:bottom-4 sm:text-base">
                  {video.title}
                </span>
                <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#f4d28b]/70 bg-black/65 shadow-[0_14px_36px_rgba(0,0,0,0.52)] transition group-hover:scale-105 group-hover:bg-[#d7a84f] sm:h-16 sm:w-16">
                  <span className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-[#f4d28b] group-hover:border-l-[#120d07] sm:border-y-[11px] sm:border-l-[18px]" />
                </span>
              </button>
            )}
          </div>
          <div className="mt-4 text-center">
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#d7a84f] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#120d07] shadow-[0_14px_34px_rgba(0,0,0,0.3)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#f1c86e] focus:outline-none focus:ring-2 focus:ring-[#f4d28b] focus:ring-offset-2 focus:ring-offset-[#080604]"
            >
              More Videos on YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}