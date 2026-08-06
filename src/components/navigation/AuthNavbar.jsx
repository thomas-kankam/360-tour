import NavbarShell from "./NavbarShell";
import AccountDropdown, { AccountMobileSection } from "./AccountDropdown";

export default function AuthNavbar() {
  const authActions = <AccountDropdown />;

  return <NavbarShell actions={authActions} mobileActions={<AccountMobileSection />} />;
}
