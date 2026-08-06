import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  PhoneCall,
  Tag,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import adminContactsServiceApi from "../../apis/AdminContactsServiceApi";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import {
  CONTACT_STATUS_STYLES,
  formatContactDate,
  formatContactLabel,
  UPDATABLE_CONTACT_STATUSES,
} from "../../utils/adminContactHelpers";

const EASE = [0.22, 1, 0.36, 1];

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-black/8 bg-brand-cream/40 px-4 py-3.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-green">
        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-muted">{label}</p>
        <p className="mt-0.5 break-words text-sm font-semibold text-brand-ink">{value || "—"}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize ${CONTACT_STATUS_STYLES[status] ?? "bg-brand-cream text-brand-muted"}`}
    >
      {formatContactLabel(status)}
    </span>
  );
}

export default function AdminContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadContact = useCallback(async () => {
    setLoading(true);
    const result = await adminContactsServiceApi.getContact(token, id);
    setLoading(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      navigate(ROUTES.admin.contacts, { replace: true });
      return;
    }

    setContact(result.data);
  }, [token, id, navigate]);

  useEffect(() => {
    loadContact();
  }, [loadContact]);

  async function handleStatusUpdate(status) {
    if (!contact || contact.status === status) return;

    setUpdatingStatus(status);
    const result = await adminContactsServiceApi.updateContact(token, id, { status });
    setUpdatingStatus(null);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    toast.success(result.reason || "Contact status updated.");
    setContact(result.data);
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await adminContactsServiceApi.deleteContact(token, id);
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    toast.success(result.reason || "Contact deleted.");
    navigate(ROUTES.admin.contacts, { replace: true });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-black/8 bg-white py-24">
        <Loader2 className="h-7 w-7 animate-spin text-brand-green" aria-hidden />
      </div>
    );
  }

  if (!contact) return null;

  const messageParagraphs = (contact.message || "")
    .split(/\n{2,}|\r\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to={ROUTES.admin.contacts}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted transition-colors hover:text-brand-ink"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          Back to contact inquiries
        </Link>

        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Delete enquiry
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm"
      >
        <div className="bg-brand-ink px-6 py-8 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-300">
                <MessageSquare className="h-7 w-7" strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">Contact enquiry</p>
                <h1 className="mt-1 font-heading text-3xl font-bold text-white">{contact.fullname || "Unknown"}</h1>
                <p className="mt-1 text-sm text-white/60">#{contact.id}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={contact.status} />
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                {formatContactLabel(contact.type)}
              </span>
            </div>
          </div>
        </div>

        <div className="border-b border-black/8 bg-brand-cream/30 px-6 py-5 sm:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-muted">Update status</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {UPDATABLE_CONTACT_STATUSES.map(({ value, label }) => {
              const isActive = contact.status === value;
              const isLoading = updatingStatus === value;

              return (
                <button
                  key={value}
                  type="button"
                  disabled={isActive || Boolean(updatingStatus)}
                  onClick={() => handleStatusUpdate(value)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed ${
                    isActive
                      ? "bg-brand-green text-white shadow-sm"
                      : "border border-black/10 bg-white text-brand-ink hover:border-brand-green/30 hover:bg-brand-green/5 disabled:opacity-60"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : value === "contacted" ? (
                    <PhoneCall className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  )}
                  {isActive ? `${label} (current)` : `Mark as ${label.toLowerCase()}`}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-5 lg:p-8">
          <section className="space-y-3 lg:col-span-2">
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-brand-muted">Contact details</h2>
            <InfoRow icon={Mail} label="Email" value={contact.email} />
            <InfoRow icon={Phone} label="Phone" value={contact.phone_number} />
            <InfoRow icon={Tag} label="Enquiry type" value={formatContactLabel(contact.type)} />
            <InfoRow icon={Calendar} label="Received" value={formatContactDate(contact.created_at)} />
            <InfoRow icon={Calendar} label="Last updated" value={formatContactDate(contact.updated_at)} />
          </section>

          <section className="lg:col-span-3">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-brand-muted">Message</h2>
                <p className="mt-1 text-xs text-brand-muted">Submitted {formatContactDate(contact.created_at)}</p>
              </div>
            </div>

            <article className="relative overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm">
              <div className="absolute left-0 top-0 h-full w-1.5 bg-brand-green" aria-hidden />
              <div className="border-b border-black/6 bg-brand-cream/40 px-6 py-4 sm:px-8">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-green shadow-sm">
                    <MessageSquare className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-brand-ink">Enquiry from {contact.fullname || "visitor"}</p>
                    <p className="mt-0.5 text-xs text-brand-muted">
                      {formatContactLabel(contact.type)} · {contact.email || "No email"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-7 sm:px-8 sm:py-8">
                {messageParagraphs.length === 0 ? (
                  <p className="text-base leading-8 text-brand-muted">No message provided.</p>
                ) : (
                  <div className="space-y-5">
                    {messageParagraphs.map((paragraph, index) => (
                      <p
                        key={index}
                        className="text-base leading-[1.85] tracking-[0.01em] text-brand-ink whitespace-pre-wrap sm:text-[1.0625rem]"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </section>
        </div>
      </motion.div>

      <AdminConfirmModal
        open={deleteOpen}
        title="Delete contact enquiry?"
        itemLabel={contact.fullname}
        message="This will permanently remove the enquiry and its message from the platform. This action cannot be undone."
        confirmLabel="Delete enquiry"
        loading={deleting}
        onClose={() => !deleting && setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
