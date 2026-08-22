import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Info, X } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import TourImageField from "./TourImageField";
import ItineraryDayImageField from "./ItineraryDayImageField";
import TourFeatureImagesField from "./TourFeatureImagesField";
import TourLocationRoutePicker from "./TourLocationRoutePicker";
import CountrySearchSelect from "../forms/CountrySearchSelect";
import { GuestIcon } from "../../utils/guestIcons";
import {
  BADGE_VARIANTS,
  GHANA_PACKAGE_LINE_OPTIONS,
  getPackageLinePhotoHints,
  isCountryCategoryId,
  isGhanaPackageLineId,
  TOUR_CATEGORY_OPTIONS,
  findCountryOption,
} from "../../utils/operatorTourStorage";
import {
  TOUR_CURRENCY,
  TOUR_CURRENCY_USD,
  UNLIMITED_TOUR_SLOTS,
  DEPARTURE_SCHEDULE_DATE_RANGE,
  DEPARTURE_SCHEDULE_OPTIONS,
  createEmptyDateRangeDeparture,
  createEmptySpecificDeparture,
  formatTourPriceLabel,
  parseTourPriceAmount,
  isUnlimitedTourSlots,
} from "../../utils/operatorTourConstants";
import { AUDIENCE_SCOPE, AUDIENCE_SCOPE_OPTIONS } from "../../constants/tourAudience";
import {
  EXCLUSION_ITEM_HINT,
  EXCLUSION_ITEM_PLACEHOLDER,
  INCLUSION_ITEM_HINT,
  INCLUSION_ITEM_PLACEHOLDER,
} from "../../utils/inclusionItemText";
import {
  buildTourPayload,
  diffDaysBetween,
  formatDepartureDateLabel,
  formatDepartureRangeLabel,
  syncEndDateFromDuration,
  validateTourSlotAllocation,
} from "../../utils/operatorTourMapper";
import { validateTourPricing } from "../../utils/tourPricing";
import {
  normalizeTourImages,
  validateFeatureImagesCollection,
} from "../../utils/tourImageUtils";

const inputClass =
  "w-full rounded-xl border-2 border-brand-border bg-white px-4 py-2.5 text-sm font-medium text-brand-ink outline-none transition-all focus:border-brand-green focus:ring-2 focus:ring-brand-green/15";
const labelClass = "block text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted";
const sectionClass = "rounded-2xl border border-brand-border/70 bg-white p-6 shadow-sm";

const EASE = [0.16, 1, 0.3, 1];

const STEPS = [
  { id: "basics", label: "Basics" },
  { id: "images", label: "Images" },
  { id: "content", label: "Content" },
  { id: "itinerary", label: "Itinerary" },
  { id: "pricing", label: "Pricing & dates" },
  { id: "booking", label: "Booking rules" },
];

function ListingStepProgress({ currentIndex }) {
  return (
    <div className="rounded-[1.75rem] border border-brand-border/60 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary">Listing wizard</p>
          <p className="mt-1 text-sm font-semibold text-brand-ink">
            Step {currentIndex + 1} of {STEPS.length} — {STEPS[currentIndex].label}
          </p>
        </div>
        <span className="rounded-full bg-brand-cream px-3 py-1 text-xs font-bold text-brand-green">
          {Math.round(((currentIndex + 1) / STEPS.length) * 100)}%
        </span>
      </div>
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={step.id} className="flex flex-1 items-center gap-1">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                <div
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300",
                    done
                      ? "bg-brand-green text-white"
                      : active
                        ? "bg-brand-primary text-white ring-4 ring-brand-primary/20"
                        : "bg-brand-border/40 text-brand-muted",
                  ].join(" ")}
                >
                  {done ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`hidden max-w-full truncate text-center text-[10px] font-semibold sm:block ${active ? "text-brand-ink" : "text-brand-muted"}`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mb-5 h-0.5 flex-1 rounded-full transition-colors duration-300 ${done ? "bg-brand-green" : "bg-brand-border/50"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, children, hint, hintClassName = "" }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="mt-2">{children}</div>
      {hint ? (
        <p className={`mt-1.5 text-[11px] text-brand-muted ${hintClassName}`}>{hint}</p>
      ) : null}
    </div>
  );
}

function updateListItem(list, index, value) {
  const next = [...list];
  next[index] = value;
  return next;
}

