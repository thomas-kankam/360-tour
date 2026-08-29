import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  Loader2,
  Lock,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import consumerBookingsServiceApi from "../../apis/ConsumerBookingsServiceApi";
import { getWhatsAppUrl } from "../../config/env";
import { ROUTES } from "../../constants/routes";
import {
  formatDepartureSpotsLeftLabel,
  isDepartureLowAvailability,
  isUnlimitedTourSlots,
} from "../../utils/operatorTourConstants";
import { useAuth } from "../../hooks/useAuth";
import { usePaymentRegion } from "../../hooks/usePaymentRegion";
import PaymentRegionNotice from "../payments/PaymentRegionNotice";
import { downloadBookingReceipt } from "../../utils/bookingReceipt";
import { saveBooking, getBookingStatus } from "../../utils/bookingStorage";
import {
  buildCreateBookingPayload,
  canViewBookingReceipt,
  formatBookingCurrency,
  mapApiBookingToLocalRecord,
  mapUserToBookingLeadFields,
  mergeUserIntoBookingLeadFields,
  resolveBookingPricing,
} from "../../utils/bookingHelpers";
import { redirectToPaymentCheckout } from "../../utils/paymentHelpers";

const EASE = [0.16, 1, 0.3, 1];

const STEPS = [
  { id: "trip", label: "Trip" },
  { id: "details", label: "Details" },
  { id: "payment", label: "Payment" },
  { id: "confirm", label: "Confirm" },
];

function formatCurrency(amount, currency = "GHS") {
  return formatBookingCurrency(amount, currency);
}

const EMPTY_TRAVELER = { name: "", email: "", phone: "" };

