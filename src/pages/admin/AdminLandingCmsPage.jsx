import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, ImagePlus, Loader2, RotateCcw, Save, Trash2, UploadCloud } from "lucide-react";
import { toast } from "react-toastify";
import adminLandingCmsServiceApi from "../../apis/AdminLandingCmsServiceApi";
import LandingCmsItemsEditor from "../../components/admin/LandingCmsItemsEditor";
import HomeHero from "../../components/home/HomeHero";
import HomeFeaturedTours from "../../components/home/HomeFeaturedTours";
import HomeDestinations from "../../components/home/HomeDestinations";
import HomeHubs from "../../components/home/HomeHubs";
import HomeAdventureGallery from "../../components/home/HomeAdventureGallery";
import HomeTestimonial from "../../components/home/HomeTestimonial";
import HomeExploreLinks from "../../components/home/HomeExploreLinks";
import HomeCta from "../../components/home/HomeCta";
import { useAuth } from "../../hooks/useAuth";
import {
  isCmsImageField,
  LANDING_CMS_DEFAULTS,
  LANDING_CMS_SECTIONS,
} from "../../utils/landingCmsStorage";
import { persistLandingCmsMedia } from "../../utils/landingCmsHelpers";
import { optimizeImageFile } from "../../utils/imageOptimize";
import uploadServiceApi from "../../apis/UploadServiceApi";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function Field({ label, value, onChange, multiline = false }) {
  const className =
    "mt-1.5 w-full rounded-xl border border-brand-border/70 bg-white px-3 py-2 text-sm outline-none focus:border-brand-green/50 focus:ring-2 focus:ring-brand-green/15";

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

function ImageField({ label, value, onChange, variant = "destination" }) {
  const inputRef = useRef(null);
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be under 2 MB.");
      return;
    }
    if (!token) {
      toast.error("Sign in again to upload images.");
      return;
    }
    try {
      setUploading(true);
      const optimized = await optimizeImageFile(file, variant);
      const result = await uploadServiceApi.uploadImage(token, optimized, { variant, role: "admin" });
      if (!result.ok || !result.url) {
        toast.error(result.reason || "Could not upload image.");
        return;
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
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group relative flex h-28 w-40 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-brand-border bg-brand-cream/40 transition-colors hover:border-brand-green/40"
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-7 w-7 text-brand-muted group-hover:text-brand-green" aria-hidden />
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
        </div>
      </div>
    </div>
  );
}

function formatFieldLabel(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .replace("Image", " image");
}

const MULTILINE_KEYS = new Set(["subtitle", "aboutText", "whyText", "contactText", "whatsappMessage", "footerNote"]);
const ITEMS_SECTIONS = new Set(["regions", "destinations"]);

export default function AdminLandingCmsPage() {
  const { token } = useAuth();
  const [cms, setCms] = useState(() => structuredClone(LANDING_CMS_DEFAULTS));
  const [activeSection, setActiveSection] = useState("hero");
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [meta, setMeta] = useState(null);

  const sectionFields = useMemo(() => cms[activeSection] || {}, [cms, activeSection]);
  const isBusy = savingDraft || publishing || resetting;

  useEffect(() => {
    let cancelled = false;

    async function loadCms() {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const result = await adminLandingCmsServiceApi.getCms(token);
      if (cancelled) return;

      if (result.content) setCms(result.content);
      setMeta(result.meta);
      setLoading(false);

      if (!result.ok && result.reason) {
        toast.error(result.reason);
      }
    }

    loadCms();
    return () => {
      cancelled = true;
    };
  }, [token]);

  function updateField(key, value) {
    setCms((prev) => ({
      ...prev,
      [activeSection]: {
        ...prev[activeSection],
        [key]: value,
      },
    }));
  }

  function updateItems(nextItems) {
    updateField("items", nextItems);
  }

  async function handleSaveDraft() {
    if (!token) {
      toast.error("Sign in again to save landing page content.");
      return;
    }

    setSavingDraft(true);
    const prepared = await persistLandingCmsMedia(cms, token);
    const result = await adminLandingCmsServiceApi.saveDraft(token, prepared);
    setSavingDraft(false);

    if (!result.ok) {
      toast.error(result.reason || "Could not save draft.");
      return;
    }

    setCms(result.content);
    setMeta(result.meta);
    window.dispatchEvent(new Event("landing-cms-updated"));
    toast.success(result.source === "local" ? result.reason || "Draft saved locally." : "Draft saved.");
  }

  async function handlePublish() {
    if (!token) {
      toast.error("Sign in again to publish landing page content.");
      return;
    }

    setPublishing(true);
    const prepared = await persistLandingCmsMedia(cms, token);
    const result = await adminLandingCmsServiceApi.publish(token, prepared);
    setPublishing(false);

    if (!result.ok) {
      toast.error(result.reason || "Could not publish landing page.");
      return;
    }

    setCms(result.content);
    setMeta(result.meta);
    window.dispatchEvent(new Event("landing-cms-updated"));
    toast.success(result.source === "local" ? result.reason || "Saved locally." : "Landing page published.");
  }

  async function handleReset() {
    if (!token) {
      toast.error("Sign in again to reset landing page content.");
      return;
    }

    setResetting(true);
    const result = await adminLandingCmsServiceApi.resetDraft(token);
    setResetting(false);

    if (!result.ok) {
      toast.error(result.reason || "Could not reset landing page.");
      return;
    }

    setCms(result.content);
    setMeta(result.meta);
    window.dispatchEvent(new Event("landing-cms-updated"));
    toast.success("Landing page reset to defaults.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-green">Content</p>
          <h1 className="mt-1 text-2xl font-bold text-brand-ink sm:text-3xl">Landing page CMS</h1>
          <p className="mt-2 max-w-2xl text-sm text-brand-muted">
            Six editable sections: hero, featured tours, Ghana regions, popular destinations, explore links, and a final call to action.
          </p>
          {meta?.publishedAt ? (
            <p className="mt-2 text-xs text-brand-muted">
              Last published {new Date(meta.publishedAt).toLocaleString()}
              {meta.hasUnpublishedChanges ? " · unpublished draft changes" : ""}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            disabled={loading || isBusy}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-border/70 px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-brand-cream disabled:opacity-60"
          >
            <Eye className="h-4 w-4" aria-hidden /> {preview ? "Hide preview" : "Show preview"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={loading || isBusy}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-border/70 px-4 py-2 text-sm font-semibold text-brand-muted hover:bg-brand-cream disabled:opacity-60"
          >
            {resetting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <RotateCcw className="h-4 w-4" aria-hidden />}
            Reset
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={loading || isBusy}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-green/30 bg-white px-4 py-2 text-sm font-semibold text-brand-green hover:bg-brand-green/5 disabled:opacity-60"
          >
            {savingDraft ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
            Save draft
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={loading || isBusy}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-brand-green/90 disabled:opacity-60"
          >
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <UploadCloud className="h-4 w-4" aria-hidden />}
            Publish changes
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-brand-border/60 bg-white px-4 py-6 text-sm text-brand-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading landing page content…
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <div className="rounded-2xl border border-brand-border/60 bg-white p-3 shadow-sm">
            {LANDING_CMS_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={[
                  "mb-1 w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                  activeSection === section.id ? "bg-brand-green text-white" : "text-brand-ink hover:bg-brand-cream",
                ].join(" ")}
              >
                {section.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm sm:p-6">
            <p className="mb-4 text-sm font-bold text-brand-ink">
              Edit {LANDING_CMS_SECTIONS.find((s) => s.id === activeSection)?.label}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(sectionFields)
                .filter(([key]) => key !== "items")
                .map(([key, value]) =>
                isCmsImageField(key) ? (
                  <ImageField
                    key={key}
                    label={formatFieldLabel(key)}
                    value={value}
                    variant={key === "backgroundImage" ? "hero" : "destination"}
                    onChange={(next) => updateField(key, next)}
                  />
                ) : (
                  <Field
                    key={key}
                    label={formatFieldLabel(key)}
                    value={value}
                    onChange={(next) => updateField(key, next)}
                    multiline={MULTILINE_KEYS.has(key)}
                  />
                ),
              )}
            </div>
            {ITEMS_SECTIONS.has(activeSection) ? (
              <LandingCmsItemsEditor
                sectionId={activeSection}
                items={sectionFields.items || []}
                onChange={updateItems}
              />
            ) : null}
          </div>
        </div>
      )}

      {preview && !loading ? (
        <div className="overflow-hidden rounded-2xl border border-brand-border/60 bg-white shadow-sm">
          <div className="border-b border-brand-border/40 bg-brand-cream/50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
            Live preview
          </div>
          <div className="pointer-events-none select-none">
            <HomeHero cmsOverride={cms.hero} />
            <HomeFeaturedTours cmsOverride={cms.tours} />
            <HomeHubs cmsOverride={cms.regions} />
            <HomeDestinations cmsOverride={cms.destinations} />
            <HomeAdventureGallery cmsOverride={cms.gallery} />
            <HomeTestimonial cmsOverride={cms.testimonials} />
            <HomeExploreLinks cmsOverride={cms.explore} />
            <HomeCta cmsOverride={cms.cta} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
