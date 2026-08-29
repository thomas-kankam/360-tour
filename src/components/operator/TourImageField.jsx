import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload, ZoomIn } from "lucide-react";
import ImageLightbox from "../misc/ImageLightbox";
import { useAuth } from "../../hooks/useAuth";
import uploadServiceApi from "../../apis/UploadServiceApi";
import { isAdminRole, isOperatorRole } from "../../constants/roles";
import { getImagePreviewSrc } from "../../utils/tourImageUtils";

export default function TourImageField({
  label,
  hint,
  value,
  onChange,
  uriPlaceholder = "tours/cover.jpg",
  beforeUpload,
  showUriField = true,
  variant = "tour",
}) {
  const inputRef = useRef(null);
  const { token, role } = useAuth();
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const preview = getImagePreviewSrc(value);
  const uploadRole = isAdminRole(role) || isOperatorRole(role) ? "admin" : "client";

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
      if (!token) {
        setError("Sign in again to upload images.");
        return;
      }

      setUploading(true);
      const result = await uploadServiceApi.uploadImage(token, file, { variant, role: uploadRole });
      if (!result.ok || !result.url) {
        setError(result.reason || "Upload failed.");
        return;
      }

      onChange({
        uri: result.url,
        data: "",
        mimeType: result.optimizeMeta?.file?.type || "image/jpeg",
      });
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
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
                className="w-full rounded-xl border-2 border-brand-border bg-white px-4 py-2.5 text-sm font-medium text-brand-ink outline-none transition-all focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
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
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-brand-primary-dark disabled:opacity-60"
            >
              <Upload className="h-4 w-4" strokeWidth={2} />
              {uploading ? "Uploading…" : "Upload image"}
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

          {uploading ? (
            <p className="inline-flex items-center gap-1.5 text-[11px] text-brand-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              Optimizing and uploading image…
            </p>
          ) : value?.uri ? (
            <p className="text-[11px] text-brand-muted">Saved as a file URL — the listing payload will not include base64.</p>
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
