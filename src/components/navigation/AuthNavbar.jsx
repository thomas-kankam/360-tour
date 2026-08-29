import NavbarShell from "./NavbarShell";
import { AccountMobileSection, AuthenticatedNavActions } from "./AccountDropdown";

export default function AuthNavbar() {
  return <NavbarShell actions={<AuthenticatedNavActions />} mobileActions={<AccountMobileSection />} />;
}
