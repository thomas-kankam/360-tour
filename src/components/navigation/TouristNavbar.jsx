import NavbarShell from "./NavbarShell";
import AccountDropdown, { AccountMobileSection } from "./AccountDropdown";

export default function TouristNavbar() {
  const actions = <AccountDropdown />;

  const mobileActions = (
    <AccountMobileSection onNavigate={() => {}} />
  );

  return <NavbarShell actions={actions} mobileActions={mobileActions} />;
}
