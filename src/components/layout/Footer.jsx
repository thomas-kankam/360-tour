import { useMemo } from "react";
import { Link } from "react-router";
import Container from "./Container";
import env, { getContactPhoneTelHref, getWhatsAppUrl } from "../../config/env";
import { images } from "../../config/images";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { getFooterAccountLinks, exploreFooterLinks } from "../navigation/navConfig";

const companyLinks = [
  { label: "About us", to: ROUTES.about },
  { label: "Why choose us", to: ROUTES.whyUs },
];

const destinationChips = ["Accra", "Cape Coast", "Kumasi", "Volta Region"];

function getDisplayName(user) {
  return user?.name || user?.firstName || user?.email || user?.phone || "Account";
}

export default function Footer() {
  const { isAuthenticated, role, user, hasAdminPermission } = useAuth();

  const footerLinks = useMemo(
    () => ({
      Explore: exploreFooterLinks,
      Company: companyLinks,
      Account: getFooterAccountLinks({ isAuthenticated, role, hasAdminPermission }),
    }),
    [isAuthenticated, role, hasAdminPermission],
  );

  const accountSectionTitle = isAuthenticated ? "My account" : "Account";

  return (
    <footer className="relative border-t border-brand-border/60 bg-gradient-to-b from-[#FFFDF5] via-brand-cream to-brand-accent/10 text-brand-ink">
      <div
        aria-hidden
        className="h-1 bg-gradient-to-r from-brand-accent/40 via-brand-accent to-brand-accent/40"
      />

      <Container className="py-12 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link to={ROUTES.home} className="inline-block">
              <img
                src={images.logo}
                alt="360 Tours and Investment Limited"
                className="h-20 w-auto sm:h-24 lg:h-28"
              />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-muted">
              Your trusted travel partner for unforgettable experiences across Ghana — tours, stays,
              and transport with 360 Tours and Investment Limited.
            </p>

            {isAuthenticated ? (
              <p className="mt-3 text-xs font-semibold text-brand-primary">
                Signed in as {getDisplayName(user)}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              {destinationChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-brand-border/60 bg-white px-3 py-1.5 text-xs font-semibold text-brand-primary shadow-sm"
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="mt-6 space-y-2 text-sm text-brand-muted">
              <p>
                <a href={`mailto:${env.contactEmail}`} className="transition-colors hover:text-brand-primary">
                  {env.contactEmail}
                </a>
              </p>
              <p>
                <a href={getContactPhoneTelHref()} className="transition-colors hover:text-brand-primary">
                  {env.contactPhone}
                </a>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">
                  {title === "Account" ? accountSectionTitle : title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-brand-muted transition-colors hover:text-brand-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">
                Get in touch
              </h3>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link
                    to={ROUTES.contact}
                    className="text-sm text-brand-muted transition-colors hover:text-brand-primary"
                  >
                    Request a quote
                  </Link>
                </li>
                <li>
                  <a
                    href={getWhatsAppUrl("Hello 360 Tours, I would like to plan a trip to Ghana.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-muted transition-colors hover:text-brand-primary"
                  >
                    WhatsApp us
                  </a>
                </li>
                <li>
                  <a
                    href={env.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-muted transition-colors hover:text-brand-primary"
                  >
                    {env.websiteUrl.replace(/^https?:\/\//, "")}
                  </a>
                </li>
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-brand-muted/80">Accra, Ghana</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-brand-border/50 pt-6 sm:flex-row">
          <p className="text-xs text-brand-muted">
            © {new Date().getFullYear()} 360 Tours and Investment Limited. All rights reserved.
          </p>
          <p className="text-xs text-brand-muted">Ghana · Tours · Stay · Transport</p>
        </div>
      </Container>
    </footer>
  );
}
