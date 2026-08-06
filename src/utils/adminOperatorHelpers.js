import { parsePaginatedList } from "./adminPaginationHelpers";
import { mapAdminOperator } from "./adminListingHelpers";

export const ADMIN_OPERATOR_STATUS_STYLES = {
  active: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  inactive: "bg-amber-100 text-amber-700 ring-amber-200",
  suspended: "bg-red-100 text-red-700 ring-red-200",
};

export function mapAdminOperatorList(data) {
  const { items, pagination } = parsePaginatedList(data);
  return {
    items: items.map(mapAdminOperator).filter(Boolean),
    pagination,
  };
}

export function getAdminOperatorStatusConfig(operator) {
  const status = operator?.status || "";
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";

  return {
    label,
    className: ADMIN_OPERATOR_STATUS_STYLES[status] ?? "bg-brand-cream text-brand-muted ring-black/8",
  };
}

export function formatAdminOperatorDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function summarizeAdminOperators(operators = []) {
  let active = 0;
  let verified = 0;

  operators.forEach((operator) => {
    if (operator.status === "active") active += 1;
    if (operator.isVerified) verified += 1;
  });

  return { active, verified };
}
