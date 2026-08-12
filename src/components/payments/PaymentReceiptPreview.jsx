import env from "../../config/env";
import { formatPaymentDate } from "../../utils/paymentHelpers";

function ReceiptField({ label, value, mono = false, className = "" }) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-brand-muted">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold text-brand-ink ${mono ? "font-mono text-xs tracking-wide" : ""}`}>
        {value || "Not set"}
      </p>
    </div>
  );
}

export default function PaymentReceiptPreview({ receipt }) {
  if (!receipt) return null;

  const leadName = `${receipt.leadTraveler?.firstName || ""} ${receipt.leadTraveler?.lastName || ""}`.trim();

  return (
    <div className="overflow-hidden rounded-xl border border-brand-border bg-white shadow-sm">
      <div className="h-1 bg-gradient-to-r from-brand-green via-brand-gold to-brand-orange" />

      <div className="flex items-start justify-between gap-3 bg-brand-green px-5 py-4 text-white">
        <div>
          <p className="text-lg font-bold">AfriQuest Travel &amp; Tours</p>
          <p className="mt-0.5 text-xs text-white/80">Payment receipt</p>
        </div>
        <span className="shrink-0 rounded-full border border-brand-accent/45 bg-brand-accent/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-brand-primary">
          Paid
        </span>
      </div>

      <div className="border-b border-brand-border/40 bg-[#FFF8EB] px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand-orange">Amount paid</p>
        <p className="mt-1 text-2xl font-bold text-brand-green">{receipt.amountLabel}</p>
        <p className="mt-1 text-xs text-brand-muted">{formatPaymentDate(receipt.paidAt)}</p>
      </div>

      <div className="space-y-4 px-6 py-5">
        <ReceiptField label="Payment reference" value={receipt.paymentReference} mono />
        <ReceiptField label="Booking reference" value={receipt.bookingRef} mono />
        <ReceiptField label="Tour" value={receipt.tour?.name} />
        <div className="grid gap-4 sm:grid-cols-2">
          <ReceiptField label="Departure" value={receipt.selectedDate} />
          <ReceiptField label="Travelers" value={String(receipt.travelers)} />
        </div>
        <ReceiptField label="Lead traveler" value={leadName} />
      </div>

      <div className="border-t border-brand-border/40 bg-brand-cream/30 px-5 py-3 text-[10px] leading-relaxed text-brand-muted">
        <strong className="text-brand-ink">{env.appName}</strong> · {env.contactEmail} · {env.contactPhone}
        <br />
        Present this receipt at check-in.
      </div>
    </div>
  );
}
