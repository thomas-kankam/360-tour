import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import Container from "../layout/Container";
import { images } from "../../config/images";
import { ROUTES } from "../../constants/routes";
import { primaryNavLinks } from "./navConfig";

const EASE = [0.16, 1, 0.3, 1];

function navLinkClass({ isActive }) {
  return [
    "relative rounded-lg px-4 py-2 text-sm transition-all duration-200",
    isActive
      ? "font-semibold text-brand-primary"
      : "font-medium text-brand-muted hover:bg-brand-primary/[0.04] hover:text-brand-primary",
  ].join(" ");
}

function mobileNavLinkClass({ isActive }) {
  return [
    "flex items-center gap-3 rounded-xl px-4 py-3.5 text-base transition-colors",
    isActive
      ? "border-l-[3px] border-brand-accent bg-brand-primary/[0.06] pl-[13px] font-semibold text-brand-primary"
      : "border-l-[3px] border-transparent font-medium text-brand-ink hover:bg-brand-cream",
  ].join(" ");
}

export default function NavbarShell({ actions, mobileActions }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-3 sm:px-6 lg:px-8 relative">
      <div
        className={[
          "mx-auto max-w-8xl transition-all duration-300",
          scrolled
            ? "rounded-2xl border border-brand-border/60 bg-white/90 shadow-[0_8px_40px_-12px_rgba(0,107,63,0.22)] backdrop-blur-xl"
            : "rounded-2xl border border-brand-primary/[0.08] bg-white/70 shadow-[0_4px_24px_-8px_rgba(0,107,63,0.12)] backdrop-blur-md",
        ].join(" ")}
      >
        <Container
          className={[
            "flex items-center justify-between gap-4 transition-all duration-300",
            scrolled ? "py-2.5" : "py-3 lg:py-3.5",
          ].join(" ")}
        >
          <Link to={ROUTES.home} className="group flex shrink-0 items-center gap-3">
            <img
              src={images.logo}
              alt="360 Tours"
              className={[
                "w-auto transition-all duration-300",
                scrolled ? "h-9 sm:h-10" : "h-10 sm:h-12",
              ].join(" ")}
            />
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {primaryNavLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={navLinkClass}
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <>
                        <motion.span
                          layoutId="nav-active-pill"
                          className="absolute inset-0 -z-10 rounded-lg bg-brand-accent/25 ring-1 ring-brand-accent/40"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                        <span
                          className="absolute bottom-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-brand-primary"
                          aria-hidden
                        />
                      </>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 lg:flex">{actions}</div>

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className={[
              "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 lg:hidden",
              menuOpen
                ? "bg-brand-primary text-white"
                : "border border-brand-border/70 bg-white text-brand-primary hover:border-brand-primary/30 hover:bg-brand-cream",
            ].join(" ")}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {menuOpen ? (
                <>
                  <path d="M6 6l12 12" />
                  <path d="M18 6 6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </Container>

        <div
          className={[
            "mx-4 h-0.5 rounded-full bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary transition-opacity duration-300 sm:mx-6",
            scrolled ? "opacity-100" : "opacity-60",
          ].join(" ")}
          aria-hidden
        />
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-brand-primary/20 backdrop-blur-sm lg:hidden"
              onClick={() => setMenuOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="absolute left-4 right-4 top-[calc(100%-0.25rem)] z-50 max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain rounded-2xl border border-brand-border/60 bg-white shadow-[0_20px_60px_-16px_rgba(0,107,63,0.28)] lg:hidden"
            >
              <Container className="py-5">
                <nav className="flex flex-col gap-0.5">
                  {primaryNavLinks.map((link, i) => (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.28, ease: EASE }}
                    >
                      <NavLink
                        to={link.to}
                        end={link.end}
                        onClick={() => setMenuOpen(false)}
                        className={mobileNavLinkClass}
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && (
                              <span className="flex h-2 w-2 shrink-0 rounded-full bg-brand-accent ring-2 ring-brand-primary/20" aria-hidden />
                            )}
                            {link.label}
                          </>
                        )}
                      </NavLink>
                    </motion.div>
                  ))}
                </nav>

                <div
                  className="mt-5 flex flex-col gap-3 border-t border-brand-border/50 pt-5"
                  onClick={(e) => {
                    if (e.target.closest("a, button")) setMenuOpen(false);
                  }}
                >
                  {mobileActions ?? actions}
                </div>
              </Container>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
