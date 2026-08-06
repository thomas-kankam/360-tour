export const CONTACT_STATUS_STYLES = {
  new: "bg-sky-100 text-sky-700",
  read: "bg-brand-cream text-brand-muted",
  contacted: "bg-orange-100 text-orange-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-brand-cream text-brand-muted",
};

export const UPDATABLE_CONTACT_STATUSES = [
  { value: "contacted", label: "Contacted" },
  { value: "resolved", label: "Resolved" },
];

export function formatContactLabel(value) {
  if (!value) return "—";
  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatContactDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
