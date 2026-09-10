import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  ImagePlus,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "react-toastify";
import adminAboutCmsServiceApi from "../../apis/AdminAboutCmsServiceApi";
import uploadServiceApi from "../../apis/UploadServiceApi";
import AboutCmsPreview from "../../components/admin/AboutCmsPreview";
import CmsIconPicker from "../../components/admin/CmsIconPicker";
import { CmsTagField, CmsTextField } from "../../components/admin/CmsFormFields";
import { useAuth } from "../../hooks/useAuth";
import { GuestIcon } from "../../utils/guestIcons";
import {
  ABOUT_CMS_DEFAULTS,
  ABOUT_CMS_SECTIONS,
  mergeAboutCmsWithDefaults,
} from "../../utils/aboutCmsStorage";

function ImageField({ label, value, onChange, hint }) {
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
      toast.error(err.message || "Could not upload image.");
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
          className="relative flex h-28 w-40 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-brand-border bg-brand-cream/40"
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-7 w-7 text-brand-muted" />
          )}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border/70 px-3 py-1.5 text-xs font-semibold"
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Upload image
          </button>
          {value ? (
            <button type="button" onClick={() => onChange("")} className="block text-xs font-semibold text-red-600">
              Remove
            </button>
          ) : null}
          {hint ? <p className="max-w-[14rem] text-[11px] text-brand-muted">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}

