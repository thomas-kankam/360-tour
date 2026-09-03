import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import adminContentServiceApi from "../../apis/AdminContentServiceApi";
import { CmsStatusBadge } from "../../components/admin/CmsFormFields";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";

export default function AdminStoriesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    if (!token) return;
    setLoading(true);
    const params = {};
    if (status !== "all") params.status = status;
    if (search.trim()) params.search = search.trim();
    const result = await adminContentServiceApi.listStories(token, params);
    setLoading(false);
    if (!result.ok) {
      toast.error(result.reason || "Could not load stories.");
      return;
    }
    setItems(result.items);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, status]);

  const filtered = useMemo(() => items, [items]);

  async function togglePublish(story) {
    setBusyId(story.id);
    const result =
      story.status === "published"
        ? await adminContentServiceApi.unpublishStory(token, story.id)
        : await adminContentServiceApi.publishStory(token, story.id);
    setBusyId(null);
    if (!result.ok) {
      toast.error(result.reason || "Could not update status.");
      return;
    }
    toast.success(story.status === "published" ? "Saved as draft." : "Story published.");
    load();
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setBusyId(pendingDelete.id);
    const result = await adminContentServiceApi.deleteStory(token, pendingDelete.id);
    setBusyId(null);
    setPendingDelete(null);
    if (!result.ok) {
      toast.error(result.reason || "Could not delete story.");
      return;
    }
    toast.success("Story deleted.");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">Content CMS</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-brand-ink">Stories</h1>
          <p className="mt-1 text-sm text-brand-muted">Create, draft, publish, and delete travel stories for the public site.</p>
        </div>
        <Link to={ROUTES.admin.storyNew} className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" aria-hidden />
          New story
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
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search title or category…"
          className="min-w-[200px] flex-1 rounded-xl border border-brand-border/70 px-3 py-2 text-sm"
        />
        <button type="button" onClick={load} className="btn-secondary">
          Search
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-brand-border/60 bg-white px-4 py-8 text-sm text-brand-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading stories…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-border bg-white px-6 py-12 text-center">
          <p className="font-semibold text-brand-ink">No stories yet</p>
          <p className="mt-1 text-sm text-brand-muted">Create your first story to show on /stories.</p>
          <Link to={ROUTES.admin.storyNew} className="btn-primary mt-4 inline-flex">
            Create story
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand-border/60 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-cream/60 text-[11px] uppercase tracking-wide text-brand-muted">
              <tr>
                <th className="px-4 py-3 font-bold">Story</th>
                <th className="px-4 py-3 font-bold">Category</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((story) => (
                <tr key={story.id} className="border-t border-brand-border/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {story.image ? (
                        <img src={story.image} alt="" className="h-12 w-16 rounded-lg object-cover" />
                      ) : (
                        <div className="h-12 w-16 rounded-lg bg-brand-cream" />
                      )}
                      <div>
                        <p className="font-semibold text-brand-ink">{story.title}</p>
                        <p className="text-xs text-brand-muted">/{story.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-brand-muted">{story.category || "—"}</td>
                  <td className="px-4 py-3">
                    <CmsStatusBadge status={story.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={ROUTES.admin.storyEdit(story.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-brand-border/70 px-2.5 py-1.5 text-xs font-semibold hover:bg-brand-cream"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                      </Link>
                      <button
                        type="button"
                        disabled={busyId === story.id}
                        onClick={() => togglePublish(story)}
                        className="rounded-lg border border-brand-primary/30 px-2.5 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary/5"
                      >
                        {story.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(story)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete story?"
        message={pendingDelete ? `“${pendingDelete.title}” will be permanently removed.` : ""}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
