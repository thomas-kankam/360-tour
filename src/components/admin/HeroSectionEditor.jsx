import { useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import uploadServiceApi from "../../apis/UploadServiceApi";
import { HERO_SLIDESHOW_MAX } from "../../utils/landingCmsStorage";

function TextField({ label, value, onChange, multiline = false }) {
  const className =
    "mt-1.5 w-full rounded-xl border border-brand-border/70 bg-white px-3 py-2 text-sm outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/15";

  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">{label}</span>
      {multiline ? (
        <textarea rows={3} className={className} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={className} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function ImageUploadField({ label, value, onChange, variant = "hero", hint }) {
  const inputRef = useRef(null);
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !token) return;

    try {
      setUploading(true);
      const result = await uploadServiceApi.uploadImage(token, file, { variant, role: "admin" });
      if (!result.ok || !result.url) {
        toast.error(result.reason || "Could not upload image.");
        return;
      }
      onChange(result.url);
    } catch (err) {
      toast.error(err.message || "Could not upload image.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="sm:col-span-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">{label}</span>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group relative flex h-28 w-40 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-brand-border bg-brand-cream/40"
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-7 w-7 text-brand-muted group-hover:text-brand-primary" aria-hidden />
          )}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="block rounded-xl border border-brand-border/70 px-3 py-1.5 text-xs font-semibold text-brand-ink hover:bg-brand-cream"
          >
            Upload image
            {uploading ? <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
          </button>
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
            </button>
          ) : null}
          {hint ? <p className="text-[11px] text-brand-muted">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}

function VideoUploadField({ label, value, onChange }) {
  const inputRef = useRef(null);
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !token) return;

    try {
      setUploading(true);
      const result = await uploadServiceApi.uploadVideo(token, file, { role: "admin" });
      if (!result.ok || !result.url) {
        toast.error(result.reason || "Could not upload video.");
        return;
      }
      onChange(result.url);
      toast.success("Video uploaded. Use a short clip (under 30s) for best performance.");
    } catch (err) {
      toast.error(err.message || "Could not upload video.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="sm:col-span-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">{label}</span>
      <div className="mt-2 space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-xl border border-brand-border/70 px-3 py-1.5 text-xs font-semibold text-brand-ink hover:bg-brand-cream"
          >
            Upload video (MP4/WebM)
            {uploading ? <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
          </button>
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove video
            </button>
          ) : null}
        </div>
        <input ref={inputRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={handleFileChange} />
        {value ? (
          <video src={value} className="max-h-40 rounded-xl border border-brand-border/60" muted playsInline controls />
        ) : null}
        <p className="text-[11px] text-brand-muted">
          Keep hero videos short and under 25 MB. They play muted and loop automatically.
        </p>
      </div>
    </div>
  );
}

const TEXT_FIELDS = [
  ["badge", "Badge"],
  ["title", "Title"],
  ["titleHighlight", "Title highlight"],
  ["tagline", "Tagline"],
  ["primaryCtaLabel", "Primary button label"],
  ["secondaryCtaLabel", "Secondary button label"],
];

export default function HeroSectionEditor({ hero, onChange }) {
  const mediaType = hero.mediaType || "image";
  const slides = Array.isArray(hero.slideshowImages) ? hero.slideshowImages : [];

  function patch(fields) {
    onChange({ ...hero, ...fields });
  }

  function updateSlide(index, url) {
    const next = [...slides];
    next[index] = url;
    patch({ slideshowImages: next });
  }

  function addSlide() {
    if (slides.length >= HERO_SLIDESHOW_MAX) {
      toast.info(`You can add up to ${HERO_SLIDESHOW_MAX} slides.`);
      return;
    }
    patch({ slideshowImages: [...slides, ""] });
  }

  function removeSlide(index) {
    patch({ slideshowImages: slides.filter((_, idx) => idx !== index) });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {TEXT_FIELDS.map(([key, label]) => (
        <TextField
          key={key}
          label={label}
          value={hero[key] || ""}
          onChange={(value) => patch({ [key]: value })}
          multiline={key === "tagline"}
        />
      ))}

      <TextField
        label="Subtitle"
        value={hero.subtitle || ""}
        onChange={(value) => patch({ subtitle: value })}
        multiline
      />

      <div className="sm:col-span-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Hero media type</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            { id: "image", label: "Single image" },
            { id: "slideshow", label: "Sliding images" },
            { id: "video", label: "Video" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => patch({ mediaType: option.id })}
              className={[
                "rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                mediaType === option.id
                  ? "bg-brand-primary text-white"
                  : "border border-brand-border/70 text-brand-ink hover:bg-brand-cream",
              ].join(" ")}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {mediaType === "image" ? (
        <ImageUploadField
          label="Background image"
          value={hero.backgroundImage || ""}
          onChange={(url) => patch({ backgroundImage: url })}
          variant="hero"
          hint="Large photos are compressed automatically."
        />
      ) : null}

      {mediaType === "slideshow" ? (
        <div className="sm:col-span-2 space-y-4">
          <p className="text-xs text-brand-muted">
            Add up to {HERO_SLIDESHOW_MAX} images. They fade automatically on the home page — visitors can also use the left and right arrows.
          </p>
          {slides.map((slide, index) => (
            <div key={index} className="rounded-xl border border-brand-border/50 bg-brand-cream/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold text-brand-ink">Slide {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeSlide(index)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
              <ImageUploadField
                label=""
                value={slide}
                onChange={(url) => updateSlide(index, url)}
                variant="hero"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addSlide}
            disabled={slides.length >= HERO_SLIDESHOW_MAX}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Add slide ({slides.length}/{HERO_SLIDESHOW_MAX})
          </button>
          <ImageUploadField
            label="Fallback image (optional)"
            value={hero.backgroundImage || ""}
            onChange={(url) => patch({ backgroundImage: url })}
            variant="hero"
            hint="Shown while slides load or if the slideshow is empty."
          />
        </div>
      ) : null}

      {mediaType === "video" ? (
        <>
          <VideoUploadField
            label="Hero video"
            value={hero.backgroundVideo || ""}
            onChange={(url) => patch({ backgroundVideo: url })}
          />
          <ImageUploadField
            label="Poster image (optional)"
            value={hero.backgroundImage || ""}
            onChange={(url) => patch({ backgroundImage: url })}
            variant="hero"
            hint="Shown before the video loads."
          />
        </>
      ) : null}
    </div>
  );
}
