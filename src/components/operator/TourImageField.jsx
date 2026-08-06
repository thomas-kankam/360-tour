import { useRef, useState } from "react";
import { ImagePlus, Trash2, Upload, ZoomIn } from "lucide-react";
import ImageLightbox from "../misc/ImageLightbox";
import { getImagePreviewSrc, readImageFile } from "../../utils/tourImageUtils";

export default function TourImageField({
  label,
  hint,
  value,
  onChange,
  uriPlaceholder = "tours/cover.jpg",
  beforeUpload,
  showUriField = true,
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const preview = getImagePreviewSrc(value);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      setError("");
      if (beforeUpload) {
        const message = beforeUpload(file);
        if (message) {
          setError(message);
          return;
        }
      }
      const next = await readImageFile(file);
      onChange({
        ...value,
        uri: value?.uri || next.uri,
        data: next.data,
        mimeType: next.mimeType,
      });
    } catch (err) {
      setError(err.message || "Upload failed.");
    }
  }

  function handleClear() {
    onChange({ uri: "", data: "", mimeType: "image/jpeg" });
    setError("");
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">{label}</p>
        {hint ? <p className="mt-1 text-[11px] text-brand-muted">{hint}</p> : null}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border-2 border-dashed border-brand-border bg-brand-cream/60 sm:max-w-[220px]">
          {preview ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="group relative h-full w-full cursor-zoom-in"
              aria-label="View cover image full size"
            >
              <img src={preview} alt="" className="h-full w-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center bg-brand-ink/0 transition-colors group-hover:bg-brand-ink/25">
                <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-ink opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                  <ZoomIn className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  View full
                </span>
              </span>
            </button>
          ) : (
            <div className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 text-brand-muted">
              <ImagePlus className="h-8 w-8 opacity-50" strokeWidth={1.5} />
              <span className="text-xs font-medium">No preview</span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {showUriField ? (
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-muted">Image URL</label>
              <input
                className="w-full rounded-xl border-2 border-brand-border bg-white px-4 py-2.5 text-sm font-medium text-brand-ink outline-none transition-all focus:border-brand-green focus:ring-2 focus:ring-brand-green/15"
                value={value?.uri || ""}
                onChange={(e) => onChange({ ...value, uri: e.target.value })}
                placeholder={uriPlaceholder}
              />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-brand-green-dark"
            >
              <Upload className="h-4 w-4" strokeWidth={2} />
              Upload image
            </button>
            {(preview || value?.uri || value?.data) && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-4 py-2.5 text-xs font-semibold text-brand-muted transition-all hover:border-red-300 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
                Remove
              </button>
            )}
          </div>

          {value?.data ? (
            <p className="text-[11px] text-brand-muted">
              Base64 attached ({Math.round((value.data.length * 3) / 4 / 1024)} KB est.)
            </p>
          ) : value?.uri ? (
            <p className="text-[11px] text-brand-muted">URI only — upload a file to attach base64 for the API payload.</p>
          ) : null}

          {error ? <p className="text-xs font-medium text-red-500">{error}</p> : null}
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <ImageLightbox
        open={lightboxOpen}
        images={[preview]}
        index={0}
        onClose={() => setLightboxOpen(false)}
        alt={label || "Cover image"}
      />
    </div>
  );
}
