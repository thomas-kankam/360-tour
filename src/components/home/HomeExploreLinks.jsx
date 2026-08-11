import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Compass, Info, MessageCircle } from "lucide-react";
import Container from "../layout/Container";
import { ROUTES } from "../../constants/routes";

const EASE = [0.16, 1, 0.3, 1];

const EXPLORE_DEFAULTS = {
  eyebrow: "Learn more",
  title: "Explore 360 Tours",
  aboutLabel: "About us",
  aboutText: "Our story, services, and offices in Ghana and Amsterdam.",
  aboutCta: "About 360 Tours",
  whyLabel: "Why choose us",
  whyText: "Guided tours, flexible departures, and end-to-end coordination.",
  whyCta: "See why travelers trust us",
  contactLabel: "Plan your trip",
  contactText: "Custom quotes, group travel, and visa-on-arrival guidance.",
  contactCta: "Contact us",
};

function ExploreCard({ icon: Icon, label, text, cta, to, delay = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className="group flex flex-col rounded-2xl border border-brand-border/60 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-primary/20 hover:shadow-md"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>
      <h3 className="mt-4 text-lg font-bold text-brand-ink">{label}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-muted">{text}</p>
      <Link
        to={to}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary transition-colors group-hover:text-brand-primary-dark"
      >
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </motion.article>
  );
}

export default function HomeExploreLinks({ cmsOverride }) {
  const content = { ...EXPLORE_DEFAULTS, ...cmsOverride };

  const cards = [
    {
      icon: Info,
      label: content.aboutLabel,
      text: content.aboutText,
      cta: content.aboutCta,
      to: ROUTES.about,
    },
    {
      icon: Compass,
      label: content.whyLabel,
      text: content.whyText,
      cta: content.whyCta,
      to: ROUTES.whyUs,
    },
    {
      icon: MessageCircle,
      label: content.contactLabel,
      text: content.contactText,
      cta: content.contactCta,
      to: ROUTES.contact,
    },
  ];

  return (
    <section className="bg-white py-14 sm:py-16">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-orange">{content.eyebrow}</p>
          <h2 className="mt-3 text-2xl font-bold text-brand-ink sm:text-3xl">{content.title}</h2>
        </motion.div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {cards.map((card, index) => (
            <ExploreCard key={card.to} {...card} delay={index * 0.06} />
          ))}
        </div>
      </Container>
    </section>
  );
}
