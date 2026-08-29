import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { getPopularDestinationImage } from "../../config/images";
import { useAuth } from "../../hooks/useAuth";
import uploadServiceApi from "../../apis/UploadServiceApi";

function ItemImageField({ label, value, fallbackSrc, onChange }) {
  const inputRef = useRef(null);
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const preview = value || fallbackSrc;

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!token) {
      toast.error("Sign in again to upload images.");
      return;
    }
    try {
      setUploading(true);
      const result = await uploadServiceApi.uploadImage(token, file, { variant: "destination", role: "admin" });
      if (!result.ok || !result.url) {
        toast.error(result.reason || "Could not upload image.");
        return;
      }
      if (result.optimizeMeta?.savedLabel) {
        toast.info(result.optimizeMeta.savedLabel);
      }
      onChange(result.url);
    } catch (err) {
      toast.error(err.message || "Could not read image.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="sm:col-span-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">{label}</span>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="relative flex h-20 w-28 items-center justify-center overflow-hidden rounded-xl border border-dashed border-brand-border bg-brand-cream/40"
        >
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-brand-muted" aria-hidden />
          ) : (
            <ImagePlus className="h-6 w-6 text-brand-muted" aria-hidden />
          )}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <input
          className="min-w-[200px] flex-1 rounded-xl border border-brand-border/70 bg-white px-3 py-2 text-xs outline-none focus:border-brand-primary/50"
          placeholder="Or paste image URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value ? (
          <button type="button" onClick={() => onChange("")} className="text-xs font-semibold text-red-600 hover:underline">
            Clear
          </button>
        ) : null}
      </div>
      <p className="mt-1.5 text-[11px] text-brand-muted">
        Large photos are automatically compressed to under 2 MB and cropped to 16:10 for the landing page.
      </p>
    </div>
  );
}

function ItemField({ label, value, onChange, multiline = false }) {
  const className =
    "mt-1 w-full rounded-xl border border-brand-border/70 bg-white px-3 py-2 text-sm outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/15";

  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">{label}</span>
      {multiline ? (
        <textarea rows={2} className={className} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={className} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

export default function LandingCmsItemsEditor({ sectionId, items = [], onChange }) {
  function updateItem(index, patch) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function moveItem(index, direction) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  }

  const sectionCopy = {
    regions: {
      title: "Ghana region cards",
      hint: "Edit names, copy, and photos for each region card.",
    },
    destinations: {
      title: "Popular destination cards",
      hint: "Edit names, copy, and photos for each destination card.",
    },
    gallery: {
      title: "Adventure gallery photos",
      hint: "Each tile appears in the mosaic on the home page. Upload a photo and set the caption and region label.",
    },
    testimonials: {
      title: "Guest story cards",
      hint: "Edit the quote, guest name, tour label, rating, and spotlight photo for each story.",
    },
  }[sectionId] || { title: "Section items", hint: "Edit each card below." };

  return (
    <div className="mt-8 space-y-4 border-t border-brand-border/50 pt-6">
      <div>
        <p className="text-sm font-bold text-brand-ink">{sectionCopy.title}</p>
        <p className="mt-1 text-xs text-brand-muted">{sectionCopy.hint}</p>
      </div>

      {items.map((item, index) => (
        <div key={item.id || index} className="rounded-2xl border border-brand-border/60 bg-brand-cream/20 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-brand-ink">
              {index + 1}. {item.name || item.caption || item.tour || "Untitled"}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
                className="rounded-lg border border-brand-border/70 p-1.5 text-brand-muted hover:bg-white disabled:opacity-40"
                aria-label="Move up"
              >
                <ChevronUp className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, 1)}
                disabled={index === items.length - 1}
                className="rounded-lg border border-brand-border/70 p-1.5 text-brand-muted hover:bg-white disabled:opacity-40"
                aria-label="Move down"
              >
                <ChevronDown className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {sectionId === "gallery" ? (
              <>
                <ItemField label="Caption" value={item.caption} onChange={(value) => updateItem(index, { caption: value })} />
                <ItemField label="Region label" value={item.region} onChange={(value) => updateItem(index, { region: value })} />
              </>
            ) : null}

            {sectionId === "testimonials" ? (
              <>
                <ItemField label="Guest name" value={item.name} onChange={(value) => updateItem(index, { name: value })} />
                <ItemField label="Initials" value={item.initials} onChange={(value) => updateItem(index, { initials: value })} />
                <ItemField label="Tour label" value={item.tour} onChange={(value) => updateItem(index, { tour: value })} />
                <ItemField label="Role / group" value={item.role} onChange={(value) => updateItem(index, { role: value })} />
                <ItemField label="Rating" value={item.rating} onChange={(value) => updateItem(index, { rating: value })} />
                <div className="sm:col-span-2">
                  <ItemField
                    label="Quote"
                    value={item.quote}
                    onChange={(value) => updateItem(index, { quote: value })}
                    multiline
                  />
                </div>
              </>
            ) : null}

            {sectionId === "regions" || sectionId === "destinations" ? (
              <>
                <ItemField label="Name" value={item.name} onChange={(value) => updateItem(index, { name: value })} />
                <ItemField label="Region label" value={item.region} onChange={(value) => updateItem(index, { region: value })} />
              </>
            ) : null}

            {sectionId === "regions" ? (
              <>
                <ItemField label="Tagline" value={item.tagline} onChange={(value) => updateItem(index, { tagline: value })} />
                <ItemField
                  label="Package filter (optional)"
                  value={item.packageId || ""}
                  onChange={(value) => updateItem(index, { packageId: value })}
                />
                <div className="sm:col-span-2">
                  <ItemField
                    label="Description"
                    value={item.desc}
                    onChange={(value) => updateItem(index, { desc: value })}
                    multiline
                  />
                </div>
                <div className="sm:col-span-2">
                  <ItemField
                    label="Highlights (comma-separated)"
                    value={item.highlights}
                    onChange={(value) => updateItem(index, { highlights: value })}
                    multiline
                  />
                </div>
              </>
            ) : null}

            <ItemImageField
              label="Photo"
              value={item.image || ""}
              fallbackSrc={
                sectionId === "gallery"
                  ? item.slug
                    ? `/images/gallery/optimized/${item.slug}.webp`
                    : ""
                  : getPopularDestinationImage(item.imageKey, { preferWebp: false })
              }
              onChange={(value) => updateItem(index, { image: value })}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
