import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import adminContentServiceApi from "../../apis/AdminContentServiceApi";
import { CmsImageField, CmsSelectField, CmsTextField } from "../../components/admin/CmsFormFields";
import StoryCmsPreview from "../../components/admin/StoryCmsPreview";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { STORY_CATEGORY_OPTIONS, slugifyCmsValue } from "../../utils/cmsContentHelpers";

const emptyStory = {
  title: "",
  slug: "",
  excerpt: "",
  category: "Heritage",
  country: "Ghana",
  author: "360 Tours",
  authorRole: "Editorial Team",
  date: "",
  readTime: "5 min read",
  image: "",
  body: [{ type: "paragraph", text: "" }],
  status: "draft",
};

const BLOCK_TYPES = [
  { id: "lead", label: "Lead" },
  { id: "heading", label: "Heading" },
  { id: "paragraph", label: "Paragraph" },
  { id: "quote", label: "Quote" },
  { id: "list", label: "List" },
];

export default function AdminStoryFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyStory);
  const [slugLocked, setSlugLocked] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit || !token) return undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await adminContentServiceApi.getStory(token, id);
      if (cancelled) return;
      setLoading(false);
      if (!result.ok || !result.story) {
        toast.error(result.reason || "Story not found.");
        navigate(ROUTES.admin.stories, { replace: true });
        return;
      }
      setForm({
        ...emptyStory,
        ...result.story,
        body: result.story.body?.length ? result.story.body : [{ type: "paragraph", text: "" }],
      });
      setSlugLocked(Boolean(result.story.slug));
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, token, navigate]);

  function patch(fields) {
    setForm((prev) => ({ ...prev, ...fields }));
  }

  function handleTitleChange(title) {
    const next = { title };
    if (!slugLocked) next.slug = slugifyCmsValue(title);
    patch(next);
  }

  function updateBlock(index, fields) {
    const body = [...form.body];
    body[index] = { ...body[index], ...fields };
    patch({ body });
  }

  async function handleSave(nextStatus) {
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title,
      slug: form.slug || slugifyCmsValue(form.title),
      excerpt: form.excerpt,
      category: form.category,
      country: form.country,
      author: form.author,
      authorRole: form.authorRole,
      date: form.date,
      readTime: form.readTime,
      image: form.image,
      body: form.body,
      status: nextStatus || form.status || "draft",
    };
    const result = await adminContentServiceApi.saveStory(token, payload, isEdit ? id : null);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.reason || "Could not save story.");
      return;
    }
    toast.success(nextStatus === "published" ? "Story published." : "Draft saved.");
    navigate(ROUTES.admin.storyEdit(result.story.id), { replace: true });
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-brand-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading story…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to={ROUTES.admin.stories} className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-ink">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to stories
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-bold text-brand-ink">{isEdit ? "Edit story" : "New story"}</h1>
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
        <div className="space-y-4 rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm">
          <CmsTextField label="Title" value={form.title} onChange={handleTitleChange} required />
          <CmsTextField
            label="Slug"
            value={form.slug}
            onChange={(slug) => {
              setSlugLocked(true);
              patch({ slug: slugifyCmsValue(slug) || slug });
            }}
            hint="Auto-filled from title. Edit only if you need a custom URL."
          />
          <CmsTextField label="Excerpt" value={form.excerpt} onChange={(excerpt) => patch({ excerpt })} multiline />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Body blocks</p>
              <button
                type="button"
                onClick={() => patch({ body: [...form.body, { type: "paragraph", text: "" }] })}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden /> Add block
              </button>
            </div>
            <div className="space-y-3">
              {form.body.map((block, index) => (
                <div key={index} className="rounded-xl border border-brand-border/50 bg-brand-cream/30 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <select
                      value={block.type}
                      onChange={(e) => updateBlock(index, { type: e.target.value })}
                      className="rounded-lg border border-brand-border/70 px-2 py-1 text-xs"
                    >
                      {BLOCK_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => patch({ body: form.body.filter((_, i) => i !== index) })}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      <Trash2 className="inline h-3.5 w-3.5" aria-hidden /> Remove
                    </button>
                  </div>
                  {block.type === "list" ? (
                    <textarea
                      rows={4}
                      className="w-full rounded-xl border border-brand-border/70 px-3 py-2 text-sm"
                      value={(block.items || []).join("\n")}
                      onChange={(e) =>
                        updateBlock(index, {
                          items: e.target.value.split("\n").map((line) => line.trim()).filter(Boolean),
                          text: undefined,
                        })
                      }
                      placeholder="One list item per line"
                    />
                  ) : (
                    <textarea
                      rows={block.type === "heading" ? 2 : 4}
                      className="w-full rounded-xl border border-brand-border/70 px-3 py-2 text-sm"
                      value={block.text || ""}
                      onChange={(e) => updateBlock(index, { text: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <CmsImageField label="Cover image" value={form.image} onChange={(image) => patch({ image })} />
            <div className="space-y-4">
              <CmsSelectField
                label="Category"
                value={form.category}
                onChange={(category) => patch({ category })}
                options={STORY_CATEGORY_OPTIONS}
              />
              <CmsTextField label="Country" value={form.country} onChange={(country) => patch({ country })} />
              <CmsTextField label="Author" value={form.author} onChange={(author) => patch({ author })} />
              <CmsTextField label="Author role" value={form.authorRole} onChange={(authorRole) => patch({ authorRole })} />
              <CmsTextField label="Display date" value={form.date} onChange={(date) => patch({ date })} placeholder="March 18, 2025" />
              <CmsTextField label="Read time" value={form.readTime} onChange={(readTime) => patch({ readTime })} />
            </div>
          </div>
        </div>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <StoryCmsPreview
            title={form.title}
            excerpt={form.excerpt}
            category={form.category}
            country={form.country}
            author={form.author}
            authorRole={form.authorRole}
            date={form.date}
            readTime={form.readTime}
            image={form.image}
            body={form.body}
          />
        </div>
      </div>
    </div>
  );
}
