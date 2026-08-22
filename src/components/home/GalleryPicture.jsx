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
  const resolved =
    sources ??
    (imageKey ? getPopularDestinationSources(imageKey) : null) ??
    (imageKey ? { webp: getPopularDestinationImage(imageKey), png: getPopularDestinationImage(imageKey, { preferWebp: false }) } : null);

  if (!resolved?.webp && !resolved?.png) return null;

  const isRemote = (url) => /^https?:\/\//i.test(String(url || ""));
  const skipWebpSource = isRemote(resolved.webp) || resolved.webp === resolved.png;

  return (
    <picture className={pictureClassName}>
      {!skipWebpSource && resolved.webp ? <source srcSet={resolved.webp} type="image/webp" /> : null}
      <img
        src={resolved.png ?? resolved.webp}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={className}
        onError={onError}
      />
    </picture>
  );
}
