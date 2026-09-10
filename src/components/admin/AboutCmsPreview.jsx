import { Check, MapPin, Mail } from "lucide-react";
import { GuestIcon } from "../../utils/guestIcons";
import { ABOUT_CMS_DEFAULTS, mergeAboutCmsWithDefaults } from "../../utils/aboutCmsStorage";

function SectionPreviewShell({ title, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border/60 bg-white shadow-sm">
      <div className="border-b border-brand-border/50 bg-brand-cream/50 px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-primary">Live preview</p>
        <p className="mt-0.5 text-xs text-brand-muted">{title}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
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
      <SectionPreviewShell title="Hero block on /about">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-brand-border/50">
            {hero.heroImage ? (
              <img src={hero.heroImage} alt="" className="aspect-[16/9] w-full object-cover" />
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center bg-brand-cream text-xs text-brand-muted">Hero image</div>
            )}
          </div>
          <span className="inline-flex rounded-full bg-brand-accent/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-primary">
            {hero.eyebrow || "About Us"}
          </span>
          <h3 className="font-heading text-2xl font-bold text-brand-primary">{hero.title || "Who We Are"}</h3>
          <p className="text-sm font-semibold">
            <span className="text-brand-primary">{hero.titleLine}</span>{" "}
            <span className="text-brand-accent-dark">{hero.titleHighlight}</span>
          </p>
          <p className="text-sm leading-relaxed text-brand-muted">{hero.description}</p>
          <div className="grid grid-cols-3 gap-2">
            {(hero.services || []).slice(0, 3).map((service) => (
              <div key={service.label} className="rounded-xl bg-brand-cream/70 p-2.5 text-center">
                <GuestIcon name={service.icon || "compass"} className="mx-auto h-4 w-4 text-brand-primary" />
                <p className="mt-1 text-[10px] font-bold text-brand-ink">{service.label}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionPreviewShell>
    );
  }

  if (sectionId === "company") {
    return (
      <SectionPreviewShell title="Company identity strip">
        <p className="text-lg font-bold text-brand-primary">{company.shortName || company.name}</p>
        <p className="mt-1 text-sm text-brand-muted">{company.subtitle}</p>
        <p className="mt-3 text-sm font-semibold text-brand-ink">{company.tagline}</p>
        <div className="mt-4 space-y-2 text-sm text-brand-muted">
          <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-primary" />{company.location}</p>
          <p className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-brand-primary" />Contact email from site settings</p>
          <p className="font-medium text-brand-primary">{company.motto}</p>
        </div>
      </SectionPreviewShell>
    );
  }

  if (sectionId === "story") {
    return (
      <SectionPreviewShell title="Our Story section">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3 text-sm leading-relaxed text-brand-muted">
            <p>{story.intro}</p>
            <p>{story.story}</p>
          </div>
          <div className="overflow-hidden rounded-xl">
            {hero.storyImage ? (
              <img src={hero.storyImage} alt="" className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-brand-cream text-xs text-brand-muted">Story image</div>
            )}
          </div>
        </div>
      </SectionPreviewShell>
    );
  }

  if (sectionId === "mission") {
    return (
      <SectionPreviewShell title="Mission, vision & values">
        <div className="overflow-hidden rounded-2xl bg-brand-primary text-white">
          <div className="grid gap-px bg-white/10 sm:grid-cols-3">
            <div className="bg-brand-primary p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-accent">{mission.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-white/85">{mission.text}</p>
            </div>
            <div className="bg-brand-primary p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-accent">{vision.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-white/85">{vision.text}</p>
            </div>
            <div className="bg-brand-primary p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-accent">Our Values</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(cms.values || []).slice(0, 6).map((value) => (
                  <span key={value} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">{value}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionPreviewShell>
    );
  }

  if (sectionId === "tourServices" || sectionId === "supportServices") {
    const items = sectionId === "tourServices" ? cms.tourServices : cms.supportServices;
    return (
      <SectionPreviewShell title={sectionId === "tourServices" ? "Tour services cards" : "Support services cards"}>
        <div className="grid gap-3 sm:grid-cols-2">
          {(items || []).slice(0, 4).map((service) => (
            <div key={service.label} className="rounded-xl border border-brand-border/60 p-3">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-accent/30 text-brand-primary">
                  <GuestIcon name={service.icon || "compass"} className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-brand-ink">{service.label || "Untitled"}</p>
                  <p className="mt-1 text-xs leading-relaxed text-brand-muted">{service.description}</p>
                </div>
              </div>
              {Array.isArray(service.details) && service.details.length ? (
                <ul className="mt-3 space-y-1">
                  {service.details.slice(0, 3).map((detail) => (
                    <li key={detail} className="flex items-center gap-1.5 text-[11px] text-brand-muted">
                      <Check className="h-3 w-3 text-brand-primary" />
                      {detail}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </SectionPreviewShell>
    );
  }

  if (sectionId === "popularDestinations") {
    return (
      <SectionPreviewShell title="Popular destinations chips">
        <div className="flex flex-wrap gap-2">
          {(cms.popularDestinations || []).map((destination) => (
            <span key={destination} className="rounded-full border border-brand-border/70 bg-brand-cream/60 px-3 py-1.5 text-xs font-medium text-brand-ink">
              {destination}
            </span>
          ))}
        </div>
      </SectionPreviewShell>
    );
  }

  if (sectionId === "whyTravelWithUs") {
    return (
      <SectionPreviewShell title="Why travel with us">
        <ul className="grid gap-2 sm:grid-cols-2">
          {(cms.whyTravelWithUs || []).map((item) => (
            <li key={item} className="flex items-start gap-2 rounded-xl bg-brand-cream/70 px-3 py-2 text-xs text-brand-ink">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-primary" />
              {item}
            </li>
          ))}
        </ul>
      </SectionPreviewShell>
    );
  }

  if (sectionId === "faqs") {
    return (
      <SectionPreviewShell title="FAQ accordion items">
        <div className="space-y-2">
          {(cms.faqs || []).slice(0, 4).map((faq) => (
            <div key={faq.question} className="rounded-xl border border-brand-border/60 px-3 py-2">
              <p className="text-sm font-semibold text-brand-ink">{faq.question || "Question"}</p>
              <p className="mt-1 text-xs leading-relaxed text-brand-muted">{faq.answer || "Answer"}</p>
            </div>
          ))}
        </div>
      </SectionPreviewShell>
    );
  }

  return (
    <SectionPreviewShell title="Call to action banner">
      <div className="rounded-2xl bg-brand-primary px-5 py-8 text-center text-white">
        <h3 className="font-heading text-xl font-bold">{cta.title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-white/80">{cta.subtitle}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <span className="rounded-lg bg-brand-accent px-4 py-2 text-xs font-bold text-brand-primary">{cta.primaryLabel}</span>
          <span className="rounded-lg border border-white/30 px-4 py-2 text-xs font-semibold">{cta.secondaryLabel}</span>
        </div>
      </div>
    </SectionPreviewShell>
  );
}
