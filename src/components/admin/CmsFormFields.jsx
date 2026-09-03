import { useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import uploadServiceApi from "../../apis/UploadServiceApi";

export function CmsTextField({ label, value, onChange, multiline = false, hint, required = false, placeholder = "" }) {
  const className =
    "mt-1.5 w-full rounded-xl border border-brand-border/70 bg-white px-3 py-2 text-sm outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/15";

  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">
        {label}
        {required ? " *" : ""}
      </span>
      {multiline ? (
        <textarea
          rows={4}
          className={className}
          value={value || ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={className}
          value={value || ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint ? <p className="mt-1 text-[11px] text-brand-muted">{hint}</p> : null}
    </label>
  );
}

export function CmsSelectField({ label, value, onChange, options = [], hint, required = false }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">
        {label}
        {required ? " *" : ""}
      </span>
      <select
        className="mt-1.5 w-full rounded-xl border border-brand-border/70 bg-white px-3 py-2 text-sm outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/15"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => {
          const id = typeof option === "string" ? option : option.id;
          const optionLabel = typeof option === "string" ? option : option.label;
          return (
            <option key={id} value={id}>
              {optionLabel}
            </option>
          );
        })}
      </select>
      {hint ? <p className="mt-1 text-[11px] text-brand-muted">{hint}</p> : null}
    </label>
  );
}

/** Chip-based list editor — type + Enter/Add, click suggestions, remove chips. */
export function CmsTagField({ label, items = [], onChange, suggestions = [], hint, placeholder = "Type and press Enter" }) {
  const [draft, setDraft] = useState("");
  const list = Array.isArray(items) ? items : [];

  function addTag(raw) {
    const value = String(raw || "").trim();
    if (!value) return;
    if (list.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...list, value]);
    setDraft("");
  }

  function removeTag(index) {
    onChange(list.filter((_, i) => i !== index));
  }

  const unusedSuggestions = suggestions.filter(
    (suggestion) => !list.some((item) => item.toLowerCase() === suggestion.toLowerCase()),
  );

  return (
    <div>
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">{label}</span>
      <div className="mt-1.5 rounded-xl border border-brand-border/70 bg-white p-3">
        {list.length ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {list.map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-2.5 py-1 text-xs font-semibold text-brand-primary"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="rounded-full p-0.5 hover:bg-brand-primary/15"
                  aria-label={`Remove ${item}`}
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="mb-3 text-xs text-brand-muted">No items yet — add a few below.</p>
        )}

        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag(draft);
              }
            }}
            placeholder={placeholder}
            className="min-w-0 flex-1 rounded-lg border border-brand-border/70 px-3 py-2 text-sm outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/15"
          />
          <button
            type="button"
            onClick={() => addTag(draft)}
            className="inline-flex items-center gap-1 rounded-lg border border-brand-border/70 px-3 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-cream"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden /> Add
          </button>
        </div>

        {unusedSuggestions.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {unusedSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="rounded-full border border-dashed border-brand-border px-2.5 py-1 text-[11px] font-semibold text-brand-muted hover:border-brand-primary/40 hover:text-brand-primary"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {hint ? <p className="mt-1 text-[11px] text-brand-muted">{hint}</p> : null}
    </div>
  );
}

export function CmsImageField({ label, value, onChange }) {
  const inputRef = useRef(null);
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !token) return;
    try {
      setUploading(true);
      const result = await uploadServiceApi.uploadImage(token, file, { variant: "destination", role: "admin" });
      if (!result.ok || !result.url) {
        toast.error(result.reason || "Could not upload image.");
        return;
      }
      onChange(result.url);
    } catch (err) {
      toast.error(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
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
            className="rounded-xl border border-brand-border/70 px-3 py-1.5 text-xs font-semibold text-brand-ink hover:bg-brand-cream"
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
        </div>
      </div>
    </div>
  );
}

export function CmsStatusBadge({ status }) {
  const published = status === "published";
  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        published ? "bg-brand-primary/10 text-brand-primary" : "bg-brand-cream text-brand-muted",
      ].join(" ")}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

export function listToLines(items = []) {
  return (items || []).join("\n");
}

export function linesToList(value = "") {
  return String(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
