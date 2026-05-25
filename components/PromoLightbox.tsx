"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type PromoLightboxProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
};

function isRemoteImage(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}

export function PromoLightbox({
  src,
  alt,
  priority = false,
  className = "",
}: PromoLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const remoteImage = isRemoteImage(src);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`block w-full cursor-zoom-in overflow-hidden rounded-lg text-left outline-none transition duration-200 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#f4d28b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080604] ${className}`}
        aria-label="Open larger show promo"
      >
        {remoteImage ? (
          // Remote CMS images are intentionally rendered without next/image config.
          <img src={src} alt={alt} className="h-auto w-full object-contain" />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={628}
            priority={priority}
            className="h-auto w-full object-contain"
          />
        )}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/88 px-4 py-6 backdrop-blur-sm sm:px-6"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded show promo"
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-2 top-2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#f4d28b]/45 bg-black/75 text-xl leading-none text-[#fff7ea] shadow-[0_10px_35px_rgba(0,0,0,0.45)] transition hover:border-[#f4d28b] hover:text-[#f4d28b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d28b]"
              aria-label="Close promo image"
            >
              &times;
            </button>
            <div className="overflow-hidden rounded-lg border border-[#d7a84f]/35 bg-black shadow-[0_30px_100px_rgba(0,0,0,0.65)]">
              {remoteImage ? (
                <img
                  src={src}
                  alt={alt}
                  className="h-auto max-h-[84vh] w-full object-contain"
                />
              ) : (
                <Image
                  src={src}
                  alt={alt}
                  width={1600}
                  height={837}
                  className="h-auto max-h-[84vh] w-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
