import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  BarChart3,
  CalendarCheck,
  CreditCard,
  Landmark,
  Map,
  Menu,
  Plus,
  UserCircle,
} from "lucide-react";
import ScrollToTop from "../components/misc/ScrollToTop";
import PortalSidebar, { PortalNavItem, PortalNavSection } from "../components/layout/PortalSidebar";
import AccountDropdown from "../components/navigation/AccountDropdown";
import { company } from "../data/aboutContent";
import { ROUTES } from "../constants/routes";
import { ROLE_META, USER_ROLES } from "../constants/roles";
import { useAuth } from "../hooks/useAuth";

const EASE = [0.22, 1, 0.36, 1];

const NAV_ITEMS = {
  overview: [{ to: ROUTES.operator.dashboard, label: "Dashboard", icon: BarChart3, end: true }],
  listings: [{ to: ROUTES.operator.tours, label: "Tour listings", icon: Map }],
  operations: [
    { to: ROUTES.operator.bookings, label: "Bookings", icon: CalendarCheck },
    { to: ROUTES.operator.payments, label: "Payments", icon: CreditCard },
  ],
  account: [{ to: ROUTES.operator.profile, label: "Profile", icon: UserCircle }],
};

function OperatorSidebarContent({ collapsed, onNavigate }) {
  return (
    <>
      <PortalNavSection title="Overview" collapsed={collapsed}>
        {NAV_ITEMS.overview.map((item) => (
          <PortalNavItem key={item.to} {...item} collapsed={collapsed} onClick={onNavigate} />
        ))}
      </PortalNavSection>

      <PortalNavSection title="Listings" collapsed={collapsed}>
        {NAV_ITEMS.listings.map((item) => (
          <PortalNavItem key={item.to} {...item} collapsed={collapsed} onClick={onNavigate} />
        ))}
        {!collapsed ? (
          <NavLink
            to={ROUTES.operator.tourNew}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl border border-brand-accent/40 bg-brand-accent/15 px-3 py-2.5 text-sm font-semibold text-brand-accent transition-colors hover:bg-brand-accent hover:text-brand-primary"
          >
            <Plus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            New listing
          </NavLink>
        ) : (
          <NavLink
            to={ROUTES.operator.tourNew}
            onClick={onNavigate}
            title="New listing"
            className="flex justify-center rounded-xl bg-brand-accent py-3 text-brand-primary transition-colors hover:bg-brand-accent-dark"
          >
            <Plus className="h-5 w-5" strokeWidth={2} aria-hidden />
          </NavLink>
        )}
      </PortalNavSection>

      <PortalNavSection title="Operations" collapsed={collapsed}>
        {NAV_ITEMS.operations.map((item) => (
          <PortalNavItem key={item.to} {...item} collapsed={collapsed} onClick={onNavigate} />
        ))}
      </PortalNavSection>

      <PortalNavSection title="Account" collapsed={collapsed}>
        {NAV_ITEMS.account.map((item) => (
          <PortalNavItem key={item.to} {...item} collapsed={collapsed} onClick={onNavigate} />
        ))}
      </PortalNavSection>
    </>
  );
}

export default function OperatorLayout() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarWidth = collapsed ? "w-[68px]" : "w-72";
  const sidebarPad = collapsed ? "lg:pl-[68px]" : "lg:pl-72";
  const operatorMeta = ROLE_META[USER_ROLES.SITE_OPERATOR];

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const sidebarProps = {
    portalLabel: "Operator hub",
    portalSubtitle: company.name,
    collapsedIcon: Landmark,
    user,
    showPublicSiteLink: true,
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      <ScrollToTop />

      <aside className={["fixed inset-y-0 left-0 z-40 hidden transition-all duration-300 lg:block", sidebarWidth].join(" ")}>
        <PortalSidebar {...sidebarProps} collapsed={collapsed} onCollapse={() => setCollapsed((current) => !current)}>
          <OperatorSidebarContent collapsed={collapsed} />
        </PortalSidebar>
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-brand-primary/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: EASE }}
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
            >
              <PortalSidebar {...sidebarProps} collapsed={false} onNavigate={() => setMobileOpen(false)}>
                <OperatorSidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
              </PortalSidebar>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <div className={["flex min-h-screen flex-col transition-all duration-300", sidebarPad].join(" ")}>
        <header className="sticky top-0 z-30 border-b border-brand-border/50 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-border/60 text-brand-muted transition-colors hover:border-brand-primary/20 hover:bg-brand-cream lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </button>
              <div className="hidden min-w-0 lg:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-primary">Operator hub</p>
                <p className="truncate text-sm font-bold text-brand-ink">
                  {user?.organization || user?.name || operatorMeta.label}
                </p>
              </div>
              <div className="min-w-0 lg:hidden">
                <p className="truncate text-sm font-bold text-brand-ink">{user?.organization || user?.name || "Operator hub"}</p>
                <p className="truncate text-[11px] text-brand-muted">{user?.name || operatorMeta.label}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <NavLink
                to={ROUTES.operator.tourNew}
                className="hidden items-center gap-1.5 rounded-xl bg-brand-accent px-3 py-2 text-xs font-semibold text-brand-primary shadow-sm transition-colors hover:bg-brand-accent-dark sm:inline-flex"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                New listing
              </NavLink>
              <AccountDropdown />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
