import { useState } from "react";
import { getPopularDestinationImage, getPopularDestinationSources } from "../../config/images";

/**
 * Renders an optimized gallery image with WebP + PNG fallback.
 * Accepts either an imageKey (gallery slug) or explicit { webp, png } sources.
 */
export default function GalleryPicture({
  imageKey,
  sources,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
  fetchPriority,
  onError,
  pictureClassName = "",
}) {
  const [usePngFallback, setUsePngFallback] = useState(false);

  const resolved =
    sources ??
    (imageKey ? getPopularDestinationSources(imageKey) : null) ??
    (imageKey
      ? {
          webp: getPopularDestinationImage(imageKey),
          png: getPopularDestinationImage(imageKey, { preferWebp: false }),
        }
      : null);

  if (!resolved?.webp && !resolved?.png) return null;

  const isRemote = (url) => /^https?:\/\//i.test(String(url || ""));
  const pngSrc = resolved.png ?? resolved.webp;
  const webpSrc = resolved.webp;
  const skipWebpSource = usePngFallback || isRemote(webpSrc) || !webpSrc || webpSrc === pngSrc;
  const imgSrc = usePngFallback ? pngSrc : pngSrc ?? webpSrc;

  function handleError(event) {
    if (!usePngFallback && pngSrc && webpSrc && pngSrc !== webpSrc) {
      setUsePngFallback(true);
      return;
    }
    onError?.(event);
  }

  return (
    <picture className={pictureClassName}>
      {!skipWebpSource && webpSrc ? <source srcSet={webpSrc} type="image/webp" /> : null}
      <img
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={className}
        onError={handleError}
      />
    </picture>
  );
}
