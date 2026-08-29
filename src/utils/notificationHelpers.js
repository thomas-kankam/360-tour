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

function normalizeNotificationPath(pathname) {
  if (!pathname) return pathname;

  let normalized = pathname;

  // Fix links built when ADMIN_URL pointed at /admin/login.
  normalized = normalized.replace(/^\/admin\/login\/admin\//, "/admin/");
  normalized = normalized.replace(/^\/admin\/login(?=\/|$)/, "/admin");

  return normalized;
}

export function resolveNotificationLink(actionUrl, { audience = "client" } = {}) {
  if (!actionUrl) return null;

  try {
    const url = new URL(actionUrl, window.location.origin);
    let pathname = normalizeNotificationPath(`${url.pathname}${url.search}${url.hash}`);

    if (audience === "admin") {
      if (pathname === "/" || pathname === "") {
        return "/admin";
      }

      if (
        !pathname.startsWith("/admin")
        && !pathname.startsWith("/operator")
        && ["/my-bookings", "/my-payments", "/my-invoices", "/my-reviews", "/notifications", "/dashboard", "/profile"].some(
          (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
        )
      ) {
        return "/admin";
      }
    }

    if (url.origin === window.location.origin) {
      return pathname;
    }

    return actionUrl;
  } catch {
    const path = actionUrl.startsWith("/") ? normalizeNotificationPath(actionUrl) : null;
    if (path && audience === "admin" && (path === "/" || path === "")) {
      return "/admin";
    }
    return path;
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
