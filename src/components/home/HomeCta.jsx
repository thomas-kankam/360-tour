import { Link } from "react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Car,
  Mail,
  Map,
  MapPin,
  Phone,
  Route,
} from "lucide-react";
import Container from "../layout/Container";
import { images } from "../../config/images";
import env, { getContactPhoneTelHref, getWhatsAppUrl } from "../../config/env";
import { homeCtaSection } from "../../data/homeContent";

const EASE = [0.16, 1, 0.3, 1];

const highlightIcons = {
  map: Map,
  car: Car,
  route: Route,
  sparkles: Route,
};

function WhatsAppIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function HomeCta({ cmsOverride }) {
  const content = { ...homeCtaSection, ...cmsOverride };
  const primaryCta = { label: cmsOverride?.primaryCtaLabel || homeCtaSection.primaryCta.label, to: homeCtaSection.primaryCta.to };
  const secondaryCta = { label: cmsOverride?.secondaryCtaLabel || homeCtaSection.secondaryCta.label, to: homeCtaSection.secondaryCta.to };
  const whatsappMessage = cmsOverride?.whatsappMessage || homeCtaSection.whatsappMessage;
  const ctaImage =
    content.image ||
    images.destinations?.popular?.[content.imageKey || homeCtaSection.imageKey] ||
    images.home.hero_two;

  return (
    <section className="relative overflow-hidden bg-brand-cream pb-16 pt-4 sm:pb-20 lg:pb-24">
      <div aria-hidden className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-brand-accent/15 blur-3xl" />

      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.75, ease: EASE }}
          className="overflow-hidden rounded-3xl border border-brand-border/50 bg-white shadow-[0_32px_100px_-32px_rgba(21,67,96,0.22)]"
        >
          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-start">
            {/* Visual panel */}
            <div className="relative flex flex-col bg-[#f4f7fa] p-5 sm:p-6 lg:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.35]"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='1' fill='%23154360' fill-opacity='0.08'/%3E%3C/svg%3E\")",
                  backgroundSize: "32px 32px",
                }}
              />

              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-accent/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-primary">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  Ghana awaits
                </span>
                <div className="mt-4 flex flex-wrap gap-2">
                  {homeCtaSection.destinationChips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-brand-border/60 bg-white px-3 py-1 text-xs font-semibold text-brand-primary"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative mt-6 sm:mt-7">
                <div className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-brand-accent/45 via-brand-accent/10 to-brand-primary/10 sm:-inset-4" aria-hidden />
                <div className="relative overflow-hidden rounded-2xl border border-brand-border/40 bg-white shadow-[0_24px_64px_-28px_rgba(21,67,96,0.35)]">
                  <img src={ctaImage} alt="Explore Ghana with 360 Tours" className="block h-auto w-full" />
                </div>
                <div className="absolute -bottom-3 -right-2 rounded-2xl border border-brand-border/60 bg-white px-4 py-3 shadow-lg sm:-right-4">
                  <p className="text-lg font-bold text-brand-primary">360</p>
                  <p className="text-[11px] font-semibold text-brand-muted">Tours · Stay · Transport</p>
                </div>
              </div>
            </div>

            {/* Copy & actions */}
            <div className="flex flex-col p-6 sm:p-8 lg:p-10">
              <span className="inline-flex w-fit rounded-full bg-brand-accent/25 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">
                  {content.eyebrow}
              </span>
              <h2 className="mt-4 text-3xl font-bold text-brand-primary sm:text-4xl">{content.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-brand-muted">{content.subtitle}</p>

              <ul className="mt-8 space-y-3">
                {homeCtaSection.highlights.map((item) => {
                  const Icon = highlightIcons[item.icon] ?? Map;
                  return (
                    <li
                      key={item.label}
                      className="flex items-start gap-3 rounded-2xl border border-brand-border/50 bg-brand-cream/50 px-4 py-3"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-accent/30 text-brand-primary">
                        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                      </span>
                      <span>
                        <p className="text-sm font-bold text-brand-primary">{item.label}</p>
                        <p className="text-xs text-brand-muted">{item.description}</p>
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link to={primaryCta.to} className="btn-primary gap-2 px-6 py-3.5">
                  {primaryCta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link to={secondaryCta.to} className="btn-secondary gap-2 px-6 py-3.5">
                  {secondaryCta.label}
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
                <a
                  href={getWhatsAppUrl(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-accent gap-2 px-6 py-3.5"
                >
                  <WhatsAppIcon />
                  Chat on WhatsApp
                </a>
              </div>

              <div className="mt-auto flex flex-col gap-3 border-t border-brand-border/50 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                <a
                  href={`mailto:${env.contactEmail}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand-muted transition-colors hover:text-brand-primary"
                >
                  <Mail className="h-4 w-4 shrink-0" aria-hidden />
                  {env.contactEmail}
                </a>
                <a
                  href={getContactPhoneTelHref()}
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand-muted transition-colors hover:text-brand-primary"
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden />
                  {env.contactPhone}
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
