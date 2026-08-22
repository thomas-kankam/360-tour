import { Compass, Flag, MapPin } from "lucide-react";
import { getItineraryDayImageSrc } from "../../utils/itineraryHelpers";

function resolveDayLabel(day, index, total) {
  if (index === 0) return "Arrival";
  if (index === total - 1) return "Departure";
  return `Day ${day.day}`;
}

function resolveDayAccent(index, total) {
  if (index === 0) return "from-brand-accent/20 to-brand-accent/5 border-brand-accent/35";
  if (index === total - 1) return "from-brand-primary/8 to-white border-brand-primary/20";
  return "from-white to-brand-cream/40 border-brand-border/50";
}

function ItineraryDayCard({ day, index, total }) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const label = resolveDayLabel(day, index, total);
  const cardAccent = resolveDayAccent(index, total);
  const imageSrc = getItineraryDayImageSrc(day);

  return (
    <li className="relative grid grid-cols-[auto_1fr] gap-x-5 gap-y-0 sm:gap-x-7">
      <div className="relative flex flex-col items-center">
        <div
          className={[
            "relative z-10 flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl shadow-[0_8px_20px_-10px_rgba(0,107,63,0.55)] ring-4 ring-white sm:h-14 sm:w-14",
            isFirst
              ? "bg-brand-accent text-brand-primary"
              : isLast
                ? "bg-brand-primary text-white"
                : "bg-white text-brand-primary ring-brand-primary/10",
          ].join(" ")}
          aria-hidden
        >
          {!isFirst && !isLast ? (
            <span className="font-heading text-lg font-bold leading-none sm:text-xl">{day.day}</span>
          ) : isFirst ? (
            <MapPin className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
          ) : (
            <Flag className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
          )}
        </div>
        {index < total - 1 ? (
          <div
            className="mt-2 min-h-[2rem] w-px flex-1 bg-gradient-to-b from-brand-primary/25 via-brand-border to-brand-primary/10"
            aria-hidden
          />
        ) : null}
      </div>

      <article
        className={[
          "group overflow-hidden rounded-2xl border bg-gradient-to-br shadow-sm transition-shadow duration-300 hover:shadow-[0_12px_32px_-20px_rgba(0,107,63,0.28)]",
          cardAccent,
        ].join(" ")}
      >
        {imageSrc ? (
          <div className="aspect-[16/9] overflow-hidden border-b border-brand-border/30">
            <img src={imageSrc} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
          </div>
        ) : null}

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
                isFirst
                  ? "bg-brand-accent/30 text-brand-primary"
                  : isLast
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "bg-brand-cream text-brand-muted",
              ].join(" ")}
            >
              {label}
            </span>
            {!isFirst && !isLast ? (
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-muted/80">
                Day {day.day}
              </span>
            ) : null}
          </div>

          <h3 className="mt-3 font-heading text-lg font-bold leading-snug text-brand-ink sm:text-xl">{day.title}</h3>

          {day.description ? (
            <p className="mt-2.5 text-sm leading-relaxed text-brand-muted sm:text-[15px] sm:leading-7">
              {day.description}
            </p>
          ) : null}
        </div>
      </article>
    </li>
  );
}

export default function TourItineraryTimeline({ itinerary = [], className = "" }) {
  const days = (itinerary || []).filter(
    (day) => day?.title?.trim() || day?.description?.trim() || getItineraryDayImageSrc(day),
  );
  if (!days.length) return null;

  const totalDays = days.length;
  const firstTitle = days[0]?.title?.trim();
  const lastTitle = days[totalDays - 1]?.title?.trim();

  return (
    <section
      className={[
        "overflow-hidden rounded-3xl border border-brand-border/50 bg-white shadow-sm",
        className,
      ].join(" ")}
      aria-labelledby="tour-itinerary-heading"
    >
      <div className="border-b border-brand-border/40 bg-gradient-to-br from-brand-cream/70 via-white to-white px-6 py-6 sm:px-8 sm:py-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-primary">
              <Compass className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              Your journey
            </p>
            <h2 id="tour-itinerary-heading" className="mt-2 font-heading text-xl font-bold text-brand-ink sm:text-2xl">
              Day-by-day itinerary
            </h2>
            <p className="mt-1.5 max-w-xl text-sm text-brand-muted">
              Follow the route from arrival through each curated experience to departure.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-brand-primary/15 bg-brand-primary/[0.04] px-4 py-3">
            <div className="text-center">
              <p className="font-heading text-2xl font-bold leading-none text-brand-primary">{totalDays}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                {totalDays === 1 ? "Day" : "Days"}
              </p>
            </div>
          </div>
        </div>

        {firstTitle && lastTitle && totalDays > 1 ? (
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-brand-muted sm:text-sm">
            <span className="inline-flex max-w-[min(100%,14rem)] items-center gap-1.5 truncate rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-brand-border/50">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-accent" strokeWidth={2.25} aria-hidden />
              <span className="truncate text-brand-ink">{firstTitle}</span>
            </span>
            <span className="hidden text-brand-border sm:inline" aria-hidden>
              →
            </span>
            <span className="hidden h-px max-w-[120px] flex-1 bg-gradient-to-r from-brand-accent/60 to-brand-primary/20 sm:block" aria-hidden />
            <span className="inline-flex max-w-[min(100%,14rem)] items-center gap-1.5 truncate rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-brand-border/50">
              <Flag className="h-3.5 w-3.5 shrink-0 text-brand-primary" strokeWidth={2.25} aria-hidden />
              <span className="truncate text-brand-ink">{lastTitle}</span>
            </span>
          </div>
        ) : null}
      </div>

      <ol className="relative flex flex-col gap-8 px-6 py-7 sm:gap-10 sm:px-8 sm:py-8">
        {days.map((day, index) => (
          <ItineraryDayCard key={`${day.day}-${day.title}-${index}`} day={day} index={index} total={totalDays} />
        ))}
      </ol>
    </section>
  );
}
