import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Bell } from "lucide-react";
import { adminNotificationsServiceApi, clientNotificationsServiceApi } from "../../apis/NotificationsServiceApi";
import { ROUTES } from "../../constants/routes";
import { audienceToAuthRole } from "../../utils/authSessionHelpers";
import { useAuth } from "../../hooks/useAuth";
import { formatNotificationTime, resolveNotificationLink } from "../../utils/notificationHelpers";

const POLL_MS = 60000;

export default function NotificationBell({ audience = "client", compact = false }) {
  const contextRole = audienceToAuthRole(audience);
  const { token, isAuthenticated } = useAuth({ context: contextRole });
  const navigate = useNavigate();
  const api = useMemo(
    () => (audience === "admin" ? adminNotificationsServiceApi : clientNotificationsServiceApi),
    [audience],
  );
  const listPath = audience === "admin" ? ROUTES.admin.notifications : ROUTES.notifications;

  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setCount(0);
      setItems([]);
      return;
    }

    const [countResult, listResult] = await Promise.all([
      api.unreadCount(token),
      api.list(token, { page: 1, perPage: 6 }),
    ]);

    if (countResult.ok) setCount(countResult.count ?? 0);
    if (listResult.ok) setItems(listResult.items ?? []);
  }, [api, token, isAuthenticated]);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, POLL_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (!open || !token) return undefined;
    let cancelled = false;

    async function loadPreview() {
      setLoading(true);
      const result = await api.list(token, { page: 1, perPage: 6 });
      if (!cancelled) {
        setLoading(false);
        if (result.ok) setItems(result.items ?? []);
      }
    }

    loadPreview();
    return () => {
      cancelled = true;
    };
  }, [open, api, token]);

  async function handleOpenItem(item) {
    if (!token) return;
    if (!item.isRead) {
      await api.markRead(token, item.id);
      setCount((current) => Math.max(0, current - 1));
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? { ...entry, isRead: true } : entry)),
      );
    }

    setOpen(false);
    const link = resolveNotificationLink(item.actionUrl);
    if (link?.startsWith("http")) {
      window.location.href = link;
      return;
    }
    if (link) {
      navigate(link);
      return;
    }
    navigate(listPath);
  }

  async function handleMarkAllRead() {
    if (!token) return;
    const result = await api.markAllRead(token);
    if (result.ok) {
      setCount(0);
      setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    }
  }

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={[
          "relative flex items-center justify-center rounded-xl border border-brand-border/60 text-brand-primary transition-colors hover:bg-brand-cream",
          compact ? "h-9 w-9" : "h-10 w-10",
        ].join(" ")}
        aria-label={`Notifications${count ? `, ${count} unread` : ""}`}
      >
        <Bell className={["h-5 w-5", count > 0 ? "animate-pulse" : ""].join(" ")} strokeWidth={1.75} aria-hidden />
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close notifications" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-brand-border/70 bg-white shadow-[0_20px_50px_-20px_rgba(17,17,17,0.35)]">
            <div className="flex items-center justify-between border-b border-brand-border/60 px-4 py-3">
              <p className="text-sm font-bold text-brand-ink">Notifications</p>
              {count > 0 ? (
                <button type="button" onClick={handleMarkAllRead} className="text-xs font-semibold text-brand-primary hover:underline">
                  Mark all read
                </button>
              ) : null}
            </div>

            <div className="max-h-80 overflow-auto">
              {loading ? (
                <p className="px-4 py-6 text-center text-sm text-brand-muted">Loading…</p>
              ) : items.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-brand-muted">No notifications yet.</p>
              ) : (
                items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleOpenItem(item)}
                    className={[
                      "block w-full border-b border-brand-border/40 px-4 py-3 text-left transition-colors hover:bg-brand-cream/70",
                      item.isRead ? "bg-white" : "bg-brand-primary/[0.04]",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-2">
                      {!item.isRead ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-red" aria-hidden /> : null}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-brand-ink">{item.title}</p>
                        {item.body ? <p className="mt-0.5 line-clamp-2 text-xs text-brand-muted">{item.body}</p> : null}
                        <p className="mt-1 text-[10px] text-brand-muted">{formatNotificationTime(item.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="border-t border-brand-border/60 px-4 py-3">
              <Link to={listPath} onClick={() => setOpen(false)} className="text-sm font-semibold text-brand-primary hover:underline">
                View all notifications
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
