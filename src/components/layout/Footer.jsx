import { useMemo } from "react";
import { Link } from "react-router";
import Container from "./Container";
import SocialLinks from "./SocialLinks";
import env, { getContactPhoneTelHref, getWhatsAppUrl } from "../../config/env";
import { images } from "../../config/images";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { getFooterAccountLinks, exploreFooterLinks } from "../navigation/navConfig";

const companyLinks = [
  { label: "About us", to: ROUTES.about },
  { label: "Why choose us", to: ROUTES.whyUs },
  { label: "Contact", to: ROUTES.contact },
];

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
    <footer className="relative bg-brand-charcoal text-white">
      <div aria-hidden className="kente-weave h-1" />

      <Container className="py-12 sm:py-14">
        <div className="flex flex-col items-center text-center">
          <Link to={ROUTES.home} className="inline-block">
            <img
              src={images.logo}
              alt="360 Tours Ghana"
              className="mx-auto h-20 w-auto brightness-0 invert sm:h-24"
            />
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Your trusted travel partner for unforgettable experiences across Ghana — tours, stays, and transport.
          </p>
          <SocialLinks className="mt-5 justify-center" variant="footer" />

          {isAuthenticated ? (
            <p className="mt-3 text-xs font-semibold text-brand-accent">
              Signed in as {getDisplayName(user)}
            </p>
          ) : null}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-8 border-t border-white/10 pt-10 sm:grid-cols-4">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-brand-accent">
                {title === "Account" ? accountSectionTitle : title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-white/65 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-brand-accent">Get in touch</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/65">
              <li>
                <a href={`mailto:${env.contactEmail}`} className="transition-colors hover:text-white">
                  {env.contactEmail}
                </a>
              </li>
              <li>
                <a href={getContactPhoneTelHref()} className="transition-colors hover:text-white">
                  {env.contactPhone}
                </a>
              </li>
              <li>
                <a
                  href={getWhatsAppUrl("Hello 360 Tours, I would like to plan a trip to Ghana.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  WhatsApp us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} 360 Tours and Investment Limited. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-white/50">
            <Link to={ROUTES.home} className="hover:text-white">Sitemap</Link>
            <span aria-hidden>·</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
