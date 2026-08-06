import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAdminPaginationPages } from "../../hooks/useAdminPagination";

const btnClass =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-brand-border/60 text-sm font-semibold text-brand-muted transition-colors disabled:cursor-not-allowed disabled:opacity-40";

const activeClass = "border-brand-green/30 bg-brand-green/10 text-brand-green";
const hoverClass = "hover:border-brand-green/30 hover:bg-brand-green/5 hover:text-brand-green";

export default function AdminPagination({
  page,
  totalPages,
  totalItems,
  rangeStart,
  rangeEnd,
  onPageChange,
  className = "",
}) {
  if (totalItems === 0) return null;

  const pages = getAdminPaginationPages(page, totalPages);

  return (
    <nav
      aria-label="Table pagination"
      className={`flex flex-col gap-3 rounded-2xl border border-black/8 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5 ${className}`}
    >
      <p className="text-sm text-brand-muted">
        Showing{" "}
        <span className="font-semibold text-brand-ink">
          {rangeStart}–{rangeEnd}
        </span>{" "}
        of <span className="font-semibold text-brand-ink">{totalItems}</span>
      </p>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className={`${btnClass} px-2.5 ${hoverClass}`}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>

          {pages.map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-1 text-sm text-brand-muted" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={`${btnClass} ${item === page ? activeClass : hoverClass}`}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className={`${btnClass} px-2.5 ${hoverClass}`}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>
      ) : null}
    </nav>
  );
}
