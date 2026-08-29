import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Banknote, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import operatorPaymentsServiceApi from "../../apis/OperatorPaymentsServiceApi";
import { useAuth } from "../../hooks/useAuth";
import { normalizeBookingCodeInput } from "../../utils/operatorBookingHelpers";

const EASE = [0.22, 1, 0.36, 1];

const recordSchema = Yup.object({
  bookingCode: Yup.string()
    .trim()
    .required("Booking code is required")
    .matches(/^AFQ_/i, "Use a valid booking code (e.g. AFQ_XZ1769)"),
  amount: Yup.number()
    .typeError("Enter a valid amount")
    .positive("Amount must be greater than zero")
    .required("Amount is required"),
});

export default function RecordOnsitePaymentModal({
  open,
  onClose,
  onRecorded,
  initialBookingCode = "",
  initialAmount = "",
  currency = "GHS",
  lockBookingCode = false,
}) {
  const { token } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const currencyCode = currency || "GHS";

  useEffect(() => {
    if (!open) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape" && !submitting) onClose?.();
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose, submitting]);

  if (typeof document === "undefined") return null;

  const initialValues = {
    bookingCode: initialBookingCode || "",
    amount: initialAmount != null && initialAmount !== "" ? String(initialAmount) : "",
  };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => !submitting && onClose()}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="relative z-10 w-full max-w-md rounded-t-3xl border border-brand-border/60 bg-white p-6 shadow-2xl sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="record-onsite-title"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-accent/25 text-brand-primary">
                <Banknote className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <div>
                <h2 id="record-onsite-title" className="text-lg font-bold text-brand-ink">Record on-site payment</h2>
                <p className="mt-1 text-sm text-brand-muted">
                  Mark a pay-on-site booking as collected. Amount should match what the guest paid.
                </p>
              </div>
            </div>

            <Formik
              enableReinitialize
              initialValues={initialValues}
              validationSchema={recordSchema}
              onSubmit={async (values, { resetForm }) => {
                if (!token) return;

                setSubmitting(true);
                const result = await operatorPaymentsServiceApi.recordOnsitePayment(token, {
                  bookingCode: normalizeBookingCodeInput(values.bookingCode),
                  amount: values.amount,
                });
                setSubmitting(false);

                if (!result.ok || !result.payment) {
                  toast.error(result.reason || result.message || "Could not record payment.");
                  return;
                }

                toast.success(result.reason || "On-site payment recorded.");
                resetForm();
                onClose();
                onRecorded?.(result.payment);
              }}
            >
              {({ errors, touched }) => (
                <Form className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="record-onsite-booking-code" className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                      Booking code
                    </label>
                    <Field
                      id="record-onsite-booking-code"
                      name="bookingCode"
                      placeholder="AFQ_XZ1769"
                      disabled={lockBookingCode || submitting}
                      className="mt-1.5 w-full rounded-xl border border-brand-border/70 px-3 py-2.5 font-mono text-sm outline-none ring-brand-primary/20 transition-shadow focus:border-brand-primary focus:ring-2 disabled:bg-brand-cream/60 disabled:text-brand-muted"
                    />
                    {touched.bookingCode && errors.bookingCode ? (
                      <p className="mt-1 text-xs text-red-600">{errors.bookingCode}</p>
                    ) : null}
                  </div>
                  <div>
                    <label htmlFor="record-onsite-amount" className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                      Amount ({currencyCode})
                    </label>
                    <Field
                      id="record-onsite-amount"
                      name="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.10"
                      disabled={submitting}
                      className="mt-1.5 w-full rounded-xl border border-brand-border/70 px-3 py-2.5 text-sm outline-none ring-brand-primary/20 transition-shadow focus:border-brand-primary focus:ring-2"
                    />
                    {touched.amount && errors.amount ? (
                      <p className="mt-1 text-xs text-red-600">{errors.amount}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={submitting}
                      className="btn-secondary flex-1 sm:flex-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary inline-flex flex-1 items-center justify-center gap-2 sm:flex-none"
                    >
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                      {submitting ? "Recording…" : "Record payment"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
