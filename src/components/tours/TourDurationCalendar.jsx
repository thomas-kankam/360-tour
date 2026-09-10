import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatDepartureDateLabel,
  formatDepartureRangeLabel,
  syncEndDateFromDuration,
} from "../../utils/operatorTourMapper";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIso(dateStr) {
  if (!dateStr) return null;
  const date = new Date(`${dateStr}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, count) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function isBeforeDay(iso, minIso) {
  if (!iso || !minIso) return false;
  return iso < minIso;
}

function buildMonthCells(monthDate) {
  const first = startOfMonth(monthDate);
  const startPad = first.getDay();
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startPad; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toIsoDate(new Date(first.getFullYear(), first.getMonth(), day)));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

/**
 * Fixed-duration calendar: pick a start date and highlight the next `durationDays`
 * inclusive days (end = start + durationDays - 1).
 */
export default function TourDurationCalendar({
  durationDays = 1,
  startDate = "",
  endDate = "",
  onChange,
  minDate = "",
  label = "Select your start date",
  className = "",
}) {
  const days = Math.max(1, Number(durationDays) || 1);
  const resolvedEnd = endDate || (startDate ? syncEndDateFromDuration(startDate, days) : "");
  const minIso = minDate || "";

  const initialMonth = parseIso(startDate) || parseIso(minIso) || new Date();
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(initialMonth));

  const cells = useMemo(() => buildMonthCells(viewMonth), [viewMonth]);
  const monthLabel = viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  function handleSelect(iso) {
    if (!iso || isBeforeDay(iso, minIso)) return;
    const nextEnd = syncEndDateFromDuration(iso, days);
    onChange?.({ startDate: iso, endDate: nextEnd, durationDays: days });
  }

  function inRange(iso) {
    if (!iso || !startDate || !resolvedEnd) return false;
    return iso >= startDate && iso <= resolvedEnd;
  }

  function isStart(iso) {
    return Boolean(iso && startDate && iso === startDate);
  }

  function isEnd(iso) {
    return Boolean(iso && resolvedEnd && iso === resolvedEnd);
  }

  return (
    <div className={["rounded-2xl border border-brand-border/60 bg-white p-4 shadow-sm", className].join(" ")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-muted">{label}</p>
          <p className="mt-1 text-sm text-brand-muted">
            {days === 1
              ? "Pick the day for this 1-day trip."
              : `This is a ${days}-day trip. Choose a start date and the next ${days} days are reserved.`}
          </p>
        </div>
        {startDate && resolvedEnd ? (
          <div className="rounded-xl bg-brand-primary/5 px-3 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wide text-brand-muted">Your dates</p>
            <p className="mt-0.5 text-sm font-bold text-brand-primary">
              {formatDepartureRangeLabel(startDate, resolvedEnd)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewMonth((current) => addMonths(current, -1))}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border/70 text-brand-ink hover:bg-brand-cream"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <p className="text-sm font-bold text-brand-ink">{monthLabel}</p>
        <button
          type="button"
          onClick={() => setViewMonth((current) => addMonths(current, 1))}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border/70 text-brand-ink hover:bg-brand-cream"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <span key={day} className="py-1 text-[10px] font-bold uppercase tracking-wide text-brand-muted">
            {day}
          </span>
        ))}
        {cells.map((iso, index) => {
          if (!iso) {
            return <span key={`empty-${index}`} className="h-10" />;
          }

          const disabled = isBeforeDay(iso, minIso);
          const selectedStart = isStart(iso);
          const selectedEnd = isEnd(iso);
          const ranged = inRange(iso);
          const singleDay = days === 1 && selectedStart;

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(iso)}
              className={[
                "relative h-10 rounded-lg text-sm font-semibold transition-colors",
                disabled ? "cursor-not-allowed text-brand-muted/35" : "hover:bg-brand-primary/10",
                ranged && !selectedStart && !selectedEnd ? "bg-brand-primary/15 text-brand-primary" : "",
                selectedStart || selectedEnd || singleDay
                  ? "bg-brand-primary text-white hover:bg-brand-primary"
                  : "text-brand-ink",
              ].join(" ")}
              aria-label={formatDepartureDateLabel(iso)}
              aria-pressed={ranged}
            >
              {Number(iso.slice(-2))}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-brand-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-primary" /> Start / end
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-primary/20" /> Included days
        </span>
        {minIso ? (
          <span className="inline-flex items-center gap-1.5">
            Past dates are unavailable
          </span>
        ) : null}
      </div>
    </div>
  );
}
