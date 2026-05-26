"use client";

import { useState } from "react";

type ProfilePhotoProps = {
  src?: string | null;
  alt: string;
  className?: string;
};

export function ProfilePhoto({ src, alt, className = "" }: ProfilePhotoProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageSrc = src?.trim();

  if (imageSrc && !hasImageError) {
    return (
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        onError={() => setHasImageError(true)}
      />
    );
  }

  return (
    <div
      aria-label={`${alt} photo coming soon`}
      className={`relative overflow-hidden bg-[linear-gradient(135deg,rgba(215,168,79,0.18),rgba(18,13,8,0.92)_52%,rgba(0,0,0,0.72))] ${className}`}
    >
      <div className="absolute inset-0 flex items-center justify-center px-5 text-center">
        <div>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#d7a84f]/35 bg-black/30 shadow-[0_16px_36px_rgba(0,0,0,0.24)] sm:h-20 sm:w-20">
            <div className="relative h-9 w-9 sm:h-11 sm:w-11">
              <div className="mx-auto h-3.5 w-3.5 rounded-full bg-[#f4d28b]/75 sm:h-4 sm:w-4" />
              <div className="absolute bottom-0 left-1/2 h-6 w-8 -translate-x-1/2 rounded-t-full border border-[#f4d28b]/55 bg-[#f4d28b]/18 sm:h-7 sm:w-9" />
            </div>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#f4d28b] sm:mt-5 sm:text-sm sm:tracking-[0.22em]">
            Photo Coming Soon
          </p>
        </div>
      </div>
    </div>
  );
}
