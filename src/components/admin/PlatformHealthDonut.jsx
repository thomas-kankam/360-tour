import { motion } from "motion/react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const CHART_SIZE = 480;
const INNER_RADIUS = 150;
const OUTER_RADIUS = 212;
const TRACK_COLOR = "#E8E2D6";
const EASE = [0.22, 1, 0.36, 1];

const BOOKING_SEGMENTS = [
  { key: "confirmed", label: "Confirmed", color: "#2D5A47", dotClass: "bg-brand-green" },
  { key: "pending", label: "Pending payment", color: "#D4611A", dotClass: "bg-brand-orange" },
  { key: "cancelled", label: "Cancelled", color: "#C53030", dotClass: "bg-red-500" },
];

function LegendCard({ label, value, total, pct, dotClass, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE, delay }}
      className="rounded-2xl border border-black/6 bg-brand-cream/40 px-3 py-3.5 text-center sm:px-4"
    >
      <span className={`mx-auto mb-2 block h-2.5 w-2.5 rounded-full ${dotClass}`} aria-hidden />
      <p className="text-xl font-bold leading-none text-brand-ink sm:text-2xl">{pct}%</p>
      <p className="mt-1.5 text-[11px] font-semibold leading-snug text-brand-ink sm:text-xs">{label}</p>
      <p className="mt-0.5 text-[10px] text-brand-muted sm:text-[11px]">
        {value} of {total}
      </p>
    </motion.div>
  );
}

function buildChartData(counts) {
  const segments = BOOKING_SEGMENTS.map((seg) => ({
    ...seg,
    name: seg.label,
    value: counts[seg.key] ?? 0,
  })).filter((seg) => seg.value > 0);

  const total = BOOKING_SEGMENTS.reduce((sum, seg) => sum + (counts[seg.key] ?? 0), 0);
  return { total, segments };
}

export default function PlatformHealthDonut({ confirmedBookings, pendingPaymentBookings, cancelledBookings }) {
  const counts = {
    confirmed: confirmedBookings,
    pending: pendingPaymentBookings,
    cancelled: cancelledBookings,
  };

  const { total, segments } = buildChartData(counts);
  const isEmpty = total <= 0;
  const chartData = isEmpty ? [{ key: "empty", name: "No data", value: 1, color: TRACK_COLOR }] : segments;

  const legendItems = BOOKING_SEGMENTS.map((seg, index) => ({
    ...seg,
    value: counts[seg.key] ?? 0,
    total,
    pct: total > 0 ? Math.round(((counts[seg.key] ?? 0) / total) * 100) : 0,
    delay: 0.15 + index * 0.08,
  }));

  const confirmedRate = total > 0 ? Math.round((confirmedBookings / total) * 100) : 0;

  return (
    <div className="flex w-full max-w-4xl flex-col items-center">
      <div
        className="relative mx-auto w-full max-w-[480px]"
        style={{ height: CHART_SIZE }}
        role="img"
        aria-label={
          isEmpty
            ? "Booking breakdown: no data yet"
            : `Booking breakdown — ${total} total, ${confirmedBookings} confirmed, ${pendingPaymentBookings} pending payment, ${cancelledBookings} cancelled`
        }
      >
        <span className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-cream/60" aria-hidden />

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={INNER_RADIUS}
              outerRadius={OUTER_RADIUS}
              startAngle={90}
              endAngle={-270}
              paddingAngle={isEmpty ? 0 : 4}
              cornerRadius={6}
              stroke="none"
              isAnimationActive={!isEmpty}
              animationBegin={0}
              animationDuration={900}
              animationEasing="ease-out"
            >
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          {isEmpty ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <p className="font-heading text-5xl font-bold text-brand-muted/35 sm:text-6xl">—</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-muted/55">
                No bookings
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.35 }}
            >
              <p className="font-heading text-6xl font-bold leading-none text-brand-ink sm:text-7xl">{total}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-muted">
                Total bookings
              </p>
              <p className="mt-2.5 text-sm font-semibold text-brand-green">{confirmedRate}% confirmed</p>
            </motion.div>
          )}
        </div>
      </div>

      {isEmpty ? (
        <p className="mt-6 max-w-sm text-center text-sm leading-relaxed text-brand-muted">
          Booking status breakdown will appear here once reservations are recorded on the platform.
        </p>
      ) : (
        <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {legendItems.map((item) => (
            <LegendCard key={item.key} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}
