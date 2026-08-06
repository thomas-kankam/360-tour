import { ROLE_META, USER_ROLES } from "../../constants/roles";
import AppIcon from "../icons/AppIcon";

export default function AccountTypePicker({ value, onChange, className = "" }) {
  return (
    <div className={["grid gap-3 sm:grid-cols-2", className].join(" ")}>
      {[USER_ROLES.TOURIST, USER_ROLES.SITE_OPERATOR].map((role) => {
        const meta = ROLE_META[role];
        const active = value === role;
        return (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            className={[
              "flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all duration-200",
              active
                ? "border-brand-green bg-brand-green/5 ring-2 ring-brand-green/15"
                : "border-brand-border/70 bg-white hover:border-brand-green/35",
            ].join(" ")}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-cream text-brand-green">
              <AppIcon name={meta.icon} className="h-5 w-5" />
            </span>
            <span className="text-sm font-bold text-brand-ink">{meta.label}</span>
            <span className="text-[11px] leading-relaxed text-brand-muted">{meta.description}</span>
          </button>
        );
      })}
    </div>
  );
}
