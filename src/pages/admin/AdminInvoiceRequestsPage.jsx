import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { FileUp, Loader2, Paperclip } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import AdminPagination from "../../components/admin/AdminPagination";
import env from "../../config/env";
import { parseApiEnvelope, parseApiError } from "../../utils/apiResponse";
import { parsePaginatedList, mapServerPagination } from "../../utils/adminPaginationHelpers";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";

async function listRequests(token, { page = 1, type = "", status = "" } = {}) {
  try {
    const query = new URLSearchParams({ page: String(page), per_page: "10" });
    if (type) query.set("type", type);
    if (status) query.set("status", status);
    const response = await axios.get(`${env.apiUrl}/admin/invoice-requests?${query}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const result = parseApiEnvelope(response);
    if (!result.ok) return { items: [], pagination: null };
    const parsed = parsePaginatedList(result.data);
    return {
      items: parsed.items,
      pagination: mapServerPagination(parsed.pagination, { page, pageSize: 10 }),
    };
  } catch (error) {
    parseApiError(error);
    return { items: [], pagination: null };
  }
}

async function respondRequest(token, id, { admin_response, attachment }) {
  try {
    const form = new FormData();
    form.append("admin_response", admin_response);
    if (attachment) form.append("attachment", attachment);

    const response = await axios.post(`${env.apiUrl}/admin/invoice-requests/${id}/respond`, form, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    return parseApiEnvelope(response);
  } catch (error) {
    return parseApiError(error);
  }
}

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  responded: "bg-emerald-100 text-emerald-800",
  closed: "bg-brand-cream text-brand-muted",
};

export default function AdminInvoiceRequestsPage() {
  const { token } = useAuth();
  const fileRefs = useRef({});
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState("");
  const [responseById, setResponseById] = useState({});
  const [fileById, setFileById] = useState({});

  async function refresh(nextPage = page) {
    setLoading(true);
    const result = await listRequests(token, { page: nextPage, type: typeFilter, status: statusFilter });
    setItems(result.items ?? []);
    setPagination(result.pagination);
    setLoading(false);
  }

  useEffect(() => {
    if (token) refresh(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, typeFilter, statusFilter]);

  async function handleRespond(id) {
    const responseText = (responseById[id] || "").trim();
    if (!responseText) {
      toast.error("Write a response for the client.");
      return;
    }
    setRespondingId(id);
    const result = await respondRequest(token, id, {
      admin_response: responseText,
      attachment: fileById[id] || null,
    });
    setRespondingId("");
    if (!result.ok) {
      toast.error(result.reason || "Could not send response.");
      return;
    }
    toast.success("Response sent to client by email and notification.");
    setResponseById((current) => ({ ...current, [id]: "" }));
    setFileById((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    await refresh(page);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-primary">Billing</p>
          <h1 className="mt-1 text-2xl font-bold text-brand-ink">Invoice & quote requests</h1>
          <p className="mt-2 text-sm text-brand-muted">
            Reply with a message and optionally attach a quote PDF. Clients see status, email, and can download the file.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "", label: "All types" },
            { id: "quote", label: "Quotes" },
            { id: "invoice", label: "Invoices" },
          ].map((filter) => (
            <button
              key={filter.id || "all"}
              type="button"
              onClick={() => {
                setTypeFilter(filter.id);
                setPage(1);
              }}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-bold",
                typeFilter === filter.id ? "bg-brand-primary text-white" : "border border-brand-border bg-white text-brand-muted",
              ].join(" ")}
            >
              {filter.label}
            </button>
          ))}
          {[
            { id: "", label: "All status" },
            { id: "pending", label: "Pending" },
            { id: "responded", label: "Responded" },
          ].map((filter) => (
            <button
              key={`status-${filter.id || "all"}`}
              type="button"
              onClick={() => {
                setStatusFilter(filter.id);
                setPage(1);
              }}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-bold",
                statusFilter === filter.id ? "bg-brand-primary text-white" : "border border-brand-border bg-white text-brand-muted",
              ].join(" ")}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-brand-muted">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-border/70 bg-white px-6 py-12 text-center text-sm text-brand-muted">
          No requests yet.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold capitalize text-brand-ink">{item.type} request</p>
                  <p className="mt-1 text-sm text-brand-muted">
                    {item.client_name || "Client"} · {item.client_email || "—"}
                  </p>
                </div>
                <span
                  className={[
                    "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                    STATUS_STYLES[item.status] || STATUS_STYLES.pending,
                  ].join(" ")}
                >
                  {item.status}
                </span>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm text-brand-ink">{item.message}</p>

              {item.admin_response ? (
                <div className="mt-3 space-y-2 rounded-xl bg-brand-cream px-4 py-3">
                  <p className="text-sm text-brand-muted">{item.admin_response}</p>
                  {item.attachment_url ? (
                    <a
                      href={item.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline"
                    >
                      <Paperclip className="h-3.5 w-3.5" aria-hidden />
                      {item.attachment_name || "Attached file"}
                    </a>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <textarea
                    rows={3}
                    value={responseById[item.id] || ""}
                    onChange={(e) => setResponseById((current) => ({ ...current, [item.id]: e.target.value }))}
                    placeholder="Reply to the client…"
                    className="w-full rounded-xl border border-brand-border/70 px-4 py-3 text-sm outline-none focus:border-brand-primary/50"
                  />

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={(el) => {
                        fileRefs.current[item.id] = el;
                      }}
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setFileById((current) => ({ ...current, [item.id]: file }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileRefs.current[item.id]?.click()}
                      className="inline-flex items-center gap-2 rounded-xl border border-brand-border/70 px-3 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-cream"
                    >
                      <FileUp className="h-3.5 w-3.5" aria-hidden />
                      {fileById[item.id] ? fileById[item.id].name : "Attach quote file"}
                    </button>
                    {fileById[item.id] ? (
                      <button
                        type="button"
                        onClick={() => {
                          setFileById((current) => {
                            const next = { ...current };
                            delete next[item.id];
                            return next;
                          });
                          if (fileRefs.current[item.id]) fileRefs.current[item.id].value = "";
                        }}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remove file
                      </button>
                    ) : (
                      <p className="text-[11px] text-brand-muted">PDF or image · optional · client can download after you respond</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={respondingId === item.id}
                      onClick={() => handleRespond(item.id)}
                      className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
                    >
                      {respondingId === item.id ? "Sending…" : "Send response"}
                    </button>
                    <Link to={ROUTES.admin.invoices} className="btn-secondary px-4 py-2 text-sm">
                      Create invoice
                    </Link>
                  </div>
                </div>
              )}
            </article>
          ))}

          {pagination?.totalPages > 1 ? (
            <AdminPagination
              page={pagination.page || page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              rangeStart={pagination.rangeStart}
              rangeEnd={pagination.rangeEnd}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
