import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  CreditCard,
  FileText,
  LayoutTemplate,
  Map,
  Menu,
  MessageSquare,
  Plus,
  ShieldCheck,
  Star,
  UserCircle,
  UserCog,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import ScrollToTop from "../components/misc/ScrollToTop";
import PortalSidebar, { PortalNavItem, PortalNavSection } from "../components/layout/PortalSidebar";
import AccountDropdown from "../components/navigation/AccountDropdown";
import { ADMIN_PERMISSIONS } from "../constants/adminPermissions";
import { company } from "../data/aboutContent";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../hooks/useAuth";

const EASE = [0.22, 1, 0.36, 1];

const PERMISSION_NAV_MAP = {
  [ADMIN_PERMISSIONS.USER_MANAGEMENT]: { to: ROUTES.admin.users, label: "Users & teams", icon: UserCog },
  [ADMIN_PERMISSIONS.ROLE_MANAGEMENT]: { to: ROUTES.admin.roles, label: "Roles & permissions", icon: BookOpen },
  [ADMIN_PERMISSIONS.LISTING_MANAGEMENT]: { to: ROUTES.admin.tours, label: "Tours", icon: Map },
  [ADMIN_PERMISSIONS.BOOKING_MANAGEMENT]: { to: ROUTES.admin.bookings, label: "Bookings", icon: CalendarCheck },
  [ADMIN_PERMISSIONS.CONTACT_MANAGEMENT]: { to: ROUTES.admin.contacts, label: "Enquiries", icon: MessageSquare },
  [ADMIN_PERMISSIONS.CLIENT_MANAGEMENT]: { to: ROUTES.admin.clients, label: "Clients", icon: Users },
};

const ALWAYS_ADMIN_NAV = [
  { key: "ratings", to: ROUTES.admin.ratings, label: "Ratings", icon: Star },
  { key: "invoices", to: ROUTES.admin.invoices, label: "Invoices", icon: FileText },
  { key: "landing-cms", to: ROUTES.admin.landingCms, label: "Landing CMS", icon: LayoutTemplate },
];

const BOOKING_EXTRA_NAV = [
  { to: ROUTES.admin.payments, label: "Payments", icon: CreditCard },
];

function AdminSidebarContent({ user, collapsed, onNavigate }) {
  const permissionNames = (user?.permissions ?? []).map((p) => p.name);

  const managementItems = Object.entries(PERMISSION_NAV_MAP).flatMap(([key, item]) => {
    if (!permissionNames.includes(key)) return [];

    const items = [{ key, ...item }];
    if (key === ADMIN_PERMISSIONS.BOOKING_MANAGEMENT) {
      BOOKING_EXTRA_NAV.forEach((extra) => {
        items.push({ key: `${key}-${extra.to}`, ...extra });
      });
    }
    return items;
  });

  const alwaysItems = ALWAYS_ADMIN_NAV.filter(
    (item) => !managementItems.some((existing) => existing.to === item.to),
  );

  const canManageTours = permissionNames.includes(ADMIN_PERMISSIONS.LISTING_MANAGEMENT);

  return (
    <>
      <PortalNavSection title="Overview" collapsed={collapsed}>
        <PortalNavItem
          to={ROUTES.admin.dashboard}
          label="Dashboard"
          icon={BarChart3}
          end
          collapsed={collapsed}
          onClick={onNavigate}
        />
      </PortalNavSection>

      {(managementItems.length > 0 || alwaysItems.length > 0) ? (
        <PortalNavSection title="Management" collapsed={collapsed}>
          {managementItems.map((item) => (
            <PortalNavItem
              key={item.key}
              to={item.to}
              label={item.label}
              icon={item.icon}
              collapsed={collapsed}
              onClick={onNavigate}
            />
          ))}
          {alwaysItems.map((item) => (
            <PortalNavItem
              key={item.key}
              to={item.to}
              label={item.label}
              icon={item.icon}
              collapsed={collapsed}
              onClick={onNavigate}
            />
          ))}
        </PortalNavSection>
      ) : null}

      {canManageTours ? (
        <PortalNavSection title="Quick actions" collapsed={collapsed}>
          <Link
            to={ROUTES.admin.tourNew}
            onClick={onNavigate}
            className={[
              "group flex items-center gap-3 rounded-xl bg-brand-green px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-green/90",
              collapsed ? "justify-center px-2" : "",
            ].join(" ")}
          >
            <Plus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            {!collapsed ? <span>Create tour</span> : null}
          </Link>
        </PortalNavSection>
      ) : null}

      <PortalNavSection title="Account" collapsed={collapsed}>
        <PortalNavItem
          to={ROUTES.admin.profile}
          label="Profile"
          icon={UserCircle}
          collapsed={collapsed}
          onClick={onNavigate}
        />
      </PortalNavSection>
    </>
  );
}

export default function AdminLayout() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarWidth = collapsed ? "w-[68px]" : "w-72";
  const sidebarPad = collapsed ? "lg:pl-[68px]" : "lg:pl-72";

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const sidebarProps = {
    portalLabel: "Admin console",
    portalSubtitle: company.name,
    collapsedIcon: ShieldCheck,
    user,
    showPublicSiteLink: true,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-brand-accent/10">
      <ScrollToTop />

      <aside className={["fixed inset-y-0 left-0 z-40 hidden transition-all duration-300 lg:block", sidebarWidth].join(" ")}>
        <PortalSidebar {...sidebarProps} collapsed={collapsed} onCollapse={() => setCollapsed((current) => !current)}>
          <AdminSidebarContent user={user} collapsed={collapsed} />
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
                <AdminSidebarContent user={user} collapsed={false} onNavigate={() => setMobileOpen(false)} />
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-primary">Administrator</p>
                <p className="truncate text-sm font-bold text-brand-ink">{user?.name || "Admin console"}</p>
              </div>
            </div>
            <AccountDropdown />
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
