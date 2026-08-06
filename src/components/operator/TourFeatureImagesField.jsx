import { useRef, useState } from "react";
import { ImagePlus, Upload, X, ZoomIn } from "lucide-react";
import ImageLightbox from "../misc/ImageLightbox";
import {
  MAX_FEATURE_IMAGES,
  MAX_FEATURE_IMAGES_TOTAL_BYTES,
  formatBytes,
  getFeatureImagesTotalBytes,
  getImagePreviewSrc,
  readImageFile,
  validateFeatureImageFile,
} from "../../utils/tourImageUtils";

const labelClass = "block text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted";

export default function TourFeatureImagesField({ value = [], coverImage, onChange, onError }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const images = Array.isArray(value) ? value : [];
  const coverSrc = getImagePreviewSrc(coverImage);
  const featureSources = images.map(getImagePreviewSrc).filter(Boolean);
  const previewSources = [
    ...(coverSrc ? [coverSrc] : []),
    ...featureSources.filter((src) => src !== coverSrc),
  ];
  const featureCount = images.filter((img) => img?.uri || img?.data).length;
  const featureBytesUsed = getFeatureImagesTotalBytes(images);
  const slotsLeft = MAX_FEATURE_IMAGES - images.length;
  const atLimit = images.length >= MAX_FEATURE_IMAGES;

  function removeImage(index) {
    onChange(images.filter((_, i) => i !== index));
    onError?.("");
  }

  async function handleFilesSelected(fileList) {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;

    if (atLimit) {
      onError?.(`You can upload up to ${MAX_FEATURE_IMAGES} feature images.`);
      return;
    }

    setUploading(true);
    onError?.("");

    const next = [...images];
    let skipped = 0;
    let blocked = false;

    for (const file of files) {
      if (next.length >= MAX_FEATURE_IMAGES) {
        skipped += 1;
        continue;
      }

      const validation = validateFeatureImageFile(file, next, -1);
      if (validation) {
        onError?.(validation);
        blocked = true;
        break;
      }

      try {
        const image = await readImageFile(file);
        next.push(image);
      } catch (err) {
        onError?.(err.message || "Could not read one of the selected images.");
        blocked = true;
        break;
      }
    }

    onChange(next);

    if (skipped > 0 && !blocked) {
      onError?.(`Only ${MAX_FEATURE_IMAGES} images allowed — ${skipped} extra file${skipped === 1 ? "" : "s"} skipped.`);
    }

    setUploading(false);
  }

  async function handleInputChange(e) {
    await handleFilesSelected(e.target.files);
    e.target.value = "";
  }

  function openPicker() {
    if (!uploading && !atLimit) inputRef.current?.click();
  }

  return (
    <div>
      <div className="mb-4">
        <p className={labelClass}>Feature images</p>
        <p className="mt-1 text-[11px] text-brand-muted">
          Select up to {MAX_FEATURE_IMAGES} images at once — {formatBytes(MAX_FEATURE_IMAGES_TOTAL_BYTES)} total max.
        </p>
      </div>

      <div className="mb-5 rounded-xl border border-brand-border/60 bg-brand-cream/40 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-brand-ink">
          <span>{featureCount} / {MAX_FEATURE_IMAGES} images</span>
          <span>{formatBytes(featureBytesUsed)} / {formatBytes(MAX_FEATURE_IMAGES_TOTAL_BYTES)} used</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
          <div
            className={`h-full rounded-full transition-all ${featureBytesUsed > MAX_FEATURE_IMAGES_TOTAL_BYTES ? "bg-red-500" : "bg-brand-green"}`}
            style={{ width: `${Math.min(100, (featureBytesUsed / MAX_FEATURE_IMAGES_TOTAL_BYTES) * 100)}%` }}
          />
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleInputChange}
        aria-hidden
      />

      <button
        type="button"
        onClick={openPicker}
        disabled={uploading || atLimit}
        className={[
          "flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all",
          atLimit
            ? "cursor-not-allowed border-brand-border/50 bg-brand-cream/30 opacity-60"
            : "border-brand-border bg-brand-cream/40 hover:border-brand-green/50 hover:bg-brand-green/5",
        ].join(" ")}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
          {uploading ? (
            <Upload className="h-6 w-6 animate-pulse" strokeWidth={1.75} aria-hidden />
          ) : (
            <ImagePlus className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          )}
        </div>
        <p className="mt-4 text-sm font-semibold text-brand-ink">
          {uploading ? "Processing images…" : atLimit ? "Maximum images selected" : "Choose feature images"}
        </p>
        <p className="mt-1.5 max-w-sm text-xs text-brand-muted">
          {atLimit
            ? "Remove an image below to add different ones."
            : `Click to select multiple photos${slotsLeft < MAX_FEATURE_IMAGES ? ` (${slotsLeft} slot${slotsLeft === 1 ? "" : "s"} left)` : ""}.`}
        </p>
      </button>

      {coverSrc || images.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {coverSrc ? (
            <div className="group relative aspect-[4/3] overflow-hidden rounded-xl border-2 border-brand-green/40 bg-white shadow-sm ring-1 ring-brand-green/20">
              <button
                type="button"
                onClick={() => setLightboxIndex(0)}
                className="relative h-full w-full cursor-zoom-in"
                aria-label="View cover image full size"
              >
                <img src={coverSrc} alt="" className="h-full w-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center bg-brand-ink/0 transition-colors group-hover:bg-brand-ink/20">
                  <ZoomIn className="h-5 w-5 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100" strokeWidth={2} aria-hidden />
                </span>
              </button>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-ink/70 to-transparent px-2 pb-2 pt-8">
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand-gold">Cover</p>
              </div>
            </div>
          ) : null}

          {images.map((image, index) => {
            const src = getImagePreviewSrc(image);
            return (
              <div
                key={`${image.uri || "img"}-${index}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-brand-border/60 bg-white shadow-sm"
              >
                {src ? (
                  <button
                    type="button"
                    onClick={() => {
                      const previewIndex = previewSources.indexOf(src);
                      if (previewIndex >= 0) setLightboxIndex(previewIndex);
                    }}
                    className="relative h-full w-full cursor-zoom-in"
                    aria-label={`View gallery image ${index + 1} full size`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-brand-ink/0 transition-colors group-hover:bg-brand-ink/20">
                      <ZoomIn className="h-5 w-5 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100" strokeWidth={2} aria-hidden />
                    </span>
                  </button>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-brand-muted">No preview</div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-ink/70 to-transparent px-2 pb-2 pt-8">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-white/90">Gallery {index + 1}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 rounded-lg bg-white/95 p-1.5 text-brand-muted shadow-sm transition-all hover:bg-red-50 hover:text-red-500"
                  aria-label={`Remove feature image ${index + 1}`}
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                </button>
              </div>
            );
          })}

          {!atLimit ? (
            <button
              type="button"
              onClick={openPicker}
              disabled={uploading}
              className="flex aspect-[4/3] flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-border/70 bg-brand-cream/30 text-brand-muted transition-all hover:border-brand-green/40 hover:text-brand-green disabled:opacity-50"
            >
              <Upload className="h-5 w-5" strokeWidth={2} aria-hidden />
              <span className="mt-2 text-[11px] font-semibold">Add more</span>
            </button>
          ) : null}
        </div>
      ) : null}

      <ImageLightbox
        open={lightboxIndex != null}
        images={previewSources}
        index={lightboxIndex ?? 0}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
        alt="Tour image"
      />
    </div>
  );
}
