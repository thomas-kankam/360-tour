import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import adminContentServiceApi from "../../apis/AdminContentServiceApi";
import {
  CmsImageField,
  CmsSelectField,
  CmsTagField,
  CmsTextField,
} from "../../components/admin/CmsFormFields";
import ExperienceCmsPreview from "../../components/admin/ExperienceCmsPreview";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { GUEST_ICON_MAP, GuestIcon } from "../../utils/guestIcons";
import {
  EXPERIENCE_REGION_SUGGESTIONS,
  STORY_CATEGORY_OPTIONS,
  slugifyCmsValue,
} from "../../utils/cmsContentHelpers";

const emptyExperience = {
  key: "",
  slug: "",
  label: "",
  iconKey: "compass",
  tagline: "",
  description: "",
  highlights: [],
  regions: [],
  keywords: [],
  image: "",
  badgeText: "",
  storyCategory: "Heritage",
  relatedStorySlugs: [],
  status: "draft",
};

const ICON_OPTIONS = Object.keys(GUEST_ICON_MAP).map((id) => ({ id, label: id }));

export default function AdminExperienceFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyExperience);
  const [slugLocked, setSlugLocked] = useState(false);
  const [keyLocked, setKeyLocked] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit || !token) return undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await adminContentServiceApi.getExperience(token, id);
      if (cancelled) return;
      setLoading(false);
      if (!result.ok || !result.experience) {
        toast.error(result.reason || "Experience not found.");
        navigate(ROUTES.admin.experiences, { replace: true });
        return;
      }
      const item = result.experience;
      setForm({
        ...emptyExperience,
        ...item,
        highlights: item.highlights || [],
        regions: item.regions || [],
        keywords: item.keywords || [],
        relatedStorySlugs: item.relatedStorySlugs || [],
      });
      setSlugLocked(Boolean(item.slug));
      setKeyLocked(Boolean(item.key));
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, token, navigate]);

  function patch(fields) {
    setForm((prev) => ({ ...prev, ...fields }));
  }

  function handleLabelChange(label) {
    const next = { label };
    const slug = slugifyCmsValue(label);
    if (!slugLocked) next.slug = slug;
    if (!keyLocked) next.key = slug;
    patch(next);
  }

  async function handleSave(nextStatus) {
    if (!form.label.trim()) {
      toast.error("Label is required.");
      return;
    }
    setSaving(true);
    const payload = {
      key: form.key || slugifyCmsValue(form.label),
      slug: form.slug || slugifyCmsValue(form.label),
      label: form.label,
      iconKey: form.iconKey,
      tagline: form.tagline,
      description: form.description,
      highlights: form.highlights,
      regions: form.regions,
      keywords: form.keywords,
      image: form.image,
      badgeText: form.badgeText,
      tourQuery: {},
      storyCategory: form.storyCategory,
      relatedStorySlugs: form.relatedStorySlugs,
      status: nextStatus || form.status || "draft",
    };

    const result = await adminContentServiceApi.saveExperience(token, payload, isEdit ? id : null);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.reason || "Could not save experience.");
      return;
    }
    toast.success(nextStatus === "published" ? "Experience published." : "Draft saved.");
    navigate(ROUTES.admin.experienceEdit(result.experience.id), { replace: true });
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-brand-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading experience…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to={ROUTES.admin.experiences}
            className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to experiences
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-brand-ink">
            {isEdit ? "Edit experience" : "New experience"}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={saving} onClick={() => handleSave("draft")} className="btn-secondary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null} Save draft
          </button>
          <button type="button" disabled={saving} onClick={() => handleSave("published")} className="btn-primary">
            Publish
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.95fr)]">
        <div className="space-y-4 rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm">
          <CmsTextField label="Label" value={form.label} onChange={handleLabelChange} required placeholder="Heritage & History" />
          <div className="grid gap-4 sm:grid-cols-2">
            <CmsTextField
              label="Key"
              value={form.key}
              onChange={(key) => {
                setKeyLocked(true);
                patch({ key: slugifyCmsValue(key) || key });
              }}
              hint="Auto-filled from label. Edit only if you need a stable id."
            />
            <CmsTextField
              label="Slug"
              value={form.slug}
              onChange={(slug) => {
                setSlugLocked(true);
                patch({ slug: slugifyCmsValue(slug) || slug });
              }}
              hint="Auto-filled from label for URLs / anchors."
            />
          </div>
          <CmsTextField label="Tagline" value={form.tagline} onChange={(tagline) => patch({ tagline })} placeholder="Short supporting line" />
          <CmsTextField
            label="Description"
            value={form.description}
            onChange={(description) => patch({ description })}
            multiline
            placeholder="What guests experience on this trip style…"
          />

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Icon</span>
            <div className="mt-1.5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                <GuestIcon name={form.iconKey} className="h-5 w-5" />
              </div>
              <select
                className="w-full rounded-xl border border-brand-border/70 px-3 py-2 text-sm"
                value={form.iconKey}
                onChange={(e) => patch({ iconKey: e.target.value })}
              >
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon.id} value={icon.id}>
                    {icon.label}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <CmsTextField label="Badge text" value={form.badgeText} onChange={(badgeText) => patch({ badgeText })} placeholder="Most searched" />
          <CmsSelectField
            label="Story category link"
            value={form.storyCategory}
            onChange={(storyCategory) => patch({ storyCategory })}
            options={STORY_CATEGORY_OPTIONS}
            hint="Used to pull related stories by category"
          />
          <CmsImageField label="Image" value={form.image} onChange={(image) => patch({ image })} />

          <CmsTagField
            label="Highlights"
            items={form.highlights}
            onChange={(highlights) => patch({ highlights })}
            placeholder="e.g. Cape Coast Castle"
            hint="Press Enter or Add after each highlight"
          />
          <CmsTagField
            label="Regions"
            items={form.regions}
            onChange={(regions) => patch({ regions })}
            suggestions={EXPERIENCE_REGION_SUGGESTIONS}
            placeholder="e.g. Central Region"
            hint="Click a suggestion or type your own"
          />
          <CmsTagField
            label="Keywords"
            items={form.keywords}
            onChange={(keywords) => patch({ keywords })}
            placeholder="e.g. Ghana heritage tour"
            hint="SEO / search keywords — one at a time"
          />
          <CmsTagField
            label="Related story slugs"
            items={form.relatedStorySlugs}
            onChange={(relatedStorySlugs) => patch({ relatedStorySlugs })}
            placeholder="e.g. cape-coast-castle-reflection"
            hint="Optional story slugs to feature under this experience"
          />
        </div>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <ExperienceCmsPreview
            label={form.label}
            tagline={form.tagline}
            description={form.description}
            image={form.image}
            badgeText={form.badgeText}
            iconKey={form.iconKey}
            highlights={form.highlights}
            regions={form.regions}
          />
        </div>
      </div>
    </div>
  );
}
