"use client";

import { useEffect, useState } from "react";

export function HeroFogVideo() {
  const [shouldShowVideo, setShouldShowVideo] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function updatePreference() {
      setShouldShowVideo(!mediaQuery.matches);
    }

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  if (!shouldShowVideo) {
    return null;
  }

  return (
    <video
      aria-hidden="true"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.34] mix-blend-screen"
    >
      <source src="/cmms-fog.mp4" type="video/mp4" />
    </video>
  );
}
