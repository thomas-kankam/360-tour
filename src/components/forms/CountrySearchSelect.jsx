import { useEffect, useMemo, useRef, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { ChevronDown, Search, X } from "lucide-react";
import {
  COUNTRY_OPTIONS,
  filterCountryOptions,
  findCountryOption,
  PRIORITY_COUNTRY_IDS,
} from "../../utils/countryOptions";

function CountryFlag({ isoCode, className = "" }) {
  if (!isoCode) return null;

  return (
    <ReactCountryFlag
      countryCode={isoCode}
      svg
      aria-hidden
      className={className}
      style={{
        width: "1.25rem",
        height: "1.25rem",
        borderRadius: "2px",
        objectFit: "cover",
      }}
    />
  );
}

function CountryOptionRow({ country, active, onSelect }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={() => onSelect(country.id)}
      className={[
        "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors",
        active
          ? "bg-brand-primary/10 font-semibold text-brand-primary"
          : "text-brand-ink hover:bg-brand-cream/80",
      ].join(" ")}
    >
      <CountryFlag isoCode={country.isoCode} />
      <span className="min-w-0 flex-1 truncate">{country.label}</span>
      {country.dialCode ? (
        <span className="shrink-0 text-xs text-brand-muted">+{country.dialCode}</span>
      ) : null}
    </button>
  );
}

export default function CountrySearchSelect({
  value,
  onChange,
  placeholder = "Search countries…",
  className = "",
  disabled = false,
}) {
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(() => findCountryOption(value), [value]);

  const filtered = useMemo(() => filterCountryOptions(query), [query]);

  const { priorityOptions, otherOptions } = useMemo(() => {
    if (query.trim()) {
      return { priorityOptions: [], otherOptions: filtered };
    }

    const prioritySet = new Set(PRIORITY_COUNTRY_IDS);
    return {
      priorityOptions: filtered.filter((country) => prioritySet.has(country.id)),
      otherOptions: filtered.filter((country) => !prioritySet.has(country.id)),
    };
  }, [filtered, query]);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  function handleSelect(countryId) {
    onChange(countryId);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={[
          "flex w-full items-center gap-3 rounded-xl border-2 border-brand-border bg-white px-4 py-2.5 text-left text-sm font-medium text-brand-ink outline-none transition-all",
          "focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15",
          disabled ? "cursor-not-allowed opacity-60" : "hover:border-brand-primary/30",
        ].join(" ")}
      >
        {selected ? (
          <>
            <CountryFlag isoCode={selected.isoCode} />
            <span className="min-w-0 flex-1 truncate">{selected.label}</span>
          </>
        ) : (
          <span className="flex-1 text-brand-muted">Select a country</span>
        )}
        <ChevronDown
          className={["h-4 w-4 shrink-0 text-brand-muted transition-transform", open ? "rotate-180" : ""].join(" ")}
          strokeWidth={2}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-brand-border/70 bg-white shadow-[0_20px_50px_-24px_rgba(0,107,63,0.35)]">
          <div className="border-b border-brand-border/50 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" strokeWidth={2} aria-hidden />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-brand-border/60 bg-brand-cream/40 py-2.5 pl-9 pr-9 text-sm text-brand-ink outline-none transition-all focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-brand-muted transition-colors hover:bg-brand-cream hover:text-brand-ink"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                </button>
              ) : null}
            </div>
          </div>

          <div role="listbox" className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-brand-muted">No countries match your search.</p>
            ) : (
              <>
                {priorityOptions.length > 0 ? (
                  <>
                    <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-muted">
                      Popular destinations
                    </p>
                    {priorityOptions.map((country) => (
                      <CountryOptionRow
                        key={country.id}
                        country={country}
                        active={country.id === value}
                        onSelect={handleSelect}
                      />
                    ))}
                    {otherOptions.length > 0 ? (
                      <div className="my-1 border-t border-brand-border/40" aria-hidden />
                    ) : null}
                  </>
                ) : null}

                {otherOptions.length > 0 ? (
                  <>
                    {!query.trim() ? (
                      <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-muted">
                        All countries
                      </p>
                    ) : null}
                    {otherOptions.map((country) => (
                      <CountryOptionRow
                        key={country.id}
                        country={country}
                        active={country.id === value}
                        onSelect={handleSelect}
                      />
                    ))}
                  </>
                ) : null}
              </>
            )}
          </div>

          <div className="border-t border-brand-border/50 bg-brand-cream/30 px-3 py-2 text-[11px] text-brand-muted">
            {COUNTRY_OPTIONS.length} countries available
          </div>
        </div>
      ) : null}
    </div>
  );
}
