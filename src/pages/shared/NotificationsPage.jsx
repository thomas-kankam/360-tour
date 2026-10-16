import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import Container from "../../components/layout/Container";
import AdminPagination from "../../components/admin/AdminPagination";
import { adminNotificationsServiceApi, clientNotificationsServiceApi } from "../../apis/NotificationsServiceApi";
import { useAuth } from "../../hooks/useAuth";
import { audienceToAuthRole } from "../../utils/authSessionHelpers";
import { formatNotificationTime, resolveNotificationLink } from "../../utils/notificationHelpers";

const PAGE_SIZE = 10;

const CLIENT_TYPE_FILTERS = [
  { id: "all", label: "All", types: "" },
  { id: "bookings", label: "Bookings", types: "booking_created,booking_updated,payment_success,payment_failed" },
  { id: "invoices", label: "Invoices", types: "invoice_sent" },
  { id: "reviews", label: "Reviews", types: "rating_approved,rating_rejected" },
];

const ADMIN_TYPE_FILTERS = [
  { id: "all", label: "All", types: "" },
  { id: "bookings", label: "Bookings", types: "booking_created,booking_updated,payment_success,payment_failed" },
  { id: "invoices", label: "Invoices", types: "invoice_sent,invoice_request,quote_request,invoice_request_response,quote_request_response" },
  { id: "reviews", label: "Reviews", types: "rating_pending,rating_approved,rating_rejected" },
  { id: "accounts", label: "Accounts", types: "client_registered" },
];

export default function NotificationsPage({ audience = "client" }) {
  const contextRole = audienceToAuthRole(audience);
  const { token } = useAuth({ context: contextRole });
  const navigate = useNavigate();
  const api = useMemo(
    () => (audience === "admin" ? adminNotificationsServiceApi : clientNotificationsServiceApi),
    [audience],
  );

  const typeFilters = audience === "admin" ? ADMIN_TYPE_FILTERS : CLIENT_TYPE_FILTERS;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [pagination, setPagination] = useState(null);

  const selectedTypes = typeFilters.find((filter) => filter.id === typeFilter)?.types ?? "";
  const paginationMeta = pagination ?? { page, totalPages: 1, totalItems: 0, rangeStart: 0, rangeEnd: 0 };

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    const result = await api.list(token, { page, perPage: PAGE_SIZE, type: selectedTypes });
    setLoading(false);

    if (!result.ok) {
      toast.error(result.reason || "Could not load notifications.");
      setItems([]);
      setPagination(null);
      return;
    }

    setItems(result.items ?? []);
    setPagination(result.pagination);
  }, [api, page, selectedTypes, token]);

  useEffect(() => {
    load();
  }, [load]);

  function changeType(nextType) {
    setTypeFilter(nextType);
    setPage(1);
  }

  async function openItem(item) {
    if (!token) return;
    if (!item.isRead) {
      await api.markRead(token, item.id);
      setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, isRead: true } : entry)));
    }

    const link = resolveNotificationLink(item.actionUrl, { audience });
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

        <div className="mt-6 flex flex-wrap gap-2">
          {typeFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => changeType(filter.id)}
              className={[
                "rounded-full px-4 py-1.5 text-sm font-semibold transition-all",
                typeFilter === filter.id
                  ? "bg-brand-primary text-white shadow-sm"
                  : "border border-brand-border/70 bg-white text-brand-muted hover:border-brand-primary/30 hover:text-brand-primary",
              ].join(" ")}
            >
              {filter.label}
            </button>
          ))}
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

            <AdminPagination
              className="mt-4"
              page={page}
              totalPages={paginationMeta.totalPages}
              totalItems={paginationMeta.totalItems}
              rangeStart={paginationMeta.rangeStart}
              rangeEnd={paginationMeta.rangeEnd}
              onPageChange={setPage}
            />
          </div>
        )}
      </Container>
    </section>
  );
}
