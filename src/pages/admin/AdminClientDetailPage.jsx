import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "react-toastify";
import adminClientsServiceApi from "../../apis/AdminClientsServiceApi";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import {
  formatAdminClientDate,
  getAdminClientStatusConfig,
} from "../../utils/adminClientHelpers";

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

function ClientAvatar({ client, size = "lg" }) {
  const sizeClass = size === "lg" ? "h-16 w-16 text-2xl rounded-2xl" : "h-10 w-10 text-sm rounded-full";

  if (client.profileImage) {
    return (
      <img
        src={client.profileImage}
        alt=""
        className={`${sizeClass} shrink-0 object-cover ring-1 ring-black/8`}
      />
    );
  }

  const initial = (client.firstName?.[0] || client.email?.[0] || "C").toUpperCase();

  return (
    <span className={`flex shrink-0 items-center justify-center bg-sky-500/10 font-bold text-sky-700 ring-1 ring-sky-200 ${sizeClass}`}>
      {initial}
    </span>
  );
}

export default function AdminClientDetailPage() {
  const { clientSlug } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadClient = useCallback(async () => {
    setLoading(true);
    const result = await adminClientsServiceApi.getClient(token, clientSlug);
    setLoading(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      navigate(ROUTES.admin.clients, { replace: true });
      return;
    }

    setClient(result.client);
  }, [token, clientSlug, navigate]);

  useEffect(() => {
    loadClient();
  }, [loadClient]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-black/8 bg-white py-24">
        <Loader2 className="h-7 w-7 animate-spin text-brand-green" aria-hidden />
      </div>
    );
  }

  if (!client) return null;

  const statusConfig = getAdminClientStatusConfig(client);

  return (
    <div className="space-y-6">
      <Link
        to={ROUTES.admin.clients}
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted transition-colors hover:text-brand-ink"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        Back to clients
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm"
      >
        <div className="bg-brand-ink px-6 py-8 sm:px-8">
          <div className="flex flex-wrap items-center gap-5">
            <ClientAvatar client={client} size="lg" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">Registered traveler</p>
              <h1 className="mt-1 font-heading text-3xl font-bold text-white">{client.name || "—"}</h1>
              <p className="mt-1 truncate text-sm text-white/60">{client.clientSlug}</p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${statusConfig.className}`}>
                {statusConfig.label}
              </span>
              {client.isVerified ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-100">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/70">
                  Unverified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
          <InfoRow icon={Mail} label="Email" value={client.email} />
          <InfoRow icon={Phone} label="Phone" value={client.phoneNumber} />
          <InfoRow icon={MapPin} label="Location" value={client.location} />
          <InfoRow icon={User} label="Client ID" value={String(client.id)} />
          <InfoRow icon={Calendar} label="Joined" value={formatAdminClientDate(client.createdAt)} />
          <InfoRow icon={ShieldCheck} label="Verified on" value={client.isVerified ? formatAdminClientDate(client.verifiedAt) : "Not verified"} />
          <InfoRow icon={Calendar} label="Last updated" value={formatAdminClientDate(client.updatedAt)} />
        </div>
      </motion.div>
    </div>
  );
}
