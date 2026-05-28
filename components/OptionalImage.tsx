"use client";

import { useState } from "react";

type OptionalImageProps = {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
};

export function OptionalImage({
  src,
  alt,
  className = "",
  wrapperClassName = "",
}: OptionalImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null;
  }

  const image = (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );

  return wrapperClassName ? (
    <section className={wrapperClassName}>{image}</section>
  ) : (
    image
  );
}