function StepIndicator({ currentStep }) {
  const activeIndex =
    currentStep === "success"
      ? STEPS.length
      : currentStep === "pay-now" || currentStep === "pay-later"
        ? 2
        : STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center gap-1 px-6 pt-6">
      {STEPS.map((step, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <div key={step.id} className="flex flex-1 items-center gap-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all",
                  done ? "bg-brand-primary text-white" : active ? "bg-brand-primary text-white ring-4 ring-brand-primary/20" : "bg-brand-border/40 text-brand-muted",
                ].join(" ")}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-[10px] font-semibold ${active ? "text-brand-ink" : "text-brand-muted"}`}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mb-4 h-px flex-1 ${done ? "bg-brand-primary" : "bg-brand-border/60"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, id, type = "text", required, placeholder, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-brand-ink">
        {label}{required && <span className="text-brand-orange"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="h-11 rounded-xl border border-brand-border/70 bg-white px-4 text-sm outline-none transition-all focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/15"
      />
    </div>
  );
}

function TravelerStepper({ value, min, max, onChange }) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border bg-white text-lg font-bold text-brand-ink transition-all hover:border-brand-primary disabled:opacity-40"
        aria-label="Decrease travelers"
      >
        <Minus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
      </button>
      <div className="min-w-[3rem] text-center">
        <p className="text-2xl font-bold text-brand-ink">{value}</p>
        <p className="text-[11px] text-brand-muted">{value === 1 ? "traveler" : "travelers"}</p>
      </div>
      <button
        type="button"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border bg-white text-lg font-bold text-brand-ink transition-all hover:border-brand-primary disabled:opacity-40"
        aria-label="Increase travelers"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
}

export default function TourBookingFlow({ tour, open, onClose }) {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const {
    region: paymentRegion,
    isLoading: paymentRegionLoading,
    isOverridden: paymentRegionOverridden,
    selectDomesticRegion,
    selectInternationalRegion,
    resolveRegionForSubmit,
  } = usePaymentRegion({ enabled: open });
  const maxTravelers = Math.min(
    isUnlimitedTourSlots(tour.spotsLeft) ? tour.bookingSettings?.maxGroupSize || 10 : tour.spotsLeft || tour.bookingSettings?.maxGroupSize || 10,
    10,
  );

  const [step, setStep] = useState("trip");
  const [selectedDate, setSelectedDate] = useState(tour.departureDates[0]?.date ?? tour.nextDate);
  const [travelers, setTravelers] = useState(1);
  const [paymentMode, setPaymentMode] = useState(null);
  const [payType, setPayType] = useState("full");
  const [bookingRef, setBookingRef] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  const [form, setForm] = useState(() => ({
    ...mapUserToBookingLeadFields(user),
    travelers: [],
  }));

  useEffect(() => {
    if (!user) return;
    setForm((current) => mergeUserIntoBookingLeadFields(current, user));
  }, [user]);

  const bookingPricing = useMemo(
    () => resolveBookingPricing(tour, travelers, paymentRegion),
    [tour, travelers, paymentRegion],
  );
  const subtotal = bookingPricing.subtotal;
  const unitPrice = bookingPricing.unitPrice;
  const currency = bookingPricing.currency;
  const depositAmount = Math.round(subtotal * ((tour.depositPercent || 30) / 100));
  const payNowAmount = payType === "deposit" ? depositAmount : subtotal;

  const updateForm = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function updateAdditionalTraveler(index, field, value) {
    setForm((f) => {
      const travelers = [...f.travelers];
      travelers[index] = { ...travelers[index], [field]: value };
      return { ...f, travelers };
    });
  }

  function isTravelerComplete(traveler) {
    return traveler.name.trim() && traveler.email.trim() && traveler.phone.trim();
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setStep("trip");
      setTravelers(1);
      setPaymentMode(null);
      setPayType("full");
      setSelectedDate(tour.departureDates[0]?.date ?? tour.nextDate);
      setConfirmedBooking(null);
      setForm({
        ...mapUserToBookingLeadFields(user),
        travelers: [],
      });
    }
  }, [open, tour, user]);

  useEffect(() => {
    setForm((f) => {
      const extra = Math.max(0, travelers - 1);
      const list = Array.from({ length: extra }, (_, i) => ({
        ...EMPTY_TRAVELER, ...f.travelers[i],
      }));
      return { ...f, travelers: list };
    });
  }, [travelers]);

  const canProceedTrip = selectedDate && travelers >= 1;
  const canProceedDetails =
    form.firstName &&
    form.lastName &&
    form.email &&
    form.phone &&
    form.travelers.every(isTravelerComplete);

  async function submitIndividualBooking(paymentMode) {
    if (!token) {
      toast.info("Please sign in to complete your booking.");
      navigate(ROUTES.login, { state: { from: { pathname: ROUTES.tourBook(tour.slug) } } });
      onClose();
      return null;
    }

    const bookingForm = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      nationality: "",
      bookingType: "individual",
      selectedDate,
      travelers,
      groupName: "",
      groupType: "",
      organization: "",
      specialRequests: "",
      dietaryNeeds: "",
      paymentMode: paymentMode === "now" ? "online" : "onsite",
    };

    const region = await resolveRegionForSubmit();
    const payload = buildCreateBookingPayload(bookingForm, tour, region);
    if (paymentMode === "now") {
      payload.amount = payType === "deposit" ? depositAmount : subtotal;
    }

    const result = await consumerBookingsServiceApi.createBooking(token, payload);

    if (!result.ok || !result.booking) {
      toast.error(result.reason || result.message || "Could not submit booking.");
      return null;
    }

    const record = mapApiBookingToLocalRecord(result.booking, bookingForm, tour);
    saveBooking(record);
    setBookingRef(result.booking.bookingSlug);
    return result;
  }

  async function handleProceedToPayment(e) {
    e.preventDefault();
    setProcessing(true);
    const result = await submitIndividualBooking("now");
    setProcessing(false);
    if (!result) return;

    const redirected = redirectToPaymentCheckout(result, {
      onMissing: () => {
        setStep("success");
        const record = mapApiBookingToLocalRecord(result.booking, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          bookingType: "individual",
          paymentMode: "online",
        }, tour);
        const savedRecord = { ...record, status: getBookingStatus(record) };
        setConfirmedBooking(savedRecord);
        toast.error("Payment link unavailable. You can complete payment from My bookings.");
        if (canViewBookingReceipt(savedRecord)) {
          void downloadBookingReceipt(savedRecord, { token });
        }
      },
    });

    if (redirected) return;
  }

  async function handlePayLaterConfirm(e) {
    e.preventDefault();
    setProcessing(true);
    const result = await submitIndividualBooking("later");
    setProcessing(false);
    if (!result) return;

    toast.success(result.reason || "Booking submitted.");
    const record = mapApiBookingToLocalRecord(result.booking, {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      bookingType: "individual",
      paymentMode: "onsite",
    }, tour);
    setConfirmedBooking({ ...record, status: getBookingStatus(record) });
    setStep("success");
  }

  const stepTitle = useMemo(() => {
    if (step === "trip") return "Plan your trip";
    if (step === "details") return "Traveler details";
    if (step === "payment") return "Choose payment";
    if (step === "pay-now") return "Pay now";
    if (step === "pay-later") return "Reserve & pay later";
    if (step === "success") return "You're booked!";
    return "";
  }, [step]);

  async function handleDownloadReceipt() {
    if (!confirmedBooking || !canViewBookingReceipt(confirmedBooking)) return;

    setDownloadingReceipt(true);
    const ok = await downloadBookingReceipt(confirmedBooking, { token });
    setDownloadingReceipt(false);

    if (!ok) {
      toast.error("Could not generate PDF receipt. Please try again.");
      return;
    }

    toast.success("Receipt downloaded.");
  }

  const canShowReceipt = confirmedBooking && canViewBookingReceipt(confirmedBooking);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-brand-ink/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="relative flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-[1.75rem]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border/50 px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src={tour.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0">
              <p id="booking-title" className="truncate text-sm font-bold text-brand-ink">{stepTitle}</p>
              <p className="truncate text-xs text-brand-muted">{tour.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-border/60 text-brand-muted hover:bg-brand-cream"
          >
            <X className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </button>
        </div>

        {step !== "success" && <StepIndicator currentStep={step} />}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            {step === "trip" && (
              <motion.div key="trip" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3, ease: EASE }} className="space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Departure date</p>
                  <div className="mt-3 space-y-2">
                    {tour.departureDates.map((dep) => (
                      <button
                        key={dep.date}
                        type="button"
                        onClick={() => setSelectedDate(dep.date)}
                        className={[
                          "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all",
                          selectedDate === dep.date
                            ? "border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20"
                            : "border-brand-border/70 hover:border-brand-primary/30",
                        ].join(" ")}
                      >
                        <div>
                          <p className="text-sm font-semibold text-brand-ink">{dep.date}</p>
                          <p className="text-xs text-brand-muted">{dep.label}</p>
                        </div>
                        <span className={`text-xs font-bold ${isDepartureLowAvailability(dep.spotsLeft, dep.spotsTotal) ? "text-red-500" : "text-brand-primary"}`}>
                          {formatDepartureSpotsLeftLabel(dep.spotsLeft, dep.spotsTotal)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-brand-border/60 bg-brand-cream/60 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Number of travelers</p>
                  <div className="mt-4 flex items-center justify-between">
                    <TravelerStepper value={travelers} min={1} max={maxTravelers} onChange={setTravelers} />
                    <div className="text-right">
                      <p className="text-xs text-brand-muted">Per person</p>
                      <p className="text-lg font-bold text-brand-primary">{formatCurrency(unitPrice, currency)}</p>
                    </div>
                  </div>
                  {travelers > 1 && (
                    <p className="mt-3 text-xs text-brand-muted">
                      Paying for {travelers} people, total {formatCurrency(subtotal, currency)}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {step === "details" && (
              <motion.div key="details" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3, ease: EASE }} className="space-y-4">
                <p className="text-sm text-brand-muted">Lead traveler, we&apos;ll send your confirmation here.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First name" id="firstName" required placeholder="Jane" value={form.firstName} onChange={updateForm("firstName")} />
                  <Field label="Last name" id="lastName" required placeholder="Doe" value={form.lastName} onChange={updateForm("lastName")} />
                </div>
                <Field label="Email" id="email" type="email" required placeholder="jane@example.com" value={form.email} onChange={updateForm("email")} />
                <Field label="Phone" id="phone" type="tel" required placeholder="+1 234 567 8900" value={form.phone} onChange={updateForm("phone")} />

                {travelers > 1 && (
                  <div className="space-y-5 border-t border-brand-border/50 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                      Additional travelers ({travelers - 1})
                    </p>
                    {form.travelers.map((traveler, i) => (
                      <div key={i} className="space-y-3 rounded-xl border border-brand-border/50 bg-brand-cream/40 p-4">
                        <p className="text-xs font-bold text-brand-ink">Traveler {i + 2}</p>
                        <Field
                          label="Full name"
                          id={`traveler-name-${i}`}
                          required
                          placeholder="Full name"
                          value={traveler.name}
                          onChange={(e) => updateAdditionalTraveler(i, "name", e.target.value)}
                        />
                        <Field
                          label="Email"
                          id={`traveler-email-${i}`}
                          type="email"
                          required
                          placeholder="email@example.com"
                          value={traveler.email}
                          onChange={(e) => updateAdditionalTraveler(i, "email", e.target.value)}
                        />
                        <Field
                          label="Phone"
                          id={`traveler-phone-${i}`}
                          type="tel"
                          required
                          placeholder="+1 234 567 8900"
                          value={traveler.phone}
                          onChange={(e) => updateAdditionalTraveler(i, "phone", e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div key="payment" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3, ease: EASE }} className="space-y-4">
                <p className="text-sm text-brand-muted">How would you like to secure your spots?</p>

                <button
                  type="button"
                  onClick={() => { setPaymentMode("now"); setStep("pay-now"); }}
                  className="group flex w-full items-start gap-4 rounded-xl border-2 border-brand-border/70 p-5 text-left transition-all hover:border-brand-primary hover:bg-brand-primary/5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                    <CreditCard className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                  </div>
                  <div>
                    <p className="font-bold text-brand-ink group-hover:text-brand-primary">Pay now</p>
                    <p className="mt-1 text-xs leading-relaxed text-brand-muted">
                      Secure all {travelers} {travelers === 1 ? "spot" : "spots"} instantly. Pay in full or a {tour.depositPercent}% deposit today.
                    </p>
                    <p className="mt-2 text-sm font-bold text-brand-primary">{formatCurrency(subtotal, currency)} total</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { setPaymentMode("later"); setStep("pay-later"); }}
                  className="group flex w-full items-start gap-4 rounded-xl border-2 border-brand-border/70 p-5 text-left transition-all hover:border-brand-orange hover:bg-brand-orange/5"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                    <Clock className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                  </div>
                  <div>
                    <p className="font-bold text-brand-ink group-hover:text-brand-orange">Pay later</p>
                    <p className="mt-1 text-xs leading-relaxed text-brand-muted">
                      Reserve your spots free for {tour.payLaterHoldHours} hours. Pay the {tour.depositPercent}% deposit before the hold expires.
                    </p>
                    <p className="mt-2 text-sm font-bold text-brand-orange">{formatCurrency(depositAmount, currency)} deposit due later</p>
                  </div>
                </button>
              </motion.div>
            )}

            {step === "pay-now" && (
              <motion.form key="pay-now" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3, ease: EASE }} onSubmit={handleProceedToPayment} className="space-y-5">
                {/* Order summary */}
                <div className="rounded-xl border border-brand-border/60 bg-brand-cream/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Order summary</p>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-brand-muted">{formatCurrency(unitPrice, currency)} × {travelers} {travelers === 1 ? "person" : "people"}</span>
                      <span className="font-semibold text-brand-ink">{formatCurrency(subtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-brand-muted">
                      <span>{selectedDate} · {tour.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Pay type toggle */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "full", label: "Pay in full", amount: subtotal },
                    { id: "deposit", label: `${tour.depositPercent}% deposit`, amount: depositAmount },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPayType(opt.id)}
                      className={[
                        "rounded-xl border-2 px-3 py-3 text-left transition-all",
                        payType === opt.id ? "border-brand-primary bg-brand-primary/5" : "border-brand-border/60 hover:border-brand-primary/30",
                      ].join(" ")}
                    >
                      <p className="text-xs font-semibold text-brand-ink">{opt.label}</p>
                      <p className="mt-0.5 text-sm font-bold text-brand-primary">{formatCurrency(opt.amount, currency)}</p>
                    </button>
                  ))}
                </div>

                <PaymentRegionNotice
                  region={paymentRegion}
                  isLoading={paymentRegionLoading}
                  isOverridden={paymentRegionOverridden}
                  onSelectDomestic={selectDomesticRegion}
                  onSelectInternational={selectInternationalRegion}
                />

                <div className="rounded-xl border border-brand-primary/25 bg-brand-primary/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                      <Lock className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-ink">Secure payment checkout</p>
                      <p className="mt-1 text-xs leading-relaxed text-brand-muted">
                        You&apos;ll be redirected to our secure payment partner to complete your {payType === "deposit" ? "deposit" : "payment"} of {formatCurrency(payNowAmount, currency)}. Card details are handled entirely by the gateway, we never store them.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-primary-dark disabled:opacity-70"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden />
                      Redirecting to checkout…
                    </>
                  ) : (
                    <>
                      Continue to secure checkout, {formatCurrency(payNowAmount, currency)}
                      <ArrowRight className="h-4 w-4" strokeWidth={2.2} aria-hidden />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {step === "pay-later" && (
              <motion.form key="pay-later" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3, ease: EASE }} onSubmit={handlePayLaterConfirm} className="space-y-5">
                <div className="rounded-xl border border-brand-orange/30 bg-brand-orange/5 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange">
                      <Clock className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                    </div>
                    <div>
                      <p className="font-bold text-brand-ink">Your spots are held for {tour.payLaterHoldHours} hours</p>
                      <p className="mt-1 text-xs leading-relaxed text-brand-muted">
                        No payment required now. We&apos;ll email you a secure payment link. Pay the {tour.depositPercent}% deposit ({formatCurrency(depositAmount, currency)}) before your hold expires to confirm.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-brand-border/60 bg-brand-cream/50 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Tour ({travelers} {travelers === 1 ? "person" : "people"})</span>
                    <span className="font-semibold">{formatCurrency(subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Due within {tour.payLaterHoldHours}h</span>
                    <span className="font-bold text-brand-orange">{formatCurrency(depositAmount, currency)}</span>
                  </div>
                  <div className="flex justify-between border-t border-brand-border/40 pt-2">
                    <span className="text-brand-muted">Due before departure</span>
                    <span className="font-semibold text-brand-ink">{formatCurrency(subtotal - depositAmount, currency)}</span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-brand-muted">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 shrink-0 text-brand-primary" strokeWidth={2.5} aria-hidden /> Confirmation email sent immediately</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 shrink-0 text-brand-primary" strokeWidth={2.5} aria-hidden /> Flexible, pay deposit or full amount later</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 shrink-0 text-brand-primary" strokeWidth={2.5} aria-hidden /> Spots released if deposit not received in time</li>
                </ul>

                <button
                  type="submit"
                  disabled={processing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent py-3.5 text-sm font-semibold text-brand-primary shadow-lg transition-all hover:bg-brand-accent-dark disabled:opacity-70"
                >
                  {processing ? "Reserving…" : "Reserve my spots, pay later"}
                </button>
              </motion.form>
            )}

            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: EASE }} className="py-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10">
                  <CheckCircle2 className="h-8 w-8 text-brand-primary" strokeWidth={2} aria-hidden />
                </div>
                <h3 className="mt-5 text-xl font-bold text-brand-ink">
                  {paymentMode === "now" ? "Booking confirmed!" : "Reservation confirmed!"}
                </h3>
                <p className="mt-2 text-sm text-brand-muted">
                  {paymentMode === "now"
                    ? <>Payment of <strong className="text-brand-ink">{formatCurrency(payNowAmount, currency)}</strong> processed. Confirmation sent to <strong className="text-brand-ink">{form.email}</strong></>
                    : <>A confirmation has been sent to <strong className="text-brand-ink">{form.email}</strong></>}
                </p>

                <div className="mt-6 rounded-xl border border-brand-border/60 bg-brand-cream/50 p-4 text-left text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Booking reference</span>
                    <span className="font-mono font-bold text-brand-primary">{bookingRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Tour</span>
                    <span className="font-semibold text-brand-ink">{tour.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Departure</span>
                    <span>{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Travelers</span>
                    <span>{travelers}</span>
                  </div>
                  {paymentMode === "now" && (
                    <div className="flex justify-between border-t border-brand-border/40 pt-2">
                      <span className="text-brand-muted">Paid today</span>
                      <span className="font-bold text-brand-primary">{formatCurrency(payNowAmount, currency)}</span>
                    </div>
                  )}
                  {paymentMode === "later" && (
                    <div className="flex justify-between border-t border-brand-border/40 pt-2">
                      <span className="text-brand-muted">Deposit due by</span>
                      <span className="font-bold text-brand-orange">{tour.payLaterHoldHours}h</span>
                    </div>
                  )}
                </div>

                {canShowReceipt ? (
                <div className="mt-5 rounded-xl border border-brand-gold/40 bg-brand-gold/10 px-4 py-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gold/20 text-brand-orange">
                      <FileText className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-ink">Present this receipt at the premises</p>
                      <p className="mt-1 text-xs leading-relaxed text-brand-muted">
                        Download your receipt and show it to 360 Tours staff or your guide upon arrival. This confirms your booking and traveler details.
                      </p>
                      <button
                        type="button"
                        onClick={handleDownloadReceipt}
                        disabled={downloadingReceipt}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-primary-dark disabled:opacity-60"
                      >
                        <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
                        {downloadingReceipt ? "Preparing PDF…" : "Download receipt"}
                      </button>
                    </div>
                  </div>
                </div>
                ) : null}

                <a
                  href={getWhatsAppUrl(`Hi 360 Tours, my booking ref is ${bookingRef}. I'd like to confirm details for ${tour.name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline"
                >
                  Questions? Chat with us on WhatsApp
                </a>
                <Link
                  to={ROUTES.myBookings}
                  onClick={onClose}
                  className="mt-3 block text-xs font-semibold text-brand-muted hover:text-brand-primary"
                >
                  View all my bookings →
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer nav */}
        {step !== "success" && step !== "pay-now" && step !== "pay-later" && (
          <div className="flex items-center justify-between border-t border-brand-border/50 px-6 py-4">
            <button
              type="button"
              onClick={() => {
                if (step === "trip") onClose();
                else if (step === "details") setStep("trip");
                else if (step === "payment") setStep("details");
              }}
              className="text-sm font-semibold text-brand-muted hover:text-brand-ink"
            >
              {step === "trip" ? "Cancel" : "Back"}
            </button>
            {step === "trip" && (
              <button
                type="button"
                disabled={!canProceedTrip}
                onClick={() => setStep("details")}
                className="rounded-xl bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-primary-dark disabled:opacity-50"
              >
                Continue
              </button>
            )}
            {step === "details" && (
              <button
                type="button"
                disabled={!canProceedDetails}
                onClick={() => setStep("payment")}
                className="rounded-xl bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-primary-dark disabled:opacity-50"
              >
                Continue
              </button>
            )}
          </div>
        )}

        {(step === "pay-now" || step === "pay-later") && (
          <div className="border-t border-brand-border/50 px-6 py-3">
            <button type="button" onClick={() => setStep("payment")} className="text-sm font-semibold text-brand-muted hover:text-brand-ink">
              ← Change payment option
            </button>
          </div>
        )}

        {step === "success" && canShowReceipt ? (
          <div className="flex flex-col gap-2 border-t border-brand-border/50 px-6 py-4">
            <button
              type="button"
              onClick={handleDownloadReceipt}
              disabled={downloadingReceipt}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-primary/30 bg-brand-primary/5 py-3 text-sm font-semibold text-brand-primary transition-all hover:bg-brand-primary/10 disabled:opacity-60"
            >
              <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
              {downloadingReceipt ? "Preparing PDF…" : "Download receipt"}
            </button>
            <button type="button" onClick={onClose} className="w-full rounded-xl bg-brand-primary py-3 text-sm font-semibold text-white hover:bg-brand-primary-dark">
              Done
            </button>
          </div>
        ) : null}

        {step === "success" && !canShowReceipt ? (
          <div className="border-t border-brand-border/50 px-6 py-4">
            <button type="button" onClick={onClose} className="w-full rounded-xl bg-brand-primary py-3 text-sm font-semibold text-white hover:bg-brand-primary-dark">
              Done
            </button>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
