export function mapNotification(raw) {
  if (!raw) return null;

  return {
    id: raw.id ?? raw.notification_uuid,
    type: raw.type,
    title: raw.title,
    body: raw.body ?? "",
    actionUrl: raw.action_url ?? raw.actionUrl ?? "",
    meta: raw.meta ?? {},
    readAt: raw.read_at ?? raw.readAt ?? null,
    isRead: Boolean(raw.is_read ?? raw.readAt ?? raw.read_at),
    createdAt: raw.created_at ?? raw.createdAt ?? null,
  };
}

export function resolveNotificationLink(actionUrl) {
  if (!actionUrl) return null;

  try {
    const url = new URL(actionUrl, window.location.origin);
    if (url.origin === window.location.origin) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
    return actionUrl;
  } catch {
    return actionUrl.startsWith("/") ? actionUrl : null;
  }
}

export function formatNotificationTime(iso) {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
  } catch {
    return "";
  }
}
