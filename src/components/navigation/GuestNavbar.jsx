import { Link } from "react-router";
import NavbarShell from "./NavbarShell";
import AccountDropdown, { AccountMobileSection } from "./AccountDropdown";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";

const guestActions = (
  <>
    <Link
      to={ROUTES.login}
      className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-brand-primary transition-colors duration-200 hover:bg-brand-primary/[0.06]"
    >
      Sign in
    </Link>
    <Link to={ROUTES.tours} className="btn-accent shadow-gold">
      Book a tour
    </Link>
  </>
);

const guestMobileActions = (
  <>
    <Link to={ROUTES.login} className="btn-secondary w-full justify-center py-3">
      Sign in
    </Link>
    <Link to={ROUTES.tours} className="btn-accent w-full justify-center py-3 shadow-gold">
      Book a tour
    </Link>
  </>
);

export default function GuestNavbar() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <NavbarShell
        actions={<AccountDropdown />}
        mobileActions={<AccountMobileSection />}
      />
    );
  }

  return <NavbarShell actions={guestActions} mobileActions={guestMobileActions} />;
}
