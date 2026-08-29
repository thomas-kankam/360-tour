import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import env from "../../config/env";
import { parseApiEnvelope, parseApiError } from "../../utils/apiResponse";
import { parsePaginatedList } from "../../utils/adminPaginationHelpers";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";

async function listRequests(token, page = 1) {
  try {
    const response = await axios.get(`${env.apiUrl}/admin/invoice-requests?page=${page}&per_page=20`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const result = parseApiEnvelope(response);
    if (!result.ok) return { items: [] };
    return parsePaginatedList(result.data);
  } catch (error) {
    parseApiError(error);
    return { items: [] };
  }
}

async function respondRequest(token, id, payload) {
  try {
    const response = await axios.patch(`${env.apiUrl}/admin/invoice-requests/${id}/respond`, payload, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return parseApiEnvelope(response);
  } catch (error) {
    return parseApiError(error);
  }
}

export default function AdminInvoiceRequestsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState("");
  const [responseById, setResponseById] = useState({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await listRequests(token);
      setItems(result.items ?? []);
      setLoading(false);
    }
    if (token) load();
  }, [token]);

  async function handleRespond(id) {
    const responseText = (responseById[id] || "").trim();
    if (!responseText) {
      toast.error("Write a response for the client.");
      return;
    }
    setRespondingId(id);
    const result = await respondRequest(token, id, { admin_response: responseText });
    setRespondingId("");
    if (!result.ok) {
      toast.error(result.reason || "Could not send response.");
      return;
    }
    toast.success("Response sent to client.");
    setResponseById((current) => ({ ...current, [id]: "" }));
    const refreshed = await listRequests(token);
    setItems(refreshed.items ?? []);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-primary">Billing</p>
        <h1 className="mt-1 text-2xl font-bold text-brand-ink">Invoice & quote requests</h1>
        <p className="mt-2 text-sm text-brand-muted">Client requests appear here and in your notifications.</p>
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
                  <p className="mt-1 text-sm text-brand-muted">{item.client_name} · {item.client_email}</p>
                </div>
                <span className="rounded-full bg-brand-cream px-2.5 py-0.5 text-[10px] font-bold uppercase text-brand-muted">
                  {item.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-brand-ink">{item.message}</p>
              {item.admin_response ? (
                <p className="mt-3 rounded-xl bg-brand-cream px-4 py-3 text-sm text-brand-muted">{item.admin_response}</p>
              ) : (
                <div className="mt-4 space-y-3">
                  <textarea
                    rows={3}
                    value={responseById[item.id] || ""}
                    onChange={(e) => setResponseById((current) => ({ ...current, [item.id]: e.target.value }))}
                    placeholder="Reply to the client…"
                    className="w-full rounded-xl border border-brand-border/70 px-4 py-3 text-sm outline-none focus:border-brand-primary/50"
                  />
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
        </div>
      )}
    </div>
  );
}
