import { Link } from "react-router";
import { motion } from "motion/react";
import {
  BookOpen,
  CalendarCheck,
  Check,
  Map,
  MessageSquare,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { ADMIN_PERMISSION_NAV_MAP } from "../../constants/adminPermissions";

const EASE = [0.22, 1, 0.36, 1];

const PERMISSION_ICONS = {
  user_management: UserCog,
  booking_management: CalendarCheck,
  client_management: Users,
  contact_management: MessageSquare,
  listing_management: Map,
  role_management: BookOpen,
};

function PermissionRow({ permission, index }) {
  const nav = ADMIN_PERMISSION_NAV_MAP[permission.name];
  const Icon = PERMISSION_ICONS[permission.name] ?? ShieldCheck;
  const label = permission.label || nav?.label || permission.name;

  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brand-ink">{label}</p>
        <p className="truncate text-[11px] text-brand-muted">Full module access</p>
      </div>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
      </span>
    </>
  );

  const rowClass =
    "flex items-center gap-3 rounded-xl border border-black/5 bg-brand-cream/30 px-3 py-3 transition-colors hover:border-brand-green/20 hover:bg-brand-green/[0.04]";

  if (nav?.to) {
    return (
      <motion.li
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: EASE, delay: index * 0.05 }}
      >
        <Link to={nav.to} className={rowClass}>
          {content}
        </Link>
      </motion.li>
    );
  }

  return (
    <motion.li
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: EASE, delay: index * 0.05 }}
      className={rowClass}
    >
      {content}
    </motion.li>
  );
}

export default function AdminActivePermissionsCard({ permissions = [], className = "" }) {
  const count = permissions.length;

  return (
    <section
      className={`flex min-h-0 flex-col rounded-2xl border border-black/8 bg-white p-6 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-muted">Active permissions</p>
          <p className="mt-1 text-sm text-brand-muted">Modules granted to your account</p>
        </div>
        <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-brand-green/10 px-2.5 text-xs font-bold text-brand-green">
          {count}
        </span>
      </div>

      {count === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-cream text-brand-muted/40">
            <ShieldCheck className="h-7 w-7" strokeWidth={1.5} aria-hidden />
          </span>
          <p className="mt-4 text-sm font-bold text-brand-ink">No modules assigned</p>
          <p className="mt-1 max-w-[14rem] text-xs leading-relaxed text-brand-muted">
            Permission modules will appear here once your role is configured.
          </p>
        </div>
      ) : (
        <ul className="mt-5 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
          {permissions.map((permission, index) => (
            <PermissionRow key={permission.name} permission={permission} index={index} />
          ))}
        </ul>
      )}
    </section>
  );
}
