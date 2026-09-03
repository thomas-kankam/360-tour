import { CheckCircle2, MapPin } from "lucide-react";
import { GuestIcon } from "../../utils/guestIcons";

/** Live guest-style card preview for the Experiences CMS form. */
export default function ExperienceCmsPreview({
  label = "",
  tagline = "",
  description = "",
  image = "",
  badgeText = "",
  iconKey = "compass",
  highlights = [],
  regions = [],
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border/60 bg-white shadow-sm">
      <div className="border-b border-brand-border/50 bg-brand-cream/40 px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-primary">Live preview</p>
        <p className="mt-0.5 text-xs text-brand-muted">How this experience card will look on /experiences</p>
      </div>

      <article className="overflow-hidden">
        <div className="grid lg:grid-cols-[1.05fr_1fr]">
          <div className="relative min-h-[180px] bg-brand-secondary">
            {image ? <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/80 via-brand-charcoal/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {badgeText ? (
                <span className="inline-flex rounded-full bg-brand-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-charcoal">
                  {badgeText}
                </span>
              ) : null}
              <h3 className="mt-2 font-heading text-xl font-bold text-white">{label || "Experience label"}</h3>
              <p className="mt-1 text-sm text-white/85">{tagline || "Tagline appears here"}</p>
            </div>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <GuestIcon name={iconKey} className="h-5 w-5" />
              </div>
              <p className="text-sm leading-relaxed text-brand-muted">
                {description || "Description appears here as you type."}
              </p>
            </div>

            {highlights.length ? (
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-brand-ink">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-primary" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}

            {regions.length ? (
              <div className="flex flex-wrap gap-1.5">
                {regions.map((region) => (
                  <span
                    key={region}
                    className="inline-flex items-center gap-1 rounded-full bg-brand-cream px-2 py-0.5 text-[10px] font-semibold text-brand-muted"
                  >
                    <MapPin className="h-3 w-3 text-brand-accent" aria-hidden />
                    {region}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="pt-1">
              <span className="inline-flex rounded-xl bg-brand-primary px-3 py-2 text-xs font-semibold text-white">
                Browse matching tours
              </span>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
