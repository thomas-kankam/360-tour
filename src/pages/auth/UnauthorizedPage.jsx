import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import AppIcon from "../../components/icons/AppIcon";

export default function UnauthorizedPage() {
  const { homeRoute } = useAuth();

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-cream text-brand-green">
          <AppIcon name="lock" className="h-8 w-8" strokeWidth={1.5} />
        </div>
        <h1 className="mt-4 font-heading text-3xl text-brand-ink">Access restricted</h1>
        <p className="mt-3 text-sm text-brand-muted">
          This area is reserved for a different account type. Sign in with the correct role or return to your dashboard.
        </p>
        <Link to={homeRoute} className="btn-primary mt-8 inline-flex">Go to my dashboard</Link>
      </div>
    </section>
  );
}