function ServiceCardEditor({ items = [], onChange, withDetails = false, emptyLabel = "service" }) {
  const [expanded, setExpanded] = useState(0);

  function updateItem(index, patch) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function moveItem(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [removed] = next.splice(index, 1);
    next.splice(target, 0, removed);
    onChange(next);
    setExpanded(target);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-brand-muted">
          {items.length} {emptyLabel}
          {items.length === 1 ? "" : "s"} · click a card to edit
        </p>
        <button
          type="button"
          onClick={() => {
            onChange([
              ...items,
              {
                label: "",
                description: "",
                icon: "compass",
                ...(withDetails ? { details: [] } : {}),
              },
            ]);
            setExpanded(items.length);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-3 py-2 text-xs font-semibold text-white"
        >
          <Plus className="h-3.5 w-3.5" /> Add {emptyLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-border bg-brand-cream/40 px-5 py-10 text-center">
          <p className="text-sm font-semibold text-brand-ink">No items yet</p>
          <p className="mt-1 text-xs text-brand-muted">Add your first {emptyLabel} to show it on the About page.</p>
        </div>
      ) : null}

      {items.map((item, index) => {
        const open = expanded === index;
        return (
          <div key={index} className="overflow-hidden rounded-2xl border border-brand-border/60 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setExpanded(open ? -1 : index)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-brand-cream/40"
            >
              <GripVertical className="h-4 w-4 shrink-0 text-brand-muted/50" aria-hidden />
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <GuestIcon name={item.icon || "compass"} className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-brand-ink">
                  {item.label || `Untitled ${emptyLabel}`}
                </span>
                <span className="block truncate text-xs text-brand-muted">
                  {item.description || "No description yet"}
                </span>
              </span>
              {open ? <ChevronUp className="h-4 w-4 text-brand-muted" /> : <ChevronDown className="h-4 w-4 text-brand-muted" />}
            </button>

            {open ? (
              <div className="space-y-4 border-t border-brand-border/50 bg-brand-cream/20 px-4 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <CmsTextField
                    label="Title"
                    value={item.label}
                    onChange={(label) => updateItem(index, { label })}
                    placeholder="e.g. Guided City Tours"
                  />
                  <CmsIconPicker
                    label="Icon"
                    value={item.icon || "compass"}
                    onChange={(icon) => updateItem(index, { icon })}
                  />
                </div>
                <CmsTextField
                  label="Description"
                  multiline
                  value={item.description}
                  onChange={(description) => updateItem(index, { description })}
                  placeholder="What guests get from this offering…"
                />
                {withDetails ? (
                  <CmsTagField
                    label="Bullet details"
                    items={item.details || []}
                    onChange={(details) => updateItem(index, { details })}
                    placeholder="Add a detail and press Enter"
                    hint="Shown as checklist bullets under this service"
                  />
                ) : null}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-border/40 pt-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveItem(index, -1)}
                      className="rounded-lg border border-brand-border px-2.5 py-1.5 text-xs font-semibold disabled:opacity-40"
                    >
                      Move up
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => moveItem(index, 1)}
                      className="rounded-lg border border-brand-border px-2.5 py-1.5 text-xs font-semibold disabled:opacity-40"
                    >
                      Move down
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(items.filter((_, i) => i !== index));
                      setExpanded(-1);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function FaqEditor({ items = [], onChange }) {
  const [expanded, setExpanded] = useState(0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-brand-muted">{items.length} FAQ{items.length === 1 ? "" : "s"}</p>
        <button
          type="button"
          onClick={() => {
            onChange([...(items || []), { question: "", answer: "" }]);
            setExpanded(items.length);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-3 py-2 text-xs font-semibold text-white"
        >
          <Plus className="h-3.5 w-3.5" /> Add FAQ
        </button>
      </div>
      {items.map((faq, index) => {
        const open = expanded === index;
        return (
          <div key={index} className="overflow-hidden rounded-2xl border border-brand-border/60 bg-white">
            <button
              type="button"
              onClick={() => setExpanded(open ? -1 : index)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-brand-ink">
                  {faq.question || `FAQ ${index + 1}`}
                </span>
                <span className="block truncate text-xs text-brand-muted">{faq.answer || "No answer yet"}</span>
              </span>
              {open ? <ChevronUp className="h-4 w-4 text-brand-muted" /> : <ChevronDown className="h-4 w-4 text-brand-muted" />}
            </button>
            {open ? (
              <div className="space-y-3 border-t border-brand-border/50 px-4 py-4">
                <CmsTextField
                  label="Question"
                  value={faq.question}
                  onChange={(question) => onChange(items.map((item, i) => (i === index ? { ...item, question } : item)))}
                />
                <CmsTextField
                  label="Answer"
                  multiline
                  value={faq.answer}
                  onChange={(answer) => onChange(items.map((item, i) => (i === index ? { ...item, answer } : item)))}
                />
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                  className="text-xs font-semibold text-red-600"
                >
                  Remove FAQ
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function HeroServicesEditor({ items = [], onChange }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Hero service pills</p>
          <p className="mt-1 text-xs text-brand-muted">Usually 3 short labels with icons under the hero copy.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...(items || []), { label: "", icon: "compass" }])}
          className="inline-flex items-center gap-1 rounded-xl border border-brand-border px-3 py-1.5 text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {(items || []).map((item, index) => (
          <div key={index} className="rounded-2xl border border-brand-border/60 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-accent/30 text-brand-primary">
                <GuestIcon name={item.icon || "compass"} className="h-4 w-4" />
              </span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="text-xs font-semibold text-red-600"
              >
                Remove
              </button>
            </div>
            <CmsTextField
              label="Label"
              value={item.label}
              onChange={(label) => onChange(items.map((row, i) => (i === index ? { ...row, label } : row)))}
              placeholder="Guided Tours"
            />
            <div className="mt-3">
              <CmsIconPicker
                label="Icon"
                value={item.icon || "compass"}
                onChange={(icon) => onChange(items.map((row, i) => (i === index ? { ...row, icon } : row)))}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminAboutCmsPage() {
  const { token } = useAuth();
  const [cms, setCms] = useState(ABOUT_CMS_DEFAULTS);
  const [sectionId, setSectionId] = useState("hero");
  const [preview, setPreview] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await adminAboutCmsServiceApi.getCms(token);
      setCms(mergeAboutCmsWithDefaults(result.content || ABOUT_CMS_DEFAULTS));
      setLoading(false);
      if (!result.ok && result.reason) toast.error(result.reason);
    }
    if (token) load();
  }, [token]);

  function patchSection(section, patch) {
    setCms((current) => ({
      ...current,
      [section]: Array.isArray(current[section]) ? patch : { ...current[section], ...patch },
    }));
  }

  async function handleSave() {
    setSaving(true);
    const result = await adminAboutCmsServiceApi.saveDraft(token, cms);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.reason || "Could not save draft.");
      return;
    }
    setCms(result.content);
    window.dispatchEvent(new Event("about-cms-updated"));
    toast.success("About draft saved.");
  }

  async function handlePublish() {
    setPublishing(true);
    const result = await adminAboutCmsServiceApi.publish(token, cms);
    setPublishing(false);
    if (!result.ok) {
      toast.error(result.reason || "Could not publish.");
      return;
    }
    setCms(result.content);
    window.dispatchEvent(new Event("about-cms-updated"));
    toast.success("About page published.");
  }

  async function handleReset() {
    setSaving(true);
    const result = await adminAboutCmsServiceApi.saveDraft(token, ABOUT_CMS_DEFAULTS);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.reason || "Could not reset draft.");
      return;
    }
    setCms(mergeAboutCmsWithDefaults(result.content || ABOUT_CMS_DEFAULTS));
    window.dispatchEvent(new Event("about-cms-updated"));
    toast.info("Draft reset to defaults.");
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  const hero = cms.hero || {};
  const company = cms.company || {};
  const story = cms.story || {};
  const mission = cms.mission || {};
  const vision = cms.vision || {};
  const cta = cms.cta || {};
  const busy = saving || publishing;
  const activeSection = ABOUT_CMS_SECTIONS.find((section) => section.id === sectionId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-primary">Content</p>
          <h1 className="mt-1 text-2xl font-bold text-brand-ink sm:text-3xl">About Us CMS</h1>
          <p className="mt-2 max-w-2xl text-sm text-brand-muted">
            Edit each About page section with visual controls. Preview updates as you type, then save a draft or publish live.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPreview((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-border/70 px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-brand-cream"
          >
            {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {preview ? "Hide preview" : "Show preview"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-border/70 px-4 py-2 text-sm font-semibold text-brand-muted disabled:opacity-60"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-border/70 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save draft
          </button>
          <button type="button" onClick={handlePublish} disabled={busy} className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-60">
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            Publish
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {ABOUT_CMS_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setSectionId(section.id)}
            className={[
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              sectionId === section.id
                ? "bg-brand-primary text-white shadow-sm"
                : "border border-brand-border bg-white text-brand-muted hover:border-brand-primary/30 hover:text-brand-primary",
            ].join(" ")}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className={["grid gap-6", preview ? "xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]" : ""].join(" ")}>
        <div className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 border-b border-brand-border/50 pb-4">
            <h2 className="text-lg font-bold text-brand-ink">{activeSection?.label}</h2>
            <p className="mt-1 text-sm text-brand-muted">
              {sectionId === "hero" && "Headline, hero photos, and the three service pills at the top of About."}
              {sectionId === "company" && "Company name, location, and motto shown across the page."}
              {sectionId === "story" && "Long-form story paragraphs under Our Story."}
              {sectionId === "mission" && "Mission, vision, and the values chips."}
              {sectionId === "tourServices" && "Guided tour / experience cards with icons."}
              {sectionId === "supportServices" && "Accommodation, transport, and planning cards."}
              {sectionId === "popularDestinations" && "Destination chips. Add, remove, or create custom ones."}
              {sectionId === "whyTravelWithUs" && "Reasons guests choose 360 Tours."}
              {sectionId === "faqs" && "Questions and answers on the About page."}
              {sectionId === "cta" && "Bottom call-to-action banner and button labels."}
            </p>
          </div>

          {sectionId === "hero" ? (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <CmsTextField label="Eyebrow" value={hero.eyebrow} onChange={(eyebrow) => patchSection("hero", { eyebrow })} />
                <CmsTextField label="Title" value={hero.title} onChange={(title) => patchSection("hero", { title })} />
                <CmsTextField label="Title line" value={hero.titleLine} onChange={(titleLine) => patchSection("hero", { titleLine })} />
                <CmsTextField
                  label="Highlighted words"
                  value={hero.titleHighlight}
                  onChange={(titleHighlight) => patchSection("hero", { titleHighlight })}
                />
              </div>
              <CmsTextField
                label="Description"
                multiline
                value={hero.description}
                onChange={(description) => patchSection("hero", { description })}
              />
              <CmsTextField label="Tagline" value={hero.tagline} onChange={(tagline) => patchSection("hero", { tagline })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <ImageField
                  label="Main hero image"
                  value={hero.heroImage}
                  onChange={(heroImage) => patchSection("hero", { heroImage })}
                  hint="Large photo on the right of the hero"
                />
                <ImageField
                  label="Inset / story image"
                  value={hero.storyImage}
                  onChange={(storyImage) => patchSection("hero", { storyImage })}
                  hint="Smaller overlay photo and Our Story image"
                />
              </div>
              <HeroServicesEditor
                items={hero.services || []}
                onChange={(services) => patchSection("hero", { services })}
              />
            </div>
          ) : null}

          {sectionId === "company" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <CmsTextField label="Legal / full name" value={company.name} onChange={(name) => patchSection("company", { name })} />
              <CmsTextField label="Short name" value={company.shortName} onChange={(shortName) => patchSection("company", { shortName })} />
              <CmsTextField label="Tagline" value={company.tagline} onChange={(tagline) => patchSection("company", { tagline })} />
              <CmsTextField label="Subtitle" value={company.subtitle} onChange={(subtitle) => patchSection("company", { subtitle })} />
              <CmsTextField label="Location" value={company.location} onChange={(location) => patchSection("company", { location })} />
              <CmsTextField label="Motto" value={company.motto} onChange={(motto) => patchSection("company", { motto })} />
            </div>
          ) : null}

          {sectionId === "story" ? (
            <div className="space-y-4">
              <CmsTextField label="Intro paragraph" multiline value={story.intro} onChange={(intro) => patchSection("story", { intro })} />
              <CmsTextField label="Story paragraph" multiline value={story.story} onChange={(next) => patchSection("story", { story: next })} />
              <CmsTextField label="Journey paragraph" multiline value={story.journey} onChange={(journey) => patchSection("story", { journey })} />
              <CmsTextField
                label="Commitment paragraph"
                multiline
                value={story.commitment}
                onChange={(commitment) => patchSection("story", { commitment })}
              />
            </div>
          ) : null}

          {sectionId === "mission" ? (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <CmsTextField label="Mission title" value={mission.title} onChange={(title) => patchSection("mission", { title })} />
                <CmsTextField label="Vision title" value={vision.title} onChange={(title) => patchSection("vision", { title })} />
              </div>
              <CmsTextField label="Mission text" multiline value={mission.text} onChange={(text) => patchSection("mission", { text })} />
              <CmsTextField label="Vision text" multiline value={vision.text} onChange={(text) => patchSection("vision", { text })} />
              <CmsTagField
                label="Values"
                items={cms.values || []}
                onChange={(values) => setCms((current) => ({ ...current, values }))}
                placeholder="Type a value and press Enter"
                hint="Shown as chips. Add custom values anytime."
                suggestions={ABOUT_CMS_DEFAULTS.values}
              />
            </div>
          ) : null}

          {sectionId === "tourServices" ? (
            <ServiceCardEditor
              emptyLabel="tour service"
              items={cms.tourServices || []}
              onChange={(tourServices) => setCms((current) => ({ ...current, tourServices }))}
            />
          ) : null}

          {sectionId === "supportServices" ? (
            <ServiceCardEditor
              withDetails
              emptyLabel="support service"
              items={cms.supportServices || []}
              onChange={(supportServices) => setCms((current) => ({ ...current, supportServices }))}
            />
          ) : null}

          {sectionId === "popularDestinations" ? (
            <CmsTagField
              label="Destinations"
              items={cms.popularDestinations || []}
              onChange={(popularDestinations) => setCms((current) => ({ ...current, popularDestinations }))}
              suggestions={ABOUT_CMS_DEFAULTS.popularDestinations}
              placeholder="Add a destination and press Enter"
              hint="Click a suggestion or type your own custom destination"
            />
          ) : null}

          {sectionId === "whyTravelWithUs" ? (
            <CmsTagField
              label="Reasons to travel with us"
              items={cms.whyTravelWithUs || []}
              onChange={(whyTravelWithUs) => setCms((current) => ({ ...current, whyTravelWithUs }))}
              suggestions={ABOUT_CMS_DEFAULTS.whyTravelWithUs}
              placeholder="Add a reason and press Enter"
              hint="Existing reasons are shown as chips and stay editable"
            />
          ) : null}

          {sectionId === "faqs" ? (
            <FaqEditor items={cms.faqs || []} onChange={(faqs) => setCms((current) => ({ ...current, faqs }))} />
          ) : null}

          {sectionId === "cta" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <CmsTextField label="Title" value={cta.title} onChange={(title) => patchSection("cta", { title })} />
              </div>
              <div className="sm:col-span-2">
                <CmsTextField label="Subtitle" multiline value={cta.subtitle} onChange={(subtitle) => patchSection("cta", { subtitle })} />
              </div>
              <CmsTextField
                label="Primary button label"
                value={cta.primaryLabel}
                onChange={(primaryLabel) => patchSection("cta", { primaryLabel })}
              />
              <CmsTextField
                label="Primary button path"
                value={cta.primaryTo}
                onChange={(primaryTo) => patchSection("cta", { primaryTo })}
                hint="e.g. /contact"
              />
              <CmsTextField
                label="Secondary button label"
                value={cta.secondaryLabel}
                onChange={(secondaryLabel) => patchSection("cta", { secondaryLabel })}
              />
              <CmsTextField
                label="Secondary button path"
                value={cta.secondaryTo}
                onChange={(secondaryTo) => patchSection("cta", { secondaryTo })}
                hint="e.g. /tours"
              />
            </div>
          ) : null}
        </div>

        {preview ? (
          <div className="xl:sticky xl:top-24 xl:self-start">
            <AboutCmsPreview content={cms} sectionId={sectionId} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
