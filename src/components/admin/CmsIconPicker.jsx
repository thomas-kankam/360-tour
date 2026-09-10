import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { GUEST_ICON_OPTIONS, GuestIcon } from "../../utils/guestIcons";

/**
 * Searchable single-select icon picker with visual previews.
 */
export default function CmsIconPicker({
  label = "Icon",
  value = "compass",
  onChange,
  hint = "Search by name, then pick an icon",
  options = GUEST_ICON_OPTIONS,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((option) => option.id === value) || options[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.id.toLowerCase().includes(q) ||
        option.label.toLowerCase().includes(q),
    );
  }, [options, query]);

  useEffect(() => {
    function onDocClick(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="mt-1.5 flex w-full items-center gap-3 rounded-xl border border-brand-border/70 bg-white px-3 py-2.5 text-left transition hover:border-brand-primary/40"
        aria-expanded={open}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
          <GuestIcon name={selected?.id || value} className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-brand-ink">{selected?.label || value}</span>
          <span className="block text-[11px] text-brand-muted">{selected?.id || value}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-brand-muted" aria-hidden />
      </button>

      {open ? (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-brand-border/70 bg-white shadow-xl">
          <div className="relative border-b border-brand-border/50 p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-muted" aria-hidden />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons…"
              className="h-9 w-full rounded-xl border border-brand-border/60 bg-brand-cream/40 pl-9 pr-3 text-sm outline-none focus:border-brand-primary/40"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-brand-muted">No icons match “{query}”</li>
            ) : (
              filtered.map((option) => {
                const active = option.id === value;
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(option.id);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={[
                        "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition",
                        active ? "bg-brand-primary/10" : "hover:bg-brand-cream",
                      ].join(" ")}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-cream text-brand-primary">
                        <GuestIcon name={option.id} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-brand-ink">{option.label}</span>
                        <span className="block text-[10px] text-brand-muted">{option.id}</span>
                      </span>
                      {active ? <Check className="h-4 w-4 text-brand-primary" aria-hidden /> : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}

      {hint ? <p className="mt-1 text-[11px] text-brand-muted">{hint}</p> : null}
    </div>
  );
}
