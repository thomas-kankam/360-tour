import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { filterGhanaBanks, findGhanaBank } from "../../data/ghanaBanks";

export default function BankSearchSelect({ value, onChange, className = "" }) {
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(() => findGhanaBank(value), [value]);
  const filtered = useMemo(() => filterGhanaBanks(query), [query]);
  const typedName = query.trim();
  const showCustom = typedName && !filtered.some((bank) => bank.name.toLowerCase() === typedName.toLowerCase());

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  function choose(bank) {
    onChange({ name: bank.name, swift: bank.swift || "" });
    setQuery("");
    setOpen(false);
  }

  function useTypedName() {
    onChange({ name: typedName, swift: "" });
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={["relative", className].join(" ")}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="mt-2 flex w-full items-center justify-between gap-3 rounded-xl border-2 border-brand-border bg-white px-4 py-3 text-left text-sm font-medium text-brand-ink outline-none transition-all focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={value ? "" : "text-brand-muted"}>{value || "Search banks"}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-brand-muted" aria-hidden />
      </button>

      {open ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-brand-border/70 bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-brand-border/50 px-3 py-2">
            <Search className="h-4 w-4 text-brand-muted" aria-hidden />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by bank or SWIFT"
              className="h-9 w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div role="listbox" className="max-h-64 overflow-y-auto py-1">
            {filtered.map((bank) => {
              const active = selected?.id === bank.id || value === bank.name;
              return (
                <button
                  key={bank.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => choose(bank)}
                  className={[
                    "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm",
                    active ? "bg-brand-primary/10 font-semibold text-brand-primary" : "text-brand-ink hover:bg-brand-cream/80",
                  ].join(" ")}
                >
                  <span className="min-w-0 truncate">{bank.name}</span>
                  <span className="shrink-0 font-mono text-[11px] text-brand-muted">{bank.swift}</span>
                </button>
              );
            })}
            {showCustom ? (
              <button
                type="button"
                onClick={useTypedName}
                className="w-full px-3 py-2.5 text-left text-sm font-semibold text-brand-primary hover:bg-brand-cream/80"
              >
                Use “{typedName}”
              </button>
            ) : null}
            {filtered.length === 0 && !showCustom ? (
              <p className="px-3 py-4 text-sm text-brand-muted">No banks match that search.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
