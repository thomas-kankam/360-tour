import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Loader2,
  Luggage,
  MapPin,
  Minus,
  Pencil,
  Plus,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import consumerBookingsServiceApi from "../../apis/ConsumerBookingsServiceApi";
import Container from "../../components/layout/Container";
import PaymentRegionNotice from "../../components/payments/PaymentRegionNotice";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { usePaymentRegion } from "../../hooks/usePaymentRegion";
import {
  buildUpdateBookingPayload,
  canEditBooking,
  clampGroupTravelers,
  computeBookingSubtotal,
  formatBookingCurrency,
  getGroupTravelerLimits,
  mapBookingToEditForm,
  resolveBookingPricing,
  resolveTourUnitPrice,
} from "../../utils/bookingHelpers";
import { redirectToPaymentCheckout } from "../../utils/paymentHelpers";
import {
  validateEmail,
  validatePhone,
  validateRequired,
} from "../../utils/bookingValidation";

const EASE = [0.16, 1, 0.3, 1];

const STEPS = [
  { id: "trip", label: "Trip" },
  { id: "traveler", label: "Traveler" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
];

const GROUP_TYPES = [
  { id: "university", label: "University / School" },
  { id: "corporate", label: "Corporate" },
  { id: "family", label: "Family & Friends" },
  { id: "other", label: "Other organisation" },
];

const BOOKING_TYPE_OPTIONS = [
  {
    id: "individual",
    label: "Individual",
    desc: "Just you or one traveler on your behalf",
    Icon: Luggage,
  },
  {
    id: "group",
    label: "Group",
    desc: "Others are joining — universities, families, or teams",
    Icon: Users,
  },
];

function StepProgress({ currentIndex }) {
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={step.id} className="flex flex-1 items-center gap-1">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all",
                  done ? "bg-brand-green text-white" : active ? "bg-brand-primary text-white ring-4 ring-brand-primary/15" : "bg-brand-border/50 text-brand-muted",
                ].join(" ")}
              >
                {done ? "✓" : i + 1}
              </div>
              <span className={`hidden truncate text-[10px] font-semibold sm:block ${active ? "text-brand-ink" : "text-brand-muted"}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 ? <div className={`mb-4 h-px flex-1 ${done ? "bg-brand-green" : "bg-brand-border/60"}`} /> : null}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, id, error, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-brand-ink">
        {label}{required ? <span className="text-brand-orange"> *</span> : null}
      </label>
      {children}
      {error ? <p className="text-[11px] font-medium text-red-500">{error}</p> : null}
    </div>
  );
}

function inputClass(error) {
  return [
    "h-11 w-full rounded-xl border bg-white px-4 text-sm outline-none transition-all",
    error ? "border-red-400 ring-2 ring-red-100" : "border-brand-border/70 focus:border-brand-green/50 focus:ring-2 focus:ring-brand-green/15",
  ].join(" ");
}

function BookingSummary({ tour, form, subtotal, bookingRef, initialSubtotal, currency, unitPrice }) {
  const departure = (tour.departureDates || []).find((dep) => dep.date === form.selectedDate);
  const resolvedUnitPrice = unitPrice ?? resolveTourUnitPrice(tour);
  const resolvedCurrency = currency ?? tour.priceCurrency ?? "GHS";
  const travelers = form.bookingType === "group" ? form.travelers : 1;
  const amountChanged = initialSubtotal != null && initialSubtotal !== subtotal;

  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-brand-border/60 bg-white shadow-sm">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={tour.image} alt={tour.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <p className="font-mono text-[10px] font-bold text-brand-gold">{bookingRef}</p>
          <p className="text-base font-bold text-white">{tour.name}</p>
        </div>
      </div>
      <div className="space-y-2.5 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-brand-muted">Booking type</span>
          <span className="font-semibold capitalize text-brand-ink">{form.bookingType}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-brand-muted">Departure</span>
          <span className="text-right font-semibold text-brand-ink">{departure?.dateLabel || form.selectedDate || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-muted">Travelers</span>
          <span className="font-semibold text-brand-ink">{travelers}</span>
        </div>
        <div className="flex justify-between border-t border-brand-border/50 pt-2.5">
          <span className="font-semibold text-brand-ink">Updated total</span>
          <span className="text-lg font-bold text-brand-green">{formatBookingCurrency(subtotal, resolvedCurrency)}</span>
        </div>
        {amountChanged ? (
          <p className="text-[11px] text-brand-orange">
            Was {formatBookingCurrency(initialSubtotal, resolvedCurrency)} · recomputed for {travelers} {travelers === 1 ? "traveler" : "travelers"}
          </p>
        ) : (
          <p className="text-[11px] text-brand-muted">{formatBookingCurrency(resolvedUnitPrice, resolvedCurrency)} per person</p>
        )}
      </div>
    </div>
  );
}

export default function MyBookingEditPage() {
  const { bookingCode } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const {
    region: paymentRegion,
    isLoading: paymentRegionLoading,
    isOverridden: paymentRegionOverridden,
    selectDomesticRegion,
    selectInternationalRegion,
    resolveRegionForSubmit,
  } = usePaymentRegion();

  const [tour, setTour] = useState(null);
  const [bookingRef, setBookingRef] = useState("");
  const [initialPaymentMode, setInitialPaymentMode] = useState("onsite");
  const [initialSubtotal, setInitialSubtotal] = useState(null);
  const [initialBookingType, setInitialBookingType] = useState("individual");
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [step, setStep] = useState("trip");
  const [touched, setTouched] = useState({});
  const [processing, setProcessing] = useState(false);
  const formTopRef = useRef(null);

  const loadBooking = useCallback(async () => {
    if (!token || !bookingCode) return;

    setLoading(true);
    setBlocked(false);

    const result = await consumerBookingsServiceApi.getBooking(token, bookingCode);
    setLoading(false);

    if (!result.ok || !result.booking) {
      setBlocked(true);
      return;
    }

    if (!canEditBooking(result.booking)) {
      setBlocked(true);
      toast.info("This booking can no longer be edited.");
      return;
    }

    if (!result.tourDetail) {
      setBlocked(true);
      toast.error("Tour details unavailable for this booking.");
      return;
    }

    const apiBooking = result.apiBooking || {};
    const editForm = mapBookingToEditForm(apiBooking);
    setTour(result.tourDetail);
    setBookingRef(result.booking.bookingCode || result.booking.bookingRef);
    setInitialPaymentMode(apiBooking.paymentMode === "online" ? "online" : "onsite");
    setInitialBookingType(editForm.bookingType);
    setInitialSubtotal(result.booking.subtotal ?? computeBookingSubtotal(
      result.tourDetail,
      editForm.bookingType === "group" ? editForm.travelers : 1,
    ));
    setForm(editForm);
  }, [token, bookingCode]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  useEffect(() => {
    if (step === "trip" && loading) return;
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step, loading]);

  const groupLimits = useMemo(() => getGroupTravelerLimits(tour), [tour]);
  const travelerCount = form?.bookingType === "group" ? clampGroupTravelers(form.travelers, tour) : 1;
  const bookingPricing = useMemo(
    () => (tour && form ? resolveBookingPricing(tour, travelerCount, paymentRegion) : { subtotal: 0, unitPrice: 0, currency: "GHS" }),
    [tour, form, travelerCount, paymentRegion],
  );
  const subtotal = bookingPricing.subtotal;
  const chargeCurrency = bookingPricing.currency;
  const paymentChanged = form && form.paymentMode !== initialPaymentMode;
  const bookingTypeChanged = form && form.bookingType !== initialBookingType;
  const amountChanged = initialSubtotal != null && subtotal !== initialSubtotal;

  const errors = useMemo(() => {
    if (!form) return {};
    return {
      bookingType: !form.bookingType ? "Select individual or group booking" : "",
      firstName: validateRequired(form.firstName, "First name"),
      lastName: validateRequired(form.lastName, "Last name"),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      selectedDate: !form.selectedDate ? "Select a departure date" : "",
      travelers:
        form.bookingType === "group" && form.travelers < groupLimits.min
          ? `Minimum ${groupLimits.min} travelers`
          : form.bookingType === "group" && form.travelers > groupLimits.max
            ? `Maximum ${groupLimits.max} travelers`
            : "",
      groupName: form.bookingType === "group" ? validateRequired(form.groupName, "Group name") : "",
      groupType: form.bookingType === "group" && !form.groupType ? "Select a group type" : "",
      paymentMode: !form.paymentMode ? "Choose a payment option" : "",
    };
  }, [form, groupLimits]);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const update = useCallback((field, value) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  }, []);

  const touch = useCallback((field) => {
    setTouched((t) => ({ ...t, [field]: true }));
  }, []);

  const touchFields = useCallback((fields) => {
    setTouched((t) => {
      const next = { ...t };
      fields.forEach((f) => { next[f] = true; });
      return next;
    });
  }, []);

  const handleBookingTypeChange = useCallback((type) => {
    setForm((current) => {
      if (!current || current.bookingType === type) return current;

      if (type === "individual") {
        return {
          ...current,
          bookingType: "individual",
          travelers: 1,
          groupName: "",
          groupType: "",
          organization: "",
        };
      }

      const min = getGroupTravelerLimits(tour).min;
      return {
        ...current,
        bookingType: "group",
        travelers: current.bookingType === "group"
          ? clampGroupTravelers(current.travelers, tour)
          : Math.max(min, 2),
      };
    });
    setTouched((t) => ({ ...t, bookingType: true }));
  }, [tour]);

  function showError(field) {
    return touched[field] ? errors[field] : "";
  }

  function handleTripNext(e) {
    e.preventDefault();
    const fields = ["selectedDate", "bookingType"];
    if (form.bookingType === "group") fields.push("travelers", "groupName", "groupType");
    touchFields(fields);
    if (errors.bookingType || errors.selectedDate || errors.travelers || errors.groupName || errors.groupType) return;
    setStep("traveler");
  }

  function handleTravelerNext(e) {
    e.preventDefault();
    touchFields(["firstName", "lastName", "email", "phone"]);
    if (errors.firstName || errors.lastName || errors.email || errors.phone) return;
    if (!form.firstName || !form.lastName || !form.email || !form.phone) return;
    setStep("payment");
  }

  function handlePaymentSelect(mode) {
    update("paymentMode", mode);
    setStep("review");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token || !tour || !form || processing) return;

    touch("paymentMode");
    if (!form.paymentMode) return;

    setProcessing(true);
    const region = await resolveRegionForSubmit();
    const payload = buildUpdateBookingPayload(form, tour, region);
    const result = await consumerBookingsServiceApi.updateBooking(token, bookingCode, payload);
    setProcessing(false);

    if (!result.ok || !result.booking) {
      toast.error(result.reason || result.message || "Could not update booking.");
      return;
    }

    if (form.paymentMode === "online") {
      const redirected = redirectToPaymentCheckout(result, {
        onMissing: () => {
          toast.success("Booking updated. Complete payment from My bookings when ready.");
          navigate(ROUTES.myBookingDetail(bookingCode), { replace: true });
        },
      });

      if (redirected) {
        toast.success("Booking updated — redirecting to checkout…");
        return;
      }
      return;
    }

    toast.success("Booking updated successfully.");
    navigate(ROUTES.myBookingDetail(bookingCode), { replace: true });
  }

  if (!bookingCode) {
    return <Navigate to={ROUTES.myBookings} replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-brand-cream">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" strokeWidth={2} aria-hidden />
      </div>
    );
  }

  if (blocked || !form || !tour) {
    return (
      <Container className="py-16 text-center">
        <p className="text-brand-muted">This booking cannot be edited.</p>
        <Link to={ROUTES.myBookings} className="mt-4 inline-block text-sm font-semibold text-brand-green hover:underline">
          Back to my bookings
        </Link>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pb-16">
      <section className="border-b border-brand-green/15 bg-brand-green py-4">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Link
                to={ROUTES.myBookingDetail(bookingCode)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/75 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                Back to booking
              </Link>
              <div className="mt-2 flex items-center gap-2">
                <Pencil className="h-4 w-4 text-brand-gold" strokeWidth={2} aria-hidden />
                <h1 className="text-lg font-bold text-white sm:text-xl">Update reservation</h1>
              </div>
              <p className="mt-0.5 text-xs text-white/70">Adjust trip details or switch to online payment</p>
            </div>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-[11px] font-bold text-brand-gold">
              {bookingRef}
            </span>
          </div>
        </Container>
      </section>

      <Container className="mt-6">
        <div ref={formTopRef} className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            <StepProgress currentIndex={stepIndex} />

            <AnimatePresence mode="wait">
              {step === "trip" && (
                <motion.form
                  key="trip"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  onSubmit={handleTripNext}
                  className="mt-6 space-y-5 rounded-[1.5rem] border border-brand-border/60 bg-white p-5 shadow-sm sm:p-7"
                >
                  <div>
                    <h2 className="text-lg font-bold text-brand-ink">Trip details</h2>
                    <p className="mt-1 text-sm text-brand-muted">
                      Switch to a group booking if others are joining — your total updates automatically.
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-brand-ink">Who is travelling?</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {BOOKING_TYPE_OPTIONS.map(({ id, label, desc, Icon }) => {
                        const active = form.bookingType === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => handleBookingTypeChange(id)}
                            className={[
                              "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                              active
                                ? "border-brand-green bg-brand-green/5 ring-2 ring-brand-green/10"
                                : "border-brand-border/70 hover:border-brand-green/35 hover:bg-brand-cream/50",
                            ].join(" ")}
                          >
                            <div className={[
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                              active ? "bg-brand-green text-white" : "bg-brand-cream text-brand-green",
                            ].join(" ")}>
                              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                            </div>
                            <div>
                              <p className="font-bold text-brand-ink">{label}</p>
                              <p className="mt-0.5 text-[11px] leading-relaxed text-brand-muted">{desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {showError("bookingType") ? <p className="mt-2 text-[11px] font-medium text-red-500">{showError("bookingType")}</p> : null}
                  </div>

                  <Field label="Departure date" id="selectedDate" error={showError("selectedDate")} required>
                    <select
                      id="selectedDate"
                      value={form.selectedDate}
                      onChange={(e) => update("selectedDate", e.target.value)}
                      onBlur={() => touch("selectedDate")}
                      className={inputClass(showError("selectedDate"))}
                    >
                      <option value="">Select a date</option>
                      {(tour.departureDates || []).map((dep) => (
                        <option key={dep.date} value={dep.date}>
                          {dep.dateLabel}{dep.label ? ` · ${dep.label}` : ""}{dep.spotsLeft != null ? ` · ${dep.spotsLeft} spots left` : ""}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {form.bookingType === "group" ? (
                    <>
                      <Field label="Group name" id="groupName" error={showError("groupName")} required>
                        <input id="groupName" value={form.groupName} onChange={(e) => update("groupName", e.target.value)} onBlur={() => touch("groupName")} className={inputClass(showError("groupName"))} />
                      </Field>
                      <Field label="Group type" id="groupType" error={showError("groupType")} required>
                        <select id="groupType" value={form.groupType} onChange={(e) => update("groupType", e.target.value)} onBlur={() => touch("groupType")} className={inputClass(showError("groupType"))}>
                          <option value="">Select type</option>
                          {GROUP_TYPES.map((type) => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Travelers" id="travelers" error={showError("travelers")} required>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => update("travelers", clampGroupTravelers(form.travelers - 1, tour))} className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-white text-brand-ink hover:border-brand-green/40">
                            <Minus className="h-4 w-4" strokeWidth={2} aria-hidden />
                          </button>
                          <input id="travelers" readOnly value={travelerCount} className="h-10 w-16 rounded-xl border border-brand-border bg-brand-cream/50 text-center text-sm font-bold" />
                          <button type="button" onClick={() => update("travelers", clampGroupTravelers(form.travelers + 1, tour))} className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-white text-brand-ink hover:border-brand-green/40">
                            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
                          </button>
                          <span className="text-xs text-brand-muted">{groupLimits.min}–{groupLimits.max} travelers</span>
                        </div>
                        <p className="mt-2 text-[11px] text-brand-muted">
                          {formatBookingCurrency(resolveTourUnitPrice(tour), tour.priceCurrency)} × {travelerCount} ={" "}
                          <span className="font-semibold text-brand-green">{formatBookingCurrency(subtotal, tour.priceCurrency)}</span>
                        </p>
                      </Field>
                      <Field label="Organisation" id="organization">
                        <input id="organization" value={form.organization} onChange={(e) => update("organization", e.target.value)} className={inputClass("")} placeholder="Optional — school or company name" />
                      </Field>
                    </>
                  ) : (
                    <div className="rounded-xl border border-brand-border/50 bg-brand-cream/40 px-4 py-3 text-sm">
                      <p className="text-brand-muted">
                        Individual booking · <span className="font-semibold text-brand-ink">1 traveler</span>
                      </p>
                      <p className="mt-1 text-[11px] text-brand-muted">
                        Need others to join? Switch to <strong className="text-brand-ink">Group</strong> above.
                      </p>
                    </div>
                  )}

                  <Field label="Special requests" id="specialRequests">
                    <textarea id="specialRequests" rows={3} value={form.specialRequests} onChange={(e) => update("specialRequests", e.target.value)} className={`${inputClass("")} min-h-[88px] resize-none py-3`} placeholder="Room preferences, accessibility needs…" />
                  </Field>

                  <Field label="Dietary needs" id="dietaryNeeds">
                    <textarea id="dietaryNeeds" rows={2} value={form.dietaryNeeds} onChange={(e) => update("dietaryNeeds", e.target.value)} className={`${inputClass("")} min-h-[72px] resize-none py-3`} placeholder="Halal, vegetarian, allergies…" />
                  </Field>

                  <div className="flex justify-end pt-1">
                    <button type="submit" className="rounded-xl bg-brand-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-green-dark">
                      Continue
                    </button>
                  </div>
                </motion.form>
              )}

              {step === "traveler" && (
                <motion.form
                  key="traveler"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  onSubmit={handleTravelerNext}
                  className="mt-6 space-y-5 rounded-[1.5rem] border border-brand-border/60 bg-white p-5 shadow-sm sm:p-7"
                >
                  <div>
                    <h2 className="text-lg font-bold text-brand-ink">Lead traveler</h2>
                    <p className="mt-1 text-sm text-brand-muted">We&apos;ll send updates and your receipt here.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="First name" id="firstName" error={showError("firstName")} required>
                      <input id="firstName" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} onBlur={() => touch("firstName")} className={inputClass(showError("firstName"))} />
                    </Field>
                    <Field label="Last name" id="lastName" error={showError("lastName")} required>
                      <input id="lastName" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} onBlur={() => touch("lastName")} className={inputClass(showError("lastName"))} />
                    </Field>
                  </div>
                  <Field label="Email" id="email" error={showError("email")} required>
                    <input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} onBlur={() => touch("email")} className={inputClass(showError("email"))} />
                  </Field>
                  <Field label="Phone" id="phone" error={showError("phone")} required>
                    <input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} onBlur={() => touch("phone")} className={inputClass(showError("phone"))} />
                  </Field>
                  <Field label="Nationality" id="nationality">
                    <input id="nationality" value={form.nationality} onChange={(e) => update("nationality", e.target.value)} className={inputClass("")} placeholder="Optional" />
                  </Field>

                  <div className="flex justify-between pt-1">
                    <button type="button" onClick={() => setStep("trip")} className="text-sm font-semibold text-brand-muted hover:text-brand-ink">← Back</button>
                    <button type="submit" className="rounded-xl bg-brand-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-green-dark">Continue</button>
                  </div>
                </motion.form>
              )}

              {step === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="mt-6 space-y-4 rounded-[1.5rem] border border-brand-border/60 bg-white p-5 shadow-sm sm:p-7"
                >
                  <div>
                    <h2 className="text-lg font-bold text-brand-ink">How would you like to pay?</h2>
                    <p className="mt-1 text-sm text-brand-muted">You can keep paying on site or switch to secure online checkout.</p>
                  </div>

                  {tour.onlinePaymentAllowed !== false ? (
                    <>
                      <PaymentRegionNotice
                        region={paymentRegion}
                        isLoading={paymentRegionLoading}
                        isOverridden={paymentRegionOverridden}
                        onSelectDomestic={selectDomesticRegion}
                        onSelectInternational={selectInternationalRegion}
                      />
                      <button
                      type="button"
                      onClick={() => handlePaymentSelect("online")}
                      className="group flex w-full items-start gap-4 rounded-2xl border-2 border-brand-border/70 p-5 text-left transition-all hover:border-brand-green hover:bg-brand-green/5"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
                        <CreditCard className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-brand-ink group-hover:text-brand-green">Pay online now</p>
                        <p className="mt-1 text-xs text-brand-muted">Redirect to Paystack — instant confirmation and receipt.</p>
                        <p className="mt-2 text-sm font-bold text-brand-green">{formatBookingCurrency(subtotal, chargeCurrency)}</p>
                      </div>
                    </button>
                    </>
                  ) : null}

                  {tour.payOnSiteAllowed !== false ? (
                    <button
                      type="button"
                      onClick={() => handlePaymentSelect("onsite")}
                      className="group flex w-full items-start gap-4 rounded-2xl border-2 border-brand-border/70 p-5 text-left transition-all hover:border-brand-orange hover:bg-brand-orange/5"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                        <Store className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-brand-ink group-hover:text-brand-orange">Keep pay on site</p>
                        <p className="mt-1 text-xs text-brand-muted">No payment today — pay at check-in or our Accra office.</p>
                        <p className="mt-2 text-sm font-bold text-brand-orange">Due on arrival</p>
                      </div>
                    </button>
                  ) : null}

                  <div className="flex justify-start pt-1">
                    <button type="button" onClick={() => setStep("traveler")} className="text-sm font-semibold text-brand-muted hover:text-brand-ink">← Back</button>
                  </div>
                </motion.div>
              )}

              {step === "review" && (
                <motion.form
                  key="review"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  onSubmit={handleSubmit}
                  className="mt-6 space-y-5 rounded-[1.5rem] border border-brand-border/60 bg-white p-5 shadow-sm sm:p-7"
                >
                  <div>
                    <h2 className="text-lg font-bold text-brand-ink">Review &amp; save</h2>
                    <p className="mt-1 text-sm text-brand-muted">Confirm your changes before updating the reservation.</p>
                  </div>

                  {(bookingTypeChanged || amountChanged) ? (
                    <div className="rounded-xl border border-brand-green/30 bg-brand-green/5 px-4 py-3 text-sm text-brand-muted">
                      {bookingTypeChanged ? (
                        <p>
                          Booking type changed from <strong className="capitalize text-brand-ink">{initialBookingType}</strong> to{" "}
                          <strong className="capitalize text-brand-ink">{form.bookingType}</strong>.
                        </p>
                      ) : null}
                      {amountChanged ? (
                        <p className={bookingTypeChanged ? "mt-1" : ""}>
                          Total updated from{" "}
                          <strong className="text-brand-ink">{formatBookingCurrency(initialSubtotal, chargeCurrency)}</strong> to{" "}
                          <strong className="text-brand-green">{formatBookingCurrency(subtotal, chargeCurrency)}</strong>{" "}
                          ({travelerCount} {travelerCount === 1 ? "traveler" : "travelers"}).
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {paymentChanged ? (
                    <div className="rounded-xl border border-brand-orange/30 bg-brand-orange/5 px-4 py-3 text-sm text-brand-muted">
                      {form.paymentMode === "online" ? (
                        <>You&apos;re switching to <strong className="text-brand-ink">online payment</strong>. You&apos;ll be redirected to checkout after saving.</>
                      ) : (
                        <>You&apos;re keeping <strong className="text-brand-ink">pay on site</strong>.</>
                      )}
                    </div>
                  ) : null}

                  <dl className="grid gap-3 rounded-xl border border-brand-border/50 bg-brand-cream/30 p-4 text-sm sm:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                      <div>
                        <dt className="text-xs text-brand-muted">Departure</dt>
                        <dd className="font-semibold text-brand-ink">
                          {(tour.departureDates || []).find((d) => d.date === form.selectedDate)?.dateLabel || form.selectedDate}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                      <div>
                        <dt className="text-xs text-brand-muted">Travelers</dt>
                        <dd className="font-semibold text-brand-ink">
                          {travelerCount} · <span className="capitalize">{form.bookingType}</span>
                          {form.bookingType === "group" && form.groupName ? ` · ${form.groupName}` : ""}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                      <div>
                        <dt className="text-xs text-brand-muted">Payment</dt>
                        <dd className="font-semibold text-brand-ink">{form.paymentMode === "online" ? "Pay online" : "Pay on site"}</dd>
                      </div>
                    </div>
                    <div className="sm:col-span-2 flex items-center justify-between border-t border-brand-border/40 pt-3">
                      <div>
                        <dt className="text-xs text-brand-muted">Total</dt>
                        <dd className="text-lg font-bold text-brand-green">{formatBookingCurrency(subtotal, chargeCurrency)}</dd>
                      </div>
                      {amountChanged ? (
                        <p className="text-xs text-brand-muted line-through">{formatBookingCurrency(initialSubtotal, chargeCurrency)}</p>
                      ) : null}
                    </div>
                    <div className="sm:col-span-2 border-t border-brand-border/40 pt-3">
                      <dt className="text-xs text-brand-muted">Lead traveler</dt>
                      <dd className="font-semibold text-brand-ink">{form.firstName} {form.lastName}</dd>
                      <dd className="text-brand-muted">{form.email} · {form.phone}</dd>
                    </div>
                  </dl>

                  {form.paymentMode === "online" ? (
                    <>
                      <PaymentRegionNotice
                        region={paymentRegion}
                        isLoading={paymentRegionLoading}
                        isOverridden={paymentRegionOverridden}
                        onSelectDomestic={selectDomesticRegion}
                        onSelectInternational={selectInternationalRegion}
                      />
                      <div className="rounded-xl border border-brand-green/25 bg-brand-green/5 p-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="h-5 w-5 shrink-0 text-brand-green" strokeWidth={2} aria-hidden />
                        <p className="text-xs leading-relaxed text-brand-muted">
                          Saving will update your booking and redirect you to our secure payment partner for {formatBookingCurrency(subtotal, chargeCurrency)}.
                        </p>
                      </div>
                    </div>
                    </>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-border/40 pt-4">
                    <button type="button" onClick={() => setStep("payment")} disabled={processing} className="text-sm font-semibold text-brand-muted hover:text-brand-ink disabled:opacity-50">
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-green-dark disabled:opacity-70"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden />
                          Saving…
                        </>
                      ) : form.paymentMode === "online" ? (
                        "Save & continue to checkout"
                      ) : (
                        "Save changes"
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <aside className="lg:sticky lg:top-[88px] lg:self-start">
            <BookingSummary
              tour={tour}
              form={form}
              subtotal={subtotal}
              bookingRef={bookingRef}
              initialSubtotal={initialSubtotal}
              currency={chargeCurrency}
              unitPrice={bookingPricing.unitPrice}
            />
          </aside>
        </div>
      </Container>
    </div>
  );
}
