import { NavLink } from "react-router";
import { CalendarCheck, LayoutDashboard, LogOut, Map, Plus } from "lucide-react";
import NavbarShell from "./NavbarShell";
import AccountDropdown from "./AccountDropdown";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";

const linkClass = ({ isActive }) =>
  [
    "relative text-sm transition-colors duration-200",
    isActive
      ? "font-semibold text-brand-primary after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-brand-orange"
      : "font-medium text-brand-muted hover:text-brand-primary",
  ].join(" ");

export default function OperatorNavbar() {
  const { logout } = useAuth();

  const actions = (
    <>
      <NavLink to={ROUTES.operator.dashboard} className={linkClass}>
        Dashboard
      </NavLink>
      <NavLink to={ROUTES.operator.tours} className={linkClass}>
        Listings
      </NavLink>
      <NavLink to={ROUTES.operator.bookings} className={linkClass}>
        Bookings
      </NavLink>
      <NavLink
        to={ROUTES.operator.tourNew}
        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-accent px-3 py-2 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-accent-dark"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        New listing
      </NavLink>
      <AccountDropdown />
    </>
  );

  const mobileActions = (
    <>
      <NavLink
        to={ROUTES.operator.dashboard}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium ${isActive ? "bg-brand-primary/10 text-brand-primary" : "text-brand-ink hover:bg-brand-cream"}`
        }
      >
        <LayoutDashboard className="h-4 w-4 opacity-70" strokeWidth={1.75} aria-hidden />
        Dashboard
      </NavLink>
      <NavLink
        to={ROUTES.operator.tours}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium ${isActive ? "bg-brand-primary/10 text-brand-primary" : "text-brand-ink hover:bg-brand-cream"}`
        }
      >
        <Map className="h-4 w-4 opacity-70" strokeWidth={1.75} aria-hidden />
        Listings
      </NavLink>
      <NavLink
        to={ROUTES.operator.bookings}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium ${isActive ? "bg-brand-primary/10 text-brand-primary" : "text-brand-ink hover:bg-brand-cream"}`
        }
      >
        <CalendarCheck className="h-4 w-4 opacity-70" strokeWidth={1.75} aria-hidden />
        Bookings
      </NavLink>
      <NavLink
        to={ROUTES.operator.tourNew}
        className="flex items-center gap-3 rounded-xl bg-brand-orange/10 px-4 py-3 text-base font-semibold text-brand-orange"
      >
        <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
        New listing
      </NavLink>
      <NavLink
        to={ROUTES.home}
        className={({ isActive }) =>
          `block rounded-xl px-4 py-3 text-base font-medium ${isActive ? "bg-brand-primary/10 text-brand-primary" : "text-brand-ink hover:bg-brand-cream"}`
        }
      >
        Public site
      </NavLink>
      <button type="button" onClick={logout} className="btn-secondary w-full justify-center py-3">
        <LogOut className="mr-2 h-4 w-4" strokeWidth={1.75} aria-hidden />
        Sign out
      </button>
    </>
  );

  return <NavbarShell actions={actions} mobileActions={mobileActions} />;
}