export default function TourListingForm({ initial, onSubmit, submitLabel = "Save listing", isUpdate = false }) {
  const normalizedInitial = useMemo(() => normalizeTourImages(initial), [initial]);
  const [form, setForm] = useState(normalizedInitial);
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [rangeSlotsBeforeUnlimited, setRangeSlotsBeforeUnlimited] = useState(18);
  const formTopRef = useRef(null);

  const step = STEPS[stepIndex].id;
  const isLastStep = stepIndex === STEPS.length - 1;
  const nextStep = STEPS[stepIndex + 1];
  const departureScheduleType = form.departureScheduleType || DEPARTURE_SCHEDULE_DATE_RANGE;
  const isDateRangeSchedule = departureScheduleType === DEPARTURE_SCHEDULE_DATE_RANGE;
  const dateRangeDeparture = form.departureDates?.[0] || createEmptyDateRangeDeparture();
  const isDateRangeUnlimited = isUnlimitedTourSlots(dateRangeDeparture.spotsTotal);
  const audienceScope = form.audienceScope || AUDIENCE_SCOPE.LOCAL;
  const isGlobalAudience = audienceScope === AUDIENCE_SCOPE.GLOBAL;
  const isForeignAudience = audienceScope === AUDIENCE_SCOPE.FOREIGN;
  const priceCurrency = isForeignAudience ? TOUR_CURRENCY_USD.code : TOUR_CURRENCY.code;

  useEffect(() => {
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stepIndex]);

  function patch(updates) {
    setForm((prev) => ({ ...prev, ...updates }));
  }

  function handleNameChange(name) {
    patch({ name });
  }

  function handlePriceChange(rawValue) {
    const amount = parseTourPriceAmount(rawValue);
    patch({
      priceAmount: rawValue === "" ? "" : amount,
      priceAmountGhs: rawValue === "" ? "" : amount,
      priceLabel: formatTourPriceLabel(amount, priceCurrency),
    });
  }

  function handlePriceGhsChange(rawValue) {
    const amount = parseTourPriceAmount(rawValue);
    patch({
      priceAmountGhs: rawValue === "" ? "" : amount,
      priceAmount: rawValue === "" ? "" : amount,
      priceLabel: formatTourPriceLabel(amount, TOUR_CURRENCY.code),
    });
  }

  function handlePriceUsdChange(rawValue) {
    const amount = parseTourPriceAmount(rawValue);
    if (isForeignAudience) {
      patch({
        priceAmountUsd: rawValue === "" ? "" : amount,
        priceAmount: rawValue === "" ? "" : amount,
        priceCurrency: TOUR_CURRENCY_USD.code,
        priceLabel: formatTourPriceLabel(amount, TOUR_CURRENCY_USD.code),
      });
      return;
    }
    patch({ priceAmountUsd: rawValue === "" ? "" : amount });
  }

  function handleAudienceScopeChange(nextScope) {
    if (nextScope === audienceScope) return;

    if (nextScope === AUDIENCE_SCOPE.LOCAL) {
      const ghs = form.priceAmountGhs ?? form.priceAmount ?? "";
      patch({
        audienceScope: nextScope,
        priceCurrency: TOUR_CURRENCY.code,
        priceAmount: ghs,
        priceAmountGhs: ghs,
        priceAmountUsd: "",
        priceLabel: formatTourPriceLabel(ghs || 0, TOUR_CURRENCY.code),
      });
      return;
    }

    if (nextScope === AUDIENCE_SCOPE.FOREIGN) {
      const usd = form.priceAmountUsd ?? (form.priceCurrency === TOUR_CURRENCY_USD.code ? form.priceAmount : "");
      patch({
        audienceScope: nextScope,
        priceCurrency: TOUR_CURRENCY_USD.code,
        priceAmountUsd: usd,
        priceAmountGhs: "",
        priceAmount: usd,
        priceLabel: formatTourPriceLabel(usd || 0, TOUR_CURRENCY_USD.code),
      });
      return;
    }

    patch({
      audienceScope: nextScope,
      priceCurrency: TOUR_CURRENCY.code,
      priceAmountGhs: form.priceAmountGhs ?? form.priceAmount ?? "",
      priceAmountUsd: form.priceAmountUsd ?? "",
      priceAmount: form.priceAmountGhs ?? form.priceAmount ?? "",
      priceLabel: formatTourPriceLabel(form.priceAmountGhs ?? form.priceAmount ?? 0, TOUR_CURRENCY.code),
    });
  }

  function handleScheduleTypeChange(nextType) {
    if (nextType === departureScheduleType) return;
    setFormError("");
    if (nextType === DEPARTURE_SCHEDULE_DATE_RANGE) {
      patch({
        departureScheduleType: nextType,
        departureDates: [createEmptyDateRangeDeparture(18)],
      });
      return;
    }
    patch({
      departureScheduleType: nextType,
      departureDates: [createEmptySpecificDeparture(18)],
    });
  }

  function updateDateRangeDeparture(updates) {
    const current = form.departureDates?.[0] || createEmptyDateRangeDeparture();
    patch({ departureDates: [{ ...current, ...updates }] });
  }

  function handleDateRangeStartChange(startDate) {
    const durationDays = Math.max(1, Number(form.durationDays) || 1);
    const endDate = syncEndDateFromDuration(startDate, durationDays);
    updateDateRangeDeparture({
      date: startDate,
      dateLabel: formatDepartureDateLabel(startDate),
      endDate,
      endDateLabel: formatDepartureDateLabel(endDate),
      label: formatDepartureRangeLabel(startDate, endDate),
    });
  }

  function handleDateRangeEndChange(endDate) {
    const startDate = dateRangeDeparture.date;
    const durationDays = startDate && endDate ? diffDaysBetween(startDate, endDate) : form.durationDays;
    updateDateRangeDeparture({
      endDate,
      endDateLabel: formatDepartureDateLabel(endDate),
      label: formatDepartureRangeLabel(startDate, endDate),
    });
    if (durationDays >= 1) {
      patch({ durationDays, durationLabel: `${durationDays} days` });
    }
  }

  function handleDateRangeDurationChange(value) {
    const durationDays = Math.max(1, Number(value) || 1);
    const endDate = dateRangeDeparture.date
      ? syncEndDateFromDuration(dateRangeDeparture.date, durationDays)
      : dateRangeDeparture.endDate;
    updateDateRangeDeparture({
      endDate,
      endDateLabel: endDate ? formatDepartureDateLabel(endDate) : "",
      label: formatDepartureRangeLabel(dateRangeDeparture.date, endDate),
    });
    patch({ durationDays, durationLabel: `${durationDays} days` });
  }

  function handleDateRangeSlotsChange(value) {
    if (isDateRangeUnlimited) return;
    updateDateRangeDeparture({ spotsTotal: Math.max(1, Number(value) || 1) });
  }

  function handleDateRangeUnlimitedToggle(checked) {
    if (checked) {
      if (!isDateRangeUnlimited) {
        setRangeSlotsBeforeUnlimited(Math.max(1, Number(dateRangeDeparture.spotsTotal) || 18));
      }
      updateDateRangeDeparture({ spotsTotal: UNLIMITED_TOUR_SLOTS });
      return;
    }
    updateDateRangeDeparture({ spotsTotal: rangeSlotsBeforeUnlimited || 18 });
  }

  function updateDeparture(index, updates) {
    const next = [...form.departureDates];
    next[index] = { ...next[index], ...updates };
    patch({ departureDates: next });
  }

  function handleDepartureSpotsTotal(index, spotsTotal) {
    updateDeparture(index, { spotsTotal: Math.max(1, Number(spotsTotal) || 1) });
  }

  function handleAddDeparture() {
    setFormError("");
    patch({
      departureDates: [
        ...form.departureDates,
        createEmptySpecificDeparture(18),
      ],
    });
  }

  function handleCountryChange(countryId) {
    const country = findCountryOption(countryId);
    if (!country) return;
    const themeCategories = form.categories.filter(
      (c) => TOUR_CATEGORY_OPTIONS.some((option) => option.id === c),
    );
    patch({
      countryId: country.id,
      countryCode: country.dialCode,
      country: country.country,
      packageLineId: country.id === "ghana" ? form.packageLineId : "",
      categories: [country.id, ...(country.id === "ghana" && form.packageLineId ? [form.packageLineId] : []), ...themeCategories],
    });
  }

  function handlePackageLineChange(packageLineId) {
    const themeCategories = form.categories.filter(
      (c) => TOUR_CATEGORY_OPTIONS.some((option) => option.id === c),
    );
    patch({
      packageLineId,
      categories: [form.countryId, packageLineId, ...themeCategories],
    });
  }

  function toggleCategory(id) {
    if (isCountryCategoryId(id) || isGhanaPackageLineId(id)) return;
    const has = form.categories.includes(id);
    const themeCategories = has
      ? form.categories.filter((c) => c !== id)
      : [...form.categories, id];
    const nextCategories = [form.countryId];
    if (form.countryId === "ghana" && form.packageLineId) {
      nextCategories.push(form.packageLineId);
    }
    nextCategories.push(...themeCategories.filter((c) => TOUR_CATEGORY_OPTIONS.some((option) => option.id === c)));
    patch({ categories: [...new Set(nextCategories)] });
  }

  function validateStep(index) {
    const stepId = STEPS[index]?.id;
    if (stepId === "basics") {
      if (!form.name.trim()) return "Tour name is required before continuing.";
      if (!(form.locations || []).length) return "Add at least one city to your tour route before continuing.";
      if (form.countryId === "ghana" && !form.packageLineId) {
        return "Select a Ghana package line (Accra, Kumasi, Volta, or End of Year) before continuing.";
      }
    }
    if (stepId === "images") {
      return validateFeatureImagesCollection(form.featureImages) || "";
    }
    if (stepId === "pricing") {
      return validateTourPricing(form) || validateTourSlotAllocation(form);
    }
    return "";
  }

  function goToStep(index) {
    setFormError("");
    setStepIndex(index);
  }

  function handleBack() {
    if (stepIndex > 0) goToStep(stepIndex - 1);
  }

  function handleContinue() {
    const error = validateStep(stepIndex);
    if (error) {
      setFormError(error);
      return;
    }
    const nextIndex = stepIndex + 1;
    window.setTimeout(() => goToStep(nextIndex), 0);
  }

  async function handleSave() {
    for (let i = 0; i < STEPS.length; i += 1) {
      const error = validateStep(i);
      if (error) {
        setFormError(error);
        goToStep(i);
        return;
      }
    }

    setFormError("");
    setSaving(true);
    const payload = buildTourPayload({
      ...form,
      durationLabel: `${form.durationDays} days`,
      priceLabel: formatTourPriceLabel(form.priceAmount, form.priceCurrency),
      highlights: form.highlights.filter(Boolean),
      included: form.included.filter(Boolean),
      notIncluded: form.notIncluded.filter(Boolean),
      featureImages: (form.featureImages || []).filter((img) => img?.uri || img?.data),
      departureDates: form.departureDates.filter((d) => d.date),
    }, { isUpdate });

    try {
      await onSubmit(payload);
    } finally {
      setSaving(false);
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    if (isLastStep) {
      handleSave();
      return;
    }
    handleContinue();
  }


  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div ref={formTopRef} className="scroll-mt-28">
        <ListingStepProgress currentIndex={stepIndex} />
      </div>

      <AnimatePresence mode="wait">
      {step === "basics" && (
        <motion.div key="basics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className={`${sectionClass} grid gap-5 sm:grid-cols-2`}>
          <div className="sm:col-span-2">
            <h2 className="text-xl font-bold text-brand-ink">Tour basics</h2>
            <p className="mt-1 text-sm text-brand-muted">Core details shown on listing cards. URL slug is generated by the backend.</p>
          </div>
          <Field label="Tour name" hint="Displayed on cards and detail pages. URL slug is generated by the backend.">
            <input className={inputClass} value={form.name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="Ghana Heritage Classic" />
          </Field>
          <Field label="Country" hint="Where this tour takes place. Ghana package lines appear when Ghana is selected.">
            <CountrySearchSelect
              value={form.countryId}
              onChange={handleCountryChange}
            />
          </Field>
          <div className="sm:col-span-2">
            <TourLocationRoutePicker
              key={form.countryId}
              value={form.locations || []}
              onChange={(locations) => patch({ locations })}
              countryId={form.countryId}
              error={formError && !(form.locations || []).length ? formError : ""}
            />
          </div>
          <Field label="Duration (days)">
            <input type="number" min={1} className={inputClass} value={form.durationDays} onChange={(e) => patch({ durationDays: Number(e.target.value) })} />
          </Field>
          <Field label="Status">
            <select className={inputClass} value={form.status} onChange={(e) => patch({ status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          {form.countryId === "ghana" ? (
            <div className="sm:col-span-2">
              <p className={labelClass}>Ghana package line</p>
              <p className="mt-1 text-xs text-brand-muted">Primary product category — used for browsing and photo guidance.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {GHANA_PACKAGE_LINE_OPTIONS.map((option) => {
                  const active = form.packageLineId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handlePackageLineChange(option.id)}
                      className={[
                        "rounded-xl border px-4 py-3 text-left transition-all",
                        active
                          ? "border-brand-green bg-brand-green/5 ring-2 ring-brand-green/20"
                          : "border-brand-border bg-white hover:border-brand-green/30",
                      ].join(" ")}
                    >
                      <GuestIcon name={option.iconKey || "mapPin"} className="h-5 w-5 text-brand-green" aria-hidden />
                      <p className="mt-1 text-sm font-bold text-brand-ink">{option.label}</p>
                      <p className="mt-0.5 text-xs text-brand-muted">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <p className={labelClass}>Experience themes</p>
            <p className="mt-1 text-xs text-brand-muted">Optional tags describing the type of experience.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {TOUR_CATEGORY_OPTIONS.map((cat) => {
                const active = form.categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={[
                      "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                      active ? "bg-brand-green text-white" : "bg-brand-cream text-brand-muted ring-1 ring-brand-border",
                    ].join(" ")}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-brand-ink">
              <input type="checkbox" checked={form.featured} onChange={(e) => patch({ featured: e.target.checked })} className="h-4 w-4 rounded border-brand-border text-brand-green" />
              Featured on homepage
            </label>
          </div>
          <Field label="Badge text (optional)">
            <input className={inputClass} value={form.badge} onChange={(e) => patch({ badge: e.target.value })} placeholder="Best seller" />
          </Field>
          <Field label="Badge color">
            <select className={inputClass} value={form.badgeVariant} onChange={(e) => patch({ badgeVariant: e.target.value })}>
              {BADGE_VARIANTS.map((b) => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
          </Field>
        </motion.div>
      )}

      {step === "images" && (
        <motion.div key="images" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className={`${sectionClass} space-y-8`}>
          <div>
            <h2 className="text-xl font-bold text-brand-ink">Images</h2>
            <p className="mt-1 text-sm text-brand-muted">Cover image plus up to five gallery photos — select multiple at once.</p>
          </div>

          {form.countryId === "ghana" && form.packageLineId ? (
            <div className="rounded-xl border border-brand-gold/30 bg-brand-gold/5 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">Photo guidance</p>
              <p className="mt-2 text-sm font-semibold text-brand-ink">
                {GHANA_PACKAGE_LINE_OPTIONS.find((option) => option.id === form.packageLineId)?.label} package
              </p>
              {(() => {
                const hints = getPackageLinePhotoHints(form.packageLineId);
                if (!hints) return null;
                return (
                  <ul className="mt-2 space-y-1.5 text-sm text-brand-muted">
                    <li><span className="font-semibold text-brand-ink">Cover:</span> {hints.cover}</li>
                    <li><span className="font-semibold text-brand-ink">Gallery:</span> {hints.gallery}</li>
                  </ul>
                );
              })()}
            </div>
          ) : null}

          <TourImageField
            label="Cover image"
            hint="Paste a public image URL or upload a file — sent as coverImageUrl in the API payload."
            value={form.coverImage}
            onChange={(coverImage) => patch({ coverImage })}
            uriPlaceholder="https://…/cover.jpg"
          />

          <TourFeatureImagesField
            coverImage={form.coverImage}
            value={form.featureImages || []}
            onChange={(featureImages) => patch({ featureImages })}
            onError={setFormError}
          />
        </motion.div>
      )}

      {step === "content" && (
        <motion.div key="content" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className={`${sectionClass} space-y-5`}>
          <div>
            <h2 className="text-xl font-bold text-brand-ink">Content</h2>
            <p className="mt-1 text-sm text-brand-muted">Description, highlights, and what is included or not.</p>
          </div>
          <Field label="Description">
            <textarea className={`${inputClass} min-h-[120px]`} value={form.description} onChange={(e) => patch({ description: e.target.value })} placeholder="Tell travelers what makes this experience unforgettable…" />
          </Field>
          <div>
            <p className={labelClass}>Highlights</p>
            <div className="mt-2 space-y-2">
              {form.highlights.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className={inputClass}
                    value={item}
                    onChange={(e) => patch({ highlights: updateListItem(form.highlights, i, e.target.value) })}
                    placeholder={`Highlight ${i + 1}`}
                  />
                  {form.highlights.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => patch({ highlights: form.highlights.filter((_, idx) => idx !== i) })}
                      className="shrink-0 rounded-lg p-2 text-brand-muted transition-colors hover:bg-red-50 hover:text-red-500"
                      aria-label={`Remove highlight ${i + 1}`}
                    >
                      <X className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </button>
                  ) : null}
                </div>
              ))}
              <button type="button" onClick={() => patch({ highlights: [...form.highlights, ""] })} className="text-xs font-semibold text-brand-green hover:underline">+ Add highlight</button>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Field label="What's included" hint={INCLUSION_ITEM_HINT}>
                <div className="space-y-2">
                {form.included.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className={inputClass}
                      value={item}
                      onChange={(e) => patch({ included: updateListItem(form.included, i, e.target.value) })}
                      placeholder={INCLUSION_ITEM_PLACEHOLDER}
                    />
                    {form.included.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => patch({ included: form.included.filter((_, idx) => idx !== i) })}
                        className="shrink-0 rounded-lg p-2 text-brand-muted transition-colors hover:bg-red-50 hover:text-red-500"
                        aria-label={`Remove included item ${i + 1}`}
                      >
                        <X className="h-4 w-4" strokeWidth={2} aria-hidden />
                      </button>
                    ) : null}
                  </div>
                ))}
                <button type="button" onClick={() => patch({ included: [...form.included, ""] })} className="text-xs font-semibold text-brand-green hover:underline">+ Add item</button>
                </div>
              </Field>
            </div>
            <div>
              <Field label="Not included (paid separately)" hint={EXCLUSION_ITEM_HINT}>
                <div className="space-y-2">
                {form.notIncluded.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className={inputClass}
                      value={item}
                      onChange={(e) => patch({ notIncluded: updateListItem(form.notIncluded, i, e.target.value) })}
                      placeholder={EXCLUSION_ITEM_PLACEHOLDER}
                    />
                    {form.notIncluded.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => patch({ notIncluded: form.notIncluded.filter((_, idx) => idx !== i) })}
                        className="shrink-0 rounded-lg p-2 text-brand-muted transition-colors hover:bg-red-50 hover:text-red-500"
                        aria-label={`Remove not included item ${i + 1}`}
                      >
                        <X className="h-4 w-4" strokeWidth={2} aria-hidden />
                      </button>
                    ) : null}
                  </div>
                ))}
                <button type="button" onClick={() => patch({ notIncluded: [...form.notIncluded, ""] })} className="text-xs font-semibold text-brand-green hover:underline">+ Add item</button>
                </div>
              </Field>
            </div>
          </div>
        </motion.div>
      )}

      {step === "itinerary" && (
        <motion.div key="itinerary" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className={`${sectionClass} space-y-4`}>
          <div>
            <h2 className="text-xl font-bold text-brand-ink">Itinerary <span className="text-sm font-normal text-brand-muted">(optional)</span></h2>
            <p className="mt-1 text-sm text-brand-muted">
              Add a day-by-day plan if you have one. Skip this step or leave days blank — we&apos;ll save an empty itinerary.
            </p>
          </div>
          {form.itinerary.length === 0 ? (
            <div className="rounded-xl border border-dashed border-brand-border/80 bg-brand-cream/40 px-4 py-8 text-center">
              <p className="text-sm font-semibold text-brand-ink">No itinerary days yet</p>
              <p className="mt-1 text-xs text-brand-muted">Optional — add days below or continue without one.</p>
            </div>
          ) : null}
          {form.itinerary.map((day, i) => (
            <div key={i} className="rounded-xl border border-brand-border/60 bg-brand-cream/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-brand-ink">Itinerary entry {i + 1}</p>
                <button type="button" onClick={() => patch({ itinerary: form.itinerary.filter((_, idx) => idx !== i) })} className="text-xs font-semibold text-red-500 hover:underline">Remove day</button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-[9rem_1fr]">
                <Field
                  label="Day number"
                  hint="1 = arrival · 10 = departure"
                  hintClassName="whitespace-nowrap"
                >
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={day.day}
                    onChange={(e) => {
                      const next = [...form.itinerary];
                      next[i] = { ...day, day: Number(e.target.value) };
                      patch({ itinerary: next });
                    }}
                    placeholder="1"
                  />
                </Field>
                <Field label="Day title" hint="Short headline shown in the itinerary — e.g. “Welcome to Accra”.">
                  <input
                    className={inputClass}
                    value={day.title}
                    onChange={(e) => {
                      const next = [...form.itinerary];
                      next[i] = { ...day, title: e.target.value };
                      patch({ itinerary: next });
                    }}
                    placeholder="Welcome to Accra"
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Day description" hint="What travelers do this day — activities, meals, transfers, and highlights.">
                  <textarea
                    className={`${inputClass} min-h-[100px]`}
                    value={day.description}
                    onChange={(e) => {
                      const next = [...form.itinerary];
                      next[i] = { ...day, description: e.target.value };
                      patch({ itinerary: next });
                    }}
                    placeholder="Meet your guide, settle in, and enjoy a welcome dinner with a full trip briefing."
                  />
                </Field>
              </div>
              <div className="mt-4">
                <ItineraryDayImageField
                  dayNumber={day.day || i + 1}
                  value={day.image}
                  onChange={(image) => {
                    const next = [...form.itinerary];
                    next[i] = { ...day, image };
                    patch({ itinerary: next });
                  }}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              patch({
                itinerary: [
                  ...form.itinerary,
                  {
                    day: form.itinerary.length + 1,
                    title: "",
                    description: "",
                    image: { uri: "", data: "", mimeType: "image/jpeg" },
                  },
                ],
              })
            }
            className="text-sm font-semibold text-brand-green hover:underline"
          >
            + Add day
          </button>
        </motion.div>
      )}

      {step === "pricing" && (
        <motion.div key="pricing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className={`${sectionClass} space-y-6`}>
          <div>
            <h2 className="text-xl font-bold text-brand-ink">Pricing & departures</h2>
            <p className="mt-1 text-sm text-brand-muted">
              Set your tour price and schedule when travelers can book.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-brand-green/20 bg-brand-green/5 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
            <p className="text-xs leading-relaxed text-brand-muted">
              <span className="font-semibold text-brand-ink">How this works:</span> Choose a{" "}
              <span className="font-semibold text-brand-ink">date range</span> for one continuous window
              (ideal for hotel stays and flexible trips), or add{" "}
              <span className="font-semibold text-brand-ink">specific departure dates</span> for fixed trip starts.
            </p>
          </div>

          <div>
            <p className={labelClass}>Who is this tour for?</p>
            <p className="mt-1 text-[11px] text-brand-muted">
              Choose whether this tour targets Ghana-based travelers, international buyers, or both.
            </p>
            <div className="mt-3 grid gap-3 lg:grid-cols-3 sm:grid-cols-2">
              {AUDIENCE_SCOPE_OPTIONS.map((option) => {
                const active = audienceScope === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleAudienceScopeChange(option.id)}
                    className={[
                      "rounded-xl border px-4 py-4 text-left transition-all",
                      active
                        ? "border-brand-green bg-brand-green/5 ring-2 ring-brand-green/20"
                        : "border-brand-border bg-white hover:border-brand-green/30",
                    ].join(" ")}
                  >
                    <p className="text-sm font-bold text-brand-ink">{option.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-brand-muted">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {isGlobalAudience ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Price for Ghana (GHS)"
                hint="Local buyers — charged via Paystack in Ghana Cedis."
              >
                <input
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  className={inputClass}
                  value={form.priceAmountGhs ?? form.priceAmount ?? ""}
                  onChange={(e) => handlePriceGhsChange(e.target.value)}
                />
              </Field>
              <Field
                label="Price for international (USD)"
                hint="Foreign buyers — charged via Stripe in US Dollars."
              >
                <input
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  className={inputClass}
                  value={form.priceAmountUsd ?? ""}
                  onChange={(e) => handlePriceUsdChange(e.target.value)}
                />
              </Field>
            </div>
          ) : isForeignAudience ? (
            <Field
              label="Price (USD)"
              hint={`Displayed as ${formatTourPriceLabel((form.priceAmountUsd ?? form.priceAmount) || 0, TOUR_CURRENCY_USD.code)} on your listing.`}
            >
              <input
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                className={inputClass}
                value={form.priceAmountUsd ?? form.priceAmount ?? ""}
                onChange={(e) => handlePriceUsdChange(e.target.value)}
              />
            </Field>
          ) : (
            <Field
              label="Price (GHS)"
              hint={`Displayed as ${formatTourPriceLabel((form.priceAmountGhs ?? form.priceAmount) || 0, priceCurrency)} on your listing.`}
            >
              <input
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                className={inputClass}
                value={form.priceAmountGhs ?? form.priceAmount ?? ""}
                onChange={(e) => handlePriceChange(e.target.value)}
              />
            </Field>
          )}

          <div>
            <p className={labelClass}>Scheduled departures</p>
            <p className="mt-1 text-[11px] text-brand-muted">Choose how travelers can book this tour.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {DEPARTURE_SCHEDULE_OPTIONS.map((option) => {
                const active = departureScheduleType === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleScheduleTypeChange(option.id)}
                    className={[
                      "rounded-xl border px-4 py-4 text-left transition-all",
                      active
                        ? "border-brand-green bg-brand-green/5 ring-2 ring-brand-green/20"
                        : "border-brand-border bg-white hover:border-brand-green/30",
                    ].join(" ")}
                  >
                    <p className="text-sm font-bold text-brand-ink">{option.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-brand-muted">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {isDateRangeSchedule ? (
            <div className="rounded-xl border border-brand-border/60 bg-brand-cream/40 p-4">
              <p className="text-sm font-bold text-brand-ink">Date range window</p>
              <p className="mt-1 text-[11px] text-brand-muted">
                Set duration, start and end dates, and how many slots are available for this window.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Duration (days)" hint="Updates the end date when a start date is set.">
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={form.durationDays}
                    onChange={(e) => handleDateRangeDurationChange(e.target.value)}
                  />
                </Field>
                <Field label="Start date" hint="When this tour window opens.">
                  <input
                    type="date"
                    className={inputClass}
                    value={dateRangeDeparture.date}
                    onChange={(e) => handleDateRangeStartChange(e.target.value)}
                  />
                </Field>
                <Field label="End date" hint="When this tour window closes.">
                  <input
                    type="date"
                    className={inputClass}
                    value={dateRangeDeparture.endDate || ""}
                    min={dateRangeDeparture.date || undefined}
                    onChange={(e) => handleDateRangeEndChange(e.target.value)}
                  />
                </Field>
                <Field
                  label="Slots available"
                  hint={
                    isDateRangeUnlimited
                      ? "Unlimited capacity — saved as 9999 slots in the system."
                      : "How many travelers can book within this date range."
                  }
                >
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={isDateRangeUnlimited ? "" : dateRangeDeparture.spotsTotal ?? 18}
                    onChange={(e) => handleDateRangeSlotsChange(Number(e.target.value))}
                    placeholder={isDateRangeUnlimited ? "Unlimited" : "18"}
                    disabled={isDateRangeUnlimited}
                  />
                </Field>
              </div>
              <label className="mt-4 inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-brand-border/60 bg-white px-4 py-3 text-sm text-brand-ink">
                <input
                  type="checkbox"
                  checked={isDateRangeUnlimited}
                  onChange={(e) => handleDateRangeUnlimitedToggle(e.target.checked)}
                  className="h-4 w-4 rounded border-brand-border text-brand-green focus:ring-brand-green/30"
                />
                <span>
                  <span className="font-semibold">Unlimited capacity</span>
                  <span className="mt-0.5 block text-xs text-brand-muted">No fixed slot limit for this window.</span>
                </span>
              </label>
              {dateRangeDeparture.date && dateRangeDeparture.endDate ? (
                <p className="mt-4 text-[11px] text-brand-muted">
                  Preview:{" "}
                  <span className="font-semibold text-brand-ink">
                    {formatDepartureRangeLabel(dateRangeDeparture.date, dateRangeDeparture.endDate)}
                  </span>
                  {" · "}
                  {form.durationDays} days
                  {" · "}
                  {isDateRangeUnlimited ? "Unlimited slots" : `${dateRangeDeparture.spotsTotal} slots`}
                </p>
              ) : null}
            </div>
          ) : (
            <div>
              <p className="text-[11px] text-brand-muted">Add every fixed date this tour departs.</p>
              <div className="mt-4 space-y-4">
                {form.departureDates.map((dep, i) => (
                  <div key={i} className="rounded-xl border border-brand-border/60 bg-brand-cream/40 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-brand-ink">Departure {i + 1}</p>
                      {form.departureDates.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => patch({ departureDates: form.departureDates.filter((_, idx) => idx !== i) })}
                          className="text-xs font-semibold text-red-500 hover:underline"
                        >
                          Remove date
                        </button>
                      ) : null}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Departure date" hint="When this trip leaves.">
                        <input
                          type="date"
                          className={inputClass}
                          value={dep.date}
                          onChange={(e) => updateDeparture(i, {
                            date: e.target.value,
                            dateLabel: formatDepartureDateLabel(e.target.value),
                          })}
                        />
                      </Field>
                      <Field label="Slots available" hint="Seats available for this departure date.">
                        <input
                          type="number"
                          min={1}
                          className={inputClass}
                          value={dep.spotsTotal}
                          onChange={(e) => handleDepartureSpotsTotal(i, Number(e.target.value))}
                          placeholder="18"
                        />
                      </Field>
                    </div>
                    {dep.date ? (
                      <p className="mt-3 text-[11px] text-brand-muted">
                        Preview: <span className="font-semibold text-brand-ink">{dep.dateLabel || formatDepartureDateLabel(dep.date)}</span>
                        {" · "}
                        {dep.spotsTotal} slots
                      </p>
                    ) : null}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddDeparture}
                  className="text-sm font-semibold text-brand-green hover:underline"
                >
                  + Add another departure date
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {step === "booking" && (
        <motion.div key="booking" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: EASE }} className={`${sectionClass} grid gap-5 sm:grid-cols-2`}>
          <div className="sm:col-span-2">
            <h2 className="text-xl font-bold text-brand-ink">Booking rules</h2>
            <p className="mt-1 text-sm text-brand-muted">Payment options for this listing.</p>
          </div>
          <Field label="Deposit % (online)">
            <input type="number" min={0} max={100} className={inputClass} value={form.bookingSettings.depositPercent} onChange={(e) => patch({ bookingSettings: { ...form.bookingSettings, depositPercent: Number(e.target.value) } })} />
          </Field>
          <div className="flex flex-col gap-3 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-brand-ink">
              <input type="checkbox" checked={form.bookingSettings.onlinePaymentAllowed} onChange={(e) => patch({ bookingSettings: { ...form.bookingSettings, onlinePaymentAllowed: e.target.checked } })} className="h-4 w-4 rounded border-brand-border text-brand-green" />
              Allow online payment (gateway redirect)
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-brand-ink">
              <input type="checkbox" checked={form.bookingSettings.payOnSiteAllowed} onChange={(e) => patch({ bookingSettings: { ...form.bookingSettings, payOnSiteAllowed: e.target.checked } })} className="h-4 w-4 rounded border-brand-border text-brand-green" />
              Allow pay on-site reservation
            </label>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-border/70 bg-white/95 p-5 shadow-lg backdrop-blur-sm">
        <div className="min-w-0 flex-1">
          {formError ? (
            <p className="text-sm font-medium text-red-500">{formError}</p>
          ) : (
            <p className="text-sm text-brand-muted">
              {isLastStep
                ? "Review booking rules, then save your listing."
                : `Complete this section, then continue to ${nextStep?.label}.`}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to={ROUTES.operator.tours} className="btn-secondary">Cancel</Link>
          {stepIndex > 0 && (
            <button type="button" onClick={handleBack} className="btn-secondary inline-flex items-center gap-1.5">
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              Back
            </button>
          )}
          {isLastStep ? (
            <button type="button" onClick={handleSave} disabled={saving || !form.name.trim()} className="btn-primary">
              {saving ? "Saving…" : submitLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContinue}
              className="btn-primary inline-flex items-center gap-1.5"
            >
              Continue to {nextStep?.label}
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
