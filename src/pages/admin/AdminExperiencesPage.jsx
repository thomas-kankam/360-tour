import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import adminContentServiceApi from "../../apis/AdminContentServiceApi";
import { CmsStatusBadge } from "../../components/admin/CmsFormFields";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";

export default function AdminExperiencesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    if (!token) return;
    setLoading(true);
    const params = {};
    if (status !== "all") params.status = status;
    const result = await adminContentServiceApi.listExperiences(token, params);
    setLoading(false);
    if (!result.ok) {
      toast.error(result.reason || "Could not load experiences.");
      return;
    }
    setItems(result.items);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, status]);

  async function togglePublish(item) {
    setBusyId(item.id);
    const result =
      item.status === "published"
        ? await adminContentServiceApi.unpublishExperience(token, item.id)
        : await adminContentServiceApi.publishExperience(token, item.id);
    setBusyId(null);
    if (!result.ok) {
      toast.error(result.reason || "Could not update status.");
      return;
    }
    toast.success(item.status === "published" ? "Saved as draft." : "Experience published.");
    load();
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setBusyId(pendingDelete.id);
    const result = await adminContentServiceApi.deleteExperience(token, pendingDelete.id);
    setBusyId(null);
    setPendingDelete(null);
    if (!result.ok) {
      toast.error(result.reason || "Could not delete experience.");
      return;
    }
    toast.success("Experience deleted.");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">Content CMS</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-brand-ink">Experiences</h1>
          <p className="mt-1 text-sm text-brand-muted">Manage the experience cards shown on /experiences.</p>
        </div>
        <Link to={ROUTES.admin.experienceNew} className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" aria-hidden />
          New experience
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-border/60 bg-white p-4 shadow-sm">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-brand-border/70 px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-brand-border/60 bg-white px-4 py-8 text-sm text-brand-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading experiences…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-border bg-white px-6 py-12 text-center">
          <p className="font-semibold text-brand-ink">No experiences yet</p>
          <p className="mt-1 text-sm text-brand-muted">Create experience cards for the public Experiences page.</p>
          <Link to={ROUTES.admin.experienceNew} className="btn-primary mt-4 inline-flex">
            Create experience
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-brand-border/60 bg-white shadow-sm">
              <div className="aspect-[16/9] bg-brand-cream">
                {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-brand-ink">{item.label}</p>
                    <p className="text-xs text-brand-muted">{item.tagline}</p>
                  </div>
                  <CmsStatusBadge status={item.status} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to={ROUTES.admin.experienceEdit(item.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-brand-border/70 px-2.5 py-1.5 text-xs font-semibold hover:bg-brand-cream"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                  </Link>
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => togglePublish(item)}
                    className="rounded-lg border border-brand-primary/30 px-2.5 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary/5"
                  >
                    {item.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(item)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <AdminConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete experience?"
        message={pendingDelete ? `“${pendingDelete.label}” will be permanently removed.` : ""}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
