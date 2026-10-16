import { useEffect, useMemo, useRef, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { ChevronDown, Search, X } from "lucide-react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  COUNTRY_OPTIONS,
  filterCountryOptions,
  findCountryOption,
  PRIORITY_COUNTRY_IDS,
} from "../../utils/countryOptions";

function findCountryByIso(isoCode) {
  const code = String(isoCode || "").toUpperCase();
  return COUNTRY_OPTIONS.find((country) => country.isoCode === code) || null;
}

export function splitStoredPhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  const fallback = findCountryOption("ghana") || COUNTRY_OPTIONS[0];
  if (!digits) return { countryId: fallback?.id || "", national: "" };

  const parsed = parsePhoneNumberFromString(`+${digits}`);
  if (parsed?.country) {
    const country = findCountryByIso(parsed.country) || fallback;
    return { countryId: country?.id || "", national: parsed.nationalNumber || "" };
  }

  const byDial = [...COUNTRY_OPTIONS].sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find((country) => country.dialCode && digits.startsWith(country.dialCode));
  if (byDial) {
    return { countryId: byDial.id, national: digits.slice(byDial.dialCode.length) };
  }

  return { countryId: fallback?.id || "", national: digits };
}

export function composePhone(country, national) {
  const local = String(national || "").replace(/\D/g, "").replace(/^0+/, "");
  if (!country?.dialCode || !local) return "";
  return `${country.dialCode}${local}`;
}

export default function PhoneCountryInput({ id, value, onChange, hasError = false }) {
  const initial = splitStoredPhone(value);
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const [countryId, setCountryId] = useState(initial.countryId);
  const [national, setNational] = useState(initial.national);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => findCountryOption(countryId) || findCountryOption("ghana"),
    [countryId],
  );
  const filtered = useMemo(() => filterCountryOptions(query), [query]);
  const { priorityOptions, otherOptions } = useMemo(() => {
    if (query.trim()) return { priorityOptions: [], otherOptions: filtered };
    const prioritySet = new Set(PRIORITY_COUNTRY_IDS);
    return {
      priorityOptions: filtered.filter((country) => prioritySet.has(country.id)),
      otherOptions: filtered.filter((country) => !prioritySet.has(country.id)),
    };
  }, [filtered, query]);

  useEffect(() => {
    const composed = composePhone(selected, national);
    const incoming = String(value || "").replace(/\D/g, "");
    if (incoming === composed) return;
    const next = splitStoredPhone(value);
    setCountryId(next.countryId);
    setNational(next.national);
  }, [value]);

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    function onEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  function emit(nextCountry, nextNational) {
    onChange(composePhone(nextCountry, nextNational));
  }

  function chooseCountry(nextId) {
    const nextCountry = findCountryOption(nextId);
    setCountryId(nextId);
    setOpen(false);
    setQuery("");
    emit(nextCountry, national);
  }

  function changeNational(nextValue) {
    const digits = nextValue.replace(/[^\d\s]/g, "");
    setNational(digits);
    emit(selected, digits);
  }

  return (
    <div ref={rootRef} className="relative mt-2">
      <div
        className={[
          "flex items-center rounded-xl border-2 bg-white transition-all focus-within:ring-2",
          hasError
            ? "border-red-400 focus-within:border-red-400 focus-within:ring-red-100"
            : "border-brand-border focus-within:border-brand-primary focus-within:ring-brand-primary/15",
        ].join(" ")}
      >
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Country code"
          onClick={() => setOpen((current) => !current)}
          className="flex shrink-0 items-center gap-2 border-r border-brand-border/70 px-3 py-3 text-sm font-semibold text-brand-ink"
        >
          {selected?.isoCode ? (
            <ReactCountryFlag
              countryCode={selected.isoCode}
              svg
              aria-hidden
              style={{ width: "1.25rem", height: "1.25rem", borderRadius: "2px", objectFit: "cover" }}
            />
          ) : null}
          <span>+{selected?.dialCode || ""}</span>
          <ChevronDown className={["h-4 w-4 text-brand-muted transition-transform", open ? "rotate-180" : ""].join(" ")} aria-hidden />
        </button>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={national}
          onChange={(event) => changeNational(event.target.value)}
          placeholder="Phone number"
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm font-medium text-brand-ink outline-none placeholder:text-brand-muted/60"
        />
      </div>

      {open ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-brand-border/70 bg-white shadow-[0_20px_50px_-24px_rgba(0,107,63,0.35)]">
          <div className="border-b border-brand-border/50 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" aria-hidden />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search country or code"
                className="w-full rounded-xl border border-brand-border/60 bg-brand-cream/40 py-2.5 pl-9 pr-9 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-brand-muted hover:text-brand-ink"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
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
                    <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-muted">Popular</p>
                    {priorityOptions.map((country) => (
                      <CountryRow key={country.id} country={country} active={country.id === selected?.id} onSelect={chooseCountry} />
                    ))}
                  </>
                ) : null}
                {otherOptions.map((country) => (
                  <CountryRow key={country.id} country={country} active={country.id === selected?.id} onSelect={chooseCountry} />
                ))}
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CountryRow({ country, active, onSelect }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={() => onSelect(country.id)}
      className={[
        "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm",
        active ? "bg-brand-primary/10 font-semibold text-brand-primary" : "text-brand-ink hover:bg-brand-cream/80",
      ].join(" ")}
    >
      <ReactCountryFlag
        countryCode={country.isoCode}
        svg
        aria-hidden
        style={{ width: "1.25rem", height: "1.25rem", borderRadius: "2px", objectFit: "cover" }}
      />
      <span className="min-w-0 flex-1 truncate">{country.label}</span>
      <span className="shrink-0 text-xs text-brand-muted">+{country.dialCode}</span>
    </button>
  );
}
