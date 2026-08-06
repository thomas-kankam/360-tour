export function AdminTableDesktop({ children, nested = false, className = "" }) {
  const shell = nested
    ? `hidden lg:block ${className}`
    : `hidden overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm lg:block ${className}`;

  return (
    <div className={shell}>
      <div className={nested ? "" : "overflow-x-auto"}>{children}</div>
    </div>
  );
}

export function AdminTableMobile({ children, columns = 1, className = "" }) {
  const layout =
    columns === 2
      ? `grid gap-3 md:grid-cols-2 lg:hidden ${className}`
      : `space-y-3 lg:hidden ${className}`;

  return <div className={layout}>{children}</div>;
}

export function AdminMobileCard({ children }) {
  return (
    <article className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm sm:p-5">
      {children}
    </article>
  );
}

export function AdminMobileCardHeader({ avatar, title, subtitle, trailing }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-black/8 pb-4">
      <div className="flex min-w-0 items-center gap-3">
        {avatar}
        <div className="min-w-0">
          <p className="truncate font-semibold text-brand-ink">{title}</p>
          {subtitle ? <p className="mt-0.5 truncate text-xs text-brand-muted">{subtitle}</p> : null}
        </div>
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}

export function AdminMobileCardBody({ children }) {
  return <div className="space-y-0 py-1">{children}</div>;
}

export function AdminMobileCardRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-black/5 py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-muted">{label}</span>
      <div className="min-w-0 text-sm font-medium text-brand-ink sm:max-w-[65%] sm:text-right">{value}</div>
    </div>
  );
}

export function AdminMobileCardActions({ children }) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-black/8 pt-3">
      {children}
    </div>
  );
}

export const adminIconBtnClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border/60 text-brand-muted transition-colors";

export const adminIconBtnViewClass =
  "hover:border-brand-green/30 hover:bg-brand-green/5 hover:text-brand-green";

export const adminIconBtnDangerClass =
  "hover:border-red-200 hover:bg-red-50 hover:text-red-600";
