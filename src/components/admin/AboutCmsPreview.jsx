import { Check, MapPin, Mail } from "lucide-react";
import { GuestIcon } from "../../utils/guestIcons";
import { ABOUT_CMS_DEFAULTS, mergeAboutCmsWithDefaults } from "../../utils/aboutCmsStorage";

const SECTION_LABELS = {
  hero: "Hero",
  company: "Company strip",
  story: "Our Story",
  mission: "Mission & values",
  tourServices: "Tour services",
  supportServices: "Support services",
  popularDestinations: "Destinations",
  whyTravelWithUs: "Why travel with us",
  faqs: "FAQs",
  cta: "Call to action",
};

function PreviewFrame({ sectionId, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border/60 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-brand-border/50 bg-gradient-to-r from-brand-cream to-white px-4 py-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-primary">Live preview</p>
          <p className="mt-0.5 text-xs text-brand-muted">
            How <span className="font-semibold text-brand-ink">{SECTION_LABELS[sectionId] || "section"}</span> looks on /about
          </p>
        </div>
        <span className="rounded-full bg-brand-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-primary">
          Guest view
        </span>
      </div>
      <div className="max-h-[min(72vh,720px)] overflow-y-auto bg-[#faf9f7]">{children}</div>
    </div>
  );
}

function PreviewEyebrow({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-accent-dark">{children}</p>
  );
}

