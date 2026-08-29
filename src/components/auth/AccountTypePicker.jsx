import { USER_ROLES } from "../../constants/roles";
import AppIcon from "../icons/AppIcon";

/** Traveler-only account picker — operator sign-up is managed internally via admin. */
export default function AccountTypePicker({ value, onChange, className = "" }) {
  const role = USER_ROLES.TOURIST;
  const meta = {
    label: "Traveler",
    shortLabel: "Traveler",
    description: "Browse tours, book trips, and manage your reservations.",
    icon: "luggage",
  };
  const active = value === role;

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => onChange(role)}
        className={[
          "flex w-full flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all duration-200",
          active
            ? "border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/15"
            : "border-brand-border/70 bg-white hover:border-brand-primary/35",
        ].join(" ")}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-cream text-brand-primary">
          <AppIcon name={meta.icon} className="h-5 w-5" />
        </span>
        <span className="text-sm font-bold text-brand-ink">{meta.label}</span>
        <span className="text-[11px] leading-relaxed text-brand-muted">{meta.description}</span>
      </button>
    </div>
  );
}
