import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Container from "../../components/layout/Container";
import { adminNotificationsServiceApi, clientNotificationsServiceApi } from "../../apis/NotificationsServiceApi";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { formatNotificationTime, resolveNotificationLink } from "../../utils/notificationHelpers";

export default function NotificationsPage({ audience = "client" }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const api = useMemo(
    () => (audience === "admin" ? adminNotificationsServiceApi : clientNotificationsServiceApi),
    [audience],
  );

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(
    async (nextPage = 1, append = false) => {
      if (!token) return;
      if (append) setLoadingMore(true);
      else setLoading(true);

      const result = await api.list(token, { page: nextPage, perPage: 20 });
      if (append) setLoadingMore(false);
      else setLoading(false);

      if (!result.ok) {
        toast.error(result.reason || "Could not load notifications.");
        return;
      }

      const nextItems = result.items ?? [];
      setItems((prev) => (append ? [...prev, ...nextItems.filter((item) => !prev.some((p) => p.id === item.id))] : nextItems));
      const totalPages = result.pagination?.totalPages ?? 1;
      setPage(nextPage);
      setHasMore(nextPage < totalPages);
    },
    [api, token],
  );

  useEffect(() => {
    load(1, false);
  }, [load]);

  async function openItem(item) {
    if (!token) return;
    if (!item.isRead) {
      await api.markRead(token, item.id);
      setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, isRead: true } : entry)));
    }

    const link = resolveNotificationLink(item.actionUrl);
    if (link?.startsWith("http")) {
      window.location.href = link;
      return;
    }
    if (link) navigate(link);
  }

  async function markAllRead() {
    if (!token) return;
    const result = await api.markAllRead(token);
    if (!result.ok) {
      toast.error(result.reason || "Could not mark notifications as read.");
      return;
    }
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    toast.success("All notifications marked as read.");
  }

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">Updates</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-brand-primary">Notifications</h1>
            <p className="mt-2 text-sm text-brand-muted">Bookings, invoices, reviews, and account activity.</p>
          </div>
          {items.some((item) => !item.isRead) ? (
            <button type="button" onClick={markAllRead} className="btn-secondary px-4 py-2 text-sm">
              Mark all read
            </button>
          ) : null}
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-brand-muted">
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-brand-border/70 bg-white px-6 py-16 text-center text-sm text-brand-muted">
            No notifications yet.
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openItem(item)}
                className={[
                  "w-full rounded-2xl border px-5 py-4 text-left transition-colors hover:border-brand-primary/30",
                  item.isRead ? "border-brand-border/60 bg-white" : "border-brand-primary/20 bg-brand-primary/[0.04]",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-brand-ink">{item.title}</p>
                    {item.body ? <p className="mt-1 text-sm text-brand-muted">{item.body}</p> : null}
                  </div>
                  {!item.isRead ? <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-red" aria-hidden /> : null}
                </div>
                <p className="mt-2 text-xs text-brand-muted">{formatNotificationTime(item.createdAt)}</p>
              </button>
            ))}

            {hasMore ? (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => load(page + 1, true)}
                  className="btn-secondary px-5 py-2 text-sm disabled:opacity-60"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </Container>
    </section>
  );
}
