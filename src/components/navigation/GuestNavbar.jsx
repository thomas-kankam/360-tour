import { Link } from "react-router";
import NavbarShell from "./NavbarShell";
import { ROUTES } from "../../constants/routes";

const guestActions = (
  <>
    <Link
      to={ROUTES.login}
      className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-brand-primary transition-colors duration-200 hover:bg-brand-primary/[0.06]"
    >
      Sign in
    </Link>
    <Link
      to={ROUTES.signup}
      className="btn-accent shadow-[0_6px_20px_-6px_rgba(255,219,88,0.85)]"
    >
      Get started
    </Link>
  </>
);

const guestMobileActions = (
  <>
    <Link to={ROUTES.login} className="btn-secondary w-full justify-center py-3">
      Sign in
    </Link>
    <Link
      to={ROUTES.signup}
      className="btn-accent w-full justify-center py-3 shadow-[0_6px_20px_-6px_rgba(255,219,88,0.85)]"
    >
      Get started
    </Link>
  </>
);

export default function GuestNavbar() {
  return <NavbarShell actions={guestActions} mobileActions={guestMobileActions} />;
}
