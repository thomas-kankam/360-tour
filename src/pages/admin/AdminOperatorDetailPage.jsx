import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Building2,
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
import adminOperatorsServiceApi from "../../apis/AdminOperatorsServiceApi";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import {
  formatAdminOperatorDate,
  getAdminOperatorStatusConfig,
} from "../../utils/adminOperatorHelpers";

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

function OperatorAvatar({ operator, size = "lg" }) {
  const sizeClass = size === "lg" ? "h-16 w-16 text-2xl rounded-2xl" : "h-10 w-10 text-sm rounded-full";

  if (operator.profileImage) {
    return (
      <img
        src={operator.profileImage}
        alt=""
        className={`${sizeClass} shrink-0 object-cover ring-1 ring-black/8`}
      />
    );
  }

  const initial = (operator.organization?.[0] || operator.firstName?.[0] || operator.email?.[0] || "O").toUpperCase();

  return (
    <span className={`flex shrink-0 items-center justify-center bg-brand-accent/25 font-bold text-brand-primary ring-1 ring-brand-accent/30 ${sizeClass}`}>
      {initial}
    </span>
  );
}

export default function AdminOperatorDetailPage() {
  const { operatorSlug } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [operator, setOperator] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOperator = useCallback(async () => {
    setLoading(true);
    const result = await adminOperatorsServiceApi.getOperator(token, operatorSlug);
    setLoading(false);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      navigate(ROUTES.admin.operators, { replace: true });
      return;
    }

    setOperator(result.operator);
  }, [token, operatorSlug, navigate]);

  useEffect(() => {
    loadOperator();
  }, [loadOperator]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-black/8 bg-white py-24">
        <Loader2 className="h-7 w-7 animate-spin text-brand-green" aria-hidden />
      </div>
    );
  }

  if (!operator) return null;

  const statusConfig = getAdminOperatorStatusConfig(operator);

  return (
    <div className="space-y-6">
      <Link
        to={ROUTES.admin.operators}
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted transition-colors hover:text-brand-ink"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
        Back to operators
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm"
      >
        <div className="bg-brand-ink px-6 py-8 sm:px-8">
          <div className="flex flex-wrap items-center gap-5">
            <OperatorAvatar operator={operator} size="lg" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">Tour operator</p>
              <h1 className="mt-1 font-heading text-3xl font-bold text-white">
                {operator.organization || operator.name || "—"}
              </h1>
              {operator.organization && operator.name ? (
                <p className="mt-1 text-sm text-white/75">{operator.name}</p>
              ) : null}
              <p className="mt-1 truncate text-sm text-white/60">{operator.operatorSlug}</p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${statusConfig.className}`}>
                {statusConfig.label}
              </span>
              {operator.isVerified ? (
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
          <InfoRow icon={User} label="Contact person" value={operator.name} />
          <InfoRow icon={Building2} label="Organization" value={operator.organization} />
          <InfoRow icon={Mail} label="Email" value={operator.email} />
          <InfoRow icon={Phone} label="Phone" value={operator.phoneNumber} />
          <InfoRow icon={MapPin} label="Location" value={operator.location} />
          <InfoRow icon={Calendar} label="Joined" value={formatAdminOperatorDate(operator.createdAt)} />
          <InfoRow
            icon={ShieldCheck}
            label="Verified on"
            value={operator.isVerified ? formatAdminOperatorDate(operator.verifiedAt) : "Not verified"}
          />
          <InfoRow icon={Calendar} label="Last updated" value={formatAdminOperatorDate(operator.updatedAt)} />
        </div>
      </motion.div>
    </div>
  );
}
