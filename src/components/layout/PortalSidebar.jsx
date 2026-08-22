import { NavLink } from "react-router";
import { ChevronLeft, ExternalLink, LogOut } from "lucide-react";
import { images } from "../../config/images";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";

export function PortalNavItem({ to, label, icon: Icon, end = false, collapsed = false, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-xl transition-all duration-200",
          collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5",
          isActive
            ? "bg-brand-accent text-brand-primary shadow-md ring-1 ring-brand-accent/40"
            : "text-white/75 hover:bg-white/10 hover:text-white",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={[
              "h-5 w-5 shrink-0 transition-colors",
              isActive ? "text-brand-primary" : "text-white/70 group-hover:text-white",
            ].join(" ")}
            strokeWidth={isActive ? 2 : 1.75}
            aria-hidden
          />
          {!collapsed && <span className="truncate text-sm font-semibold">{label}</span>}
        </>
      )}
    </NavLink>
  );
}

export function PortalNavSection({ title, collapsed, children }) {
  return (
    <div>
      {!collapsed ? (
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">{title}</p>
      ) : (
        <div className="mb-2 border-t border-white/10" aria-hidden />
      )}
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function PortalLogoHeader({ portalLabel, portalSubtitle, collapsed, collapsedIcon: CollapsedIcon }) {
  const headerBg = "border-b border-brand-border/50 bg-gradient-to-br from-[#FFFDF5] via-brand-cream to-brand-accent/10";

  if (collapsed) {
    return (
      <div className={["flex justify-center px-3 py-4", headerBg].join(" ")}>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-brand-border/40"
          title={portalLabel}
        >
          {CollapsedIcon ? (
            <CollapsedIcon className="h-5 w-5 text-brand-primary" strokeWidth={1.75} aria-hidden />
          ) : (
            <img src={images.general_logo} alt="360 Tours" className="h-full w-full object-contain" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={["px-5 py-4", headerBg].join(" ")}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-sm ring-1 ring-brand-border/40">
          <img src={images.general_logo} alt="360 Tours" className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-primary">{portalLabel}</p>
          <p className="truncate text-[11px] font-medium text-brand-muted">{portalSubtitle}</p>
        </div>
      </div>
    </div>
  );
}

export default function PortalSidebar({
  portalLabel,
  portalSubtitle,
  collapsedIcon,
  collapsed = false,
  onCollapse,
  onNavigate,
  user,
  showPublicSiteLink = false,
  children,
}) {
  const { logout } = useAuth();
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase()
    || (user?.name?.[0] || "U").toUpperCase();

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-brand-primary via-brand-primary to-brand-primary-dark shadow-[4px_0_28px_-12px_rgba(0,107,63,0.45)]">
      <PortalLogoHeader
        portalLabel={portalLabel}
        portalSubtitle={portalSubtitle}
        collapsed={collapsed}
        collapsedIcon={collapsedIcon}
      />

      <div className={["flex flex-1 flex-col gap-5 overflow-y-auto py-5", collapsed ? "px-3" : "px-4"].join(" ")}>
        {children}
      </div>

      <div className={["border-t border-white/10 py-4", collapsed ? "px-3" : "px-4"].join(" ")}>
        {!collapsed && (
          <div className="mb-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-accent text-sm font-bold text-brand-primary ring-2 ring-brand-accent/30">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.organization || user?.name || "Account"}
                </p>
                <p className="truncate text-[11px] text-white/50">
                  {user?.roleLabel || user?.name || user?.email || portalLabel}
                </p>
              </div>
            </div>

            {showPublicSiteLink ? (
              <NavLink
                to={ROUTES.home}
                onClick={onNavigate}
                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-accent transition-colors hover:text-white"
              >
                View public site
                <ExternalLink className="h-3 w-3" strokeWidth={2} aria-hidden />
              </NavLink>
            ) : null}
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          title={collapsed ? "Sign out" : undefined}
          className={[
            "flex w-full items-center gap-3 rounded-xl text-sm font-semibold text-white/65 transition-colors hover:bg-red-500/15 hover:text-red-300",
            collapsed ? "justify-center py-2.5" : "px-3 py-2.5",
          ].join(" ")}
        >
          <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
          {!collapsed && "Sign out"}
        </button>

        {onCollapse ? (
          <button
            type="button"
            onClick={onCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={[
              "mt-2 flex w-full items-center gap-3 rounded-xl text-sm font-semibold text-white/35 transition-colors hover:bg-white/5 hover:text-white/70",
              collapsed ? "justify-center py-2.5" : "px-3 py-2.5",
            ].join(" ")}
          >
            <ChevronLeft
              className={["h-4 w-4 shrink-0 transition-transform duration-300", collapsed ? "rotate-180" : ""].join(" ")}
              strokeWidth={2}
              aria-hidden
            />
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        ) : null}
      </div>
    </div>
  );
}
