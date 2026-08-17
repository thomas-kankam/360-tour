import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Eye, Loader2, MessageSquare, Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import adminContactsServiceApi from "../../apis/AdminContactsServiceApi";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";
import AdminPagination from "../../components/admin/AdminPagination";
import {
  AdminMobileCard,
  AdminMobileCardActions,
  AdminMobileCardBody,
  AdminMobileCardHeader,
  AdminMobileCardRow,
  AdminTableDesktop,
  AdminTableMobile,
  adminIconBtnClass,
  adminIconBtnDangerClass,
  adminIconBtnViewClass,
} from "../../components/admin/AdminResponsiveTable";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useDebouncedValue, useServerAdminPagination } from "../../hooks/useAdminPagination";
import { buildListQueryParams } from "../../utils/adminPaginationHelpers";
import {
  CONTACT_STATUS_STYLES,
  formatContactDate,
  formatContactLabel,
  UPDATABLE_CONTACT_STATUSES,
} from "../../utils/adminContactHelpers";

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${CONTACT_STATUS_STYLES[status] ?? "bg-brand-cream text-brand-muted"}`}
    >
      {formatContactLabel(status)}
    </span>
  );
}

function TypeBadge({ type }) {
  return (
    <span className="inline-flex max-w-full items-center whitespace-nowrap rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
      {formatContactLabel(type)}
    </span>
  );
}

function ContactStatusSelect({ contact, updating, onUpdate, compact = false }) {
  const isUpdating = updating === contact.id;

  return (
    <select
      value=""
      disabled={isUpdating}
      onChange={(e) => {
        const nextStatus = e.target.value;
        if (nextStatus) onUpdate(contact.id, nextStatus);
        e.target.value = "";
      }}
      aria-label={`Update status for ${contact.fullname}`}
      className={[
        "shrink-0 rounded-lg border border-brand-border bg-white font-semibold text-brand-ink outline-none transition-all focus:border-brand-green focus:ring-2 focus:ring-brand-green/15 disabled:cursor-not-allowed disabled:opacity-60",
        compact
          ? "h-9 min-w-[6.75rem] max-w-[7.5rem] px-2 py-0 text-[11px]"
          : "max-w-[9.5rem] rounded-xl border-2 px-2.5 py-2 text-xs",
      ].join(" ")}
    >
      <option value="">{isUpdating ? "Updating…" : "Status"}</option>
      {UPDATABLE_CONTACT_STATUSES.filter((option) => option.value !== contact.status).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function ContactRowActions({ contact, updatingId, onStatusUpdate, onDelete }) {
  return (
    <div className="flex shrink-0 flex-nowrap items-center justify-end gap-1.5">
      <ContactStatusSelect
        contact={contact}
        updating={updatingId}
        onUpdate={onStatusUpdate}
        compact
      />
      <div className="inline-flex shrink-0 overflow-hidden rounded-lg border border-brand-border/60">
        <Link
          to={ROUTES.admin.contactDetail(contact.id)}
          className={`${adminIconBtnClass} ${adminIconBtnViewClass} h-9 w-9 shrink-0 rounded-none border-0`}
          aria-label={`View enquiry from ${contact.fullname}`}
        >
          <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </Link>
        <button
          type="button"
          onClick={() => onDelete(contact)}
          className={`${adminIconBtnClass} ${adminIconBtnDangerClass} h-9 w-9 shrink-0 rounded-none border-0 border-l border-brand-border/60`}
          aria-label={`Delete enquiry from ${contact.fullname}`}
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </div>
  );
}

const EASE = [0.22, 1, 0.36, 1];

export default function AdminContactsPage() {
  const { token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [updatingId, setUpdatingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const pagination = useServerAdminPagination({ resetKey: debouncedSearch });

  const loadContacts = useCallback(async () => {
    setLoading(true);
    const result = await adminContactsServiceApi.listContacts(
      token,
      buildListQueryParams({
        page: pagination.page,
        per_page: pagination.pageSize,
        search: debouncedSearch,
      })
    );
    setLoading(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    const { items, shouldRefetch } = pagination.syncFromResponse(
      { items: result.items, pagination: result.pagination },
      pagination.page,
    );
    if (shouldRefetch) return;

    setContacts(items);
  }, [token, pagination, debouncedSearch]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  async function handleStatusUpdate(contactId, status) {
    setUpdatingId(contactId);
    const result = await adminContactsServiceApi.updateContact(token, contactId, { status });
    setUpdatingId(null);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    toast.success(result.reason || "Contact status updated.");
    setContacts((prev) =>
      prev.map((item) => (item.id === contactId ? { ...item, ...result.data } : item))
    );
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    const result = await adminContactsServiceApi.deleteContact(token, deleteTarget.id);
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    toast.success(result.reason || "Contact deleted.");
    setDeleteTarget(null);
    loadContacts();
  }

  const hasSearch = Boolean(debouncedSearch.trim());
  const isEmpty = !loading && contacts.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">Contact management</p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-brand-ink">Contact inquiries</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          Review inbound messages and support requests from travelers and visitors.
        </p>
      </div>

      <div className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, message, or status..."
            className="w-full rounded-xl border-2 border-brand-border bg-white py-3 pl-10 pr-4 text-sm font-medium text-brand-ink outline-none transition-all focus:border-brand-green focus:ring-2 focus:ring-brand-green/15"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-black/8 bg-white py-24">
          <Loader2 className="h-7 w-7 animate-spin text-brand-green" aria-hidden />
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-black/12 bg-white py-20 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600">
            <MessageSquare className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          </span>
          <p className="font-bold text-brand-ink">
            {hasSearch ? "No enquiries match your search" : "No contact enquiries yet"}
          </p>
          <p className="max-w-sm text-sm text-brand-muted">
            {hasSearch ? "Try a different search term." : "New contact form submissions will appear here."}
          </p>
        </div>
      ) : (
        <>
          <AdminTableMobile columns={2}>
            {contacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: EASE, delay: index * 0.03 }}
              >
                <AdminMobileCard>
                  <AdminMobileCardHeader
                    title={
                      <span className="block truncate text-sm font-medium normal-case tracking-normal">
                        {contact.fullname || "—"}
                      </span>
                    }
                    subtitle={contact.email}
                    trailing={<StatusBadge status={contact.status} />}
                  />
                  <AdminMobileCardBody>
                    <AdminMobileCardRow label="Phone" value={contact.phone_number || "—"} />
                    <AdminMobileCardRow
                      label="Type"
                      value={<TypeBadge type={contact.type} />}
                    />
                    <AdminMobileCardRow label="Received" value={formatContactDate(contact.created_at)} />
                  </AdminMobileCardBody>
                  <AdminMobileCardActions>
                    <ContactRowActions
                      contact={contact}
                      updatingId={updatingId}
                      onStatusUpdate={handleStatusUpdate}
                      onDelete={setDeleteTarget}
                    />
                  </AdminMobileCardActions>
                </AdminMobileCard>
              </motion.div>
            ))}
          </AdminTableMobile>

          <AdminTableDesktop>
            <table className="w-full min-w-[820px] table-fixed text-left">
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[18%]" />
                <col className="w-[11%]" />
                <col className="w-[18%]" />
                <col className="w-[23%]" />
              </colgroup>
              <thead className="border-b border-black/8 bg-brand-cream/50">
                <tr>
                  {[
                    { label: "Contact", className: "" },
                    { label: "Type", className: "" },
                    { label: "Status", className: "" },
                    { label: "Received", className: "" },
                    { label: "Actions", className: "text-right" },
                  ].map(({ label, className }) => (
                    <th
                      key={label}
                      className={`whitespace-nowrap px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted ${className}`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, index) => (
                  <motion.tr
                    key={contact.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: EASE, delay: index * 0.03 }}
                    className="border-b border-black/5 last:border-0 hover:bg-brand-cream/30"
                  >
                    <td className="align-middle px-4 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-brand-ink" title={contact.fullname}>
                          {contact.fullname || "—"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-brand-muted" title={contact.email}>
                          {contact.email || "—"}
                        </p>
                        <p className="truncate text-xs text-brand-muted">{contact.phone_number || "—"}</p>
                      </div>
                    </td>
                    <td className="align-middle px-4 py-3.5">
                      <TypeBadge type={contact.type} />
                    </td>
                    <td className="align-middle px-4 py-3.5">
                      <StatusBadge status={contact.status} />
                    </td>
                    <td className="whitespace-nowrap align-middle px-4 py-3.5 text-sm tabular-nums text-brand-muted">
                      {formatContactDate(contact.created_at)}
                    </td>
                    <td className="align-middle px-4 py-3.5">
                      <ContactRowActions
                        contact={contact}
                        updatingId={updatingId}
                        onStatusUpdate={handleStatusUpdate}
                        onDelete={setDeleteTarget}
                      />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </AdminTableDesktop>

          <AdminPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            rangeStart={pagination.rangeStart}
            rangeEnd={pagination.rangeEnd}
            onPageChange={pagination.setPage}
          />
        </>
      )}

      <AdminConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete contact enquiry?"
        itemLabel={deleteTarget?.fullname}
        message="This will permanently remove the enquiry and its message from the platform. This action cannot be undone."
        confirmLabel="Delete enquiry"
        loading={deleting}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