/** Section-aware About page preview for the admin CMS editor. */
export default function AboutCmsPreview({ content, sectionId = "hero" }) {
  const cms = mergeAboutCmsWithDefaults(content || ABOUT_CMS_DEFAULTS);
  const hero = cms.hero || {};
  const company = cms.company || {};
  const story = cms.story || {};
  const mission = cms.mission || {};
  const vision = cms.vision || {};
  const cta = cms.cta || {};

  if (sectionId === "hero") {
    return (
      <PreviewFrame sectionId={sectionId}>
        <div className="bg-white p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <span className="inline-flex rounded-full bg-brand-accent/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-primary">
                {hero.eyebrow || "About Us"}
              </span>
              <h3 className="mt-3 font-heading text-2xl font-bold leading-tight text-brand-primary sm:text-3xl">
                {hero.title || "Who We Are"}
              </h3>
              <p className="mt-2 text-base font-semibold leading-snug">
                <span className="text-brand-primary">{hero.titleLine}</span>{" "}
                <span className="text-brand-accent-dark">{hero.titleHighlight}</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-brand-muted">{hero.description}</p>
              <p className="mt-3 text-xs font-semibold text-brand-primary">{hero.tagline}</p>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {(hero.services || []).map((service) => (
                  <div
                    key={service.label}
                    className="rounded-2xl border border-brand-border/60 bg-brand-cream/50 px-3 py-3"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-accent/35 text-brand-primary">
                      <GuestIcon name={service.icon || "compass"} className="h-4 w-4" />
                    </span>
                    <p className="mt-2 text-[11px] font-bold text-brand-primary">{service.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-brand-border/50 pt-4 text-xs text-brand-muted">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand-primary" />
                  {company.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-brand-primary" />
                  Site contact email
                </span>
                <span className="font-medium text-brand-primary">{company.motto}</span>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-brand-border/50 shadow-sm">
                {hero.heroImage ? (
                  <img src={hero.heroImage} alt="" className="aspect-[4/5] w-full object-cover sm:aspect-[5/6]" />
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center bg-brand-cream text-xs text-brand-muted">
                    Hero image
                  </div>
                )}
              </div>
              {hero.storyImage ? (
                <div className="absolute -bottom-3 -left-3 w-[42%] overflow-hidden rounded-xl border-4 border-white shadow-md">
                  <img src={hero.storyImage} alt="" className="aspect-square w-full object-cover" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </PreviewFrame>
    );
  }

  if (sectionId === "company") {
    return (
      <PreviewFrame sectionId={sectionId}>
        <div className="bg-white p-6">
          <p className="text-xl font-bold text-brand-primary">{company.shortName || company.name}</p>
          <p className="mt-1 text-sm text-brand-muted">{company.subtitle}</p>
          <p className="mt-3 text-sm font-semibold text-brand-ink">{company.tagline}</p>
          <div className="mt-5 space-y-2.5 rounded-2xl border border-brand-border/60 bg-brand-cream/40 p-4 text-sm text-brand-muted">
            <p className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-primary" />
              {company.location || "—"}
            </p>
            <p className="font-medium text-brand-primary">{company.motto || "—"}</p>
            <p className="text-xs text-brand-muted">Legal name: {company.name}</p>
          </div>
        </div>
      </PreviewFrame>
    );
  }

  if (sectionId === "story") {
    return (
      <PreviewFrame sectionId={sectionId}>
        <div className="bg-brand-cream/40 p-5 sm:p-6">
          <PreviewEyebrow>Our Story</PreviewEyebrow>
          <h3 className="mt-2 text-xl font-bold text-brand-primary">Built for authentic African travel</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 sm:items-start">
            <div className="space-y-3 text-sm leading-relaxed text-brand-muted">
              {story.intro ? <p>{story.intro}</p> : null}
              {story.story ? <p>{story.story}</p> : null}
              {story.journey ? <p>{story.journey}</p> : null}
              {story.commitment ? <p>{story.commitment}</p> : null}
            </div>
            <div className="overflow-hidden rounded-2xl border border-brand-border/50 shadow-sm">
              {hero.storyImage ? (
                <img src={hero.storyImage} alt="" className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-white text-xs text-brand-muted">
                  Story image
                </div>
              )}
            </div>
          </div>
        </div>
      </PreviewFrame>
    );
  }

  if (sectionId === "mission") {
    return (
      <PreviewFrame sectionId={sectionId}>
        <div className="overflow-hidden bg-brand-primary text-white">
          <div className="grid gap-px bg-white/10 sm:grid-cols-3">
            <div className="bg-brand-primary p-5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-accent">{mission.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/85">{mission.text}</p>
            </div>
            <div className="bg-brand-primary p-5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-accent">{vision.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/85">{vision.text}</p>
            </div>
            <div className="bg-brand-primary p-5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-accent">Our Values</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(cms.values || []).map((value) => (
                  <span key={value} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px]">
                    {value}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PreviewFrame>
    );
  }

  if (sectionId === "tourServices" || sectionId === "supportServices") {
    const items = sectionId === "tourServices" ? cms.tourServices : cms.supportServices;
    const isTour = sectionId === "tourServices";
    return (
      <PreviewFrame sectionId={sectionId}>
        <div className={isTour ? "bg-white p-5 sm:p-6" : "bg-brand-cream/50 p-5 sm:p-6"}>
          <div className="mx-auto max-w-xl text-center">
            <PreviewEyebrow>{isTour ? "Our Services" : "Support"}</PreviewEyebrow>
            <h3 className="mt-2 text-lg font-bold text-brand-primary sm:text-xl">
              {isTour ? "Guided Tours & Experiences" : "Accommodation, Transport & Planning"}
            </h3>
          </div>
          <div className={`mt-5 grid gap-3 ${isTour ? "sm:grid-cols-2" : "lg:grid-cols-2"}`}>
            {(items || []).map((service) => (
              <div key={service.label} className="rounded-2xl border border-brand-border/60 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-accent/30 text-brand-primary">
                    <GuestIcon name={service.icon || "compass"} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-brand-ink">{service.label || "Untitled"}</p>
                    <p className="mt-1 text-xs leading-relaxed text-brand-muted">{service.description}</p>
                  </div>
                </div>
                {Array.isArray(service.details) && service.details.length ? (
                  <ul className="mt-3 space-y-1.5 border-t border-brand-border/40 pt-3">
                    {service.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-1.5 text-[11px] text-brand-muted">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-brand-primary" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </PreviewFrame>
    );
  }

  if (sectionId === "popularDestinations") {
    return (
      <PreviewFrame sectionId={sectionId}>
        <div className="bg-white p-5 sm:p-6">
          <PreviewEyebrow>Destinations</PreviewEyebrow>
          <h3 className="mt-2 text-lg font-bold text-brand-primary">Popular places guests love</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {(cms.popularDestinations || []).map((destination) => (
              <span
                key={destination}
                className="rounded-full border border-brand-border/70 bg-brand-cream/70 px-3 py-1.5 text-xs font-medium text-brand-ink"
              >
                {destination}
              </span>
            ))}
          </div>
        </div>
      </PreviewFrame>
    );
  }

  if (sectionId === "whyTravelWithUs") {
    return (
      <PreviewFrame sectionId={sectionId}>
        <div className="bg-brand-cream/40 p-5 sm:p-6">
          <PreviewEyebrow>Why us</PreviewEyebrow>
          <h3 className="mt-2 text-lg font-bold text-brand-primary">Why travel with 360 Tours</h3>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {(cms.whyTravelWithUs || []).map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 rounded-xl border border-brand-border/50 bg-white px-3 py-2.5 text-xs text-brand-ink shadow-sm"
              >
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </PreviewFrame>
    );
  }

  if (sectionId === "faqs") {
    return (
      <PreviewFrame sectionId={sectionId}>
        <div className="bg-white p-5 sm:p-6">
          <PreviewEyebrow>FAQs</PreviewEyebrow>
          <h3 className="mt-2 text-lg font-bold text-brand-primary">Common questions</h3>
          <div className="mt-4 divide-y divide-brand-border/60 rounded-2xl border border-brand-border/60">
            {(cms.faqs || []).map((faq) => (
              <div key={faq.question} className="px-4 py-3">
                <p className="text-sm font-semibold text-brand-ink">{faq.question || "Question"}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-brand-muted">{faq.answer || "Answer"}</p>
              </div>
            ))}
          </div>
        </div>
      </PreviewFrame>
    );
  }

  return (
    <PreviewFrame sectionId="cta">
      <div className="bg-brand-primary px-5 py-10 text-center text-white sm:px-8">
        <h3 className="font-heading text-2xl font-bold">{cta.title}</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/80">{cta.subtitle}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <span className="rounded-xl bg-brand-accent px-4 py-2.5 text-xs font-bold text-brand-primary">
            {cta.primaryLabel}
          </span>
          <span className="rounded-xl border border-white/30 px-4 py-2.5 text-xs font-semibold">
            {cta.secondaryLabel}
          </span>
        </div>
      </div>
    </PreviewFrame>
  );
}
