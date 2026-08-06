import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { BadgeCheck, MapPin, Plus } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import operatorToursServiceApi from "../../apis/OperatorToursServiceApi";
import operatorBookingsServiceApi from "../../apis/OperatorBookingsServiceApi";
import { buildLocationsLabel } from "../../utils/operatorTourMapper";
import { summarizeOperatorOpenSpots } from "../../utils/operatorTourConstants";
import { mapServerPagination } from "../../utils/adminPaginationHelpers";

const EASE = [0.16, 1, 0.3, 1];

function StatCard({ label, value, sub, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="relative overflow-hidden rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm"
    >
      <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-20 blur-2xl ${accent}`} />
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-brand-ink">{value}</p>
      {sub ? <p className="mt-1 text-xs text-brand-muted">{sub}</p> : null}
    </motion.div>
  );
}

function statusPill(status) {
  const map = {
    published: "bg-brand-green/10 text-brand-green",
    draft: "bg-brand-gold/15 text-brand-ink",
    archived: "bg-brand-muted/10 text-brand-muted",
  };
  return map[status] || map.draft;
}

export default function OperatorDashboardPage() {
  const { user, token } = useAuth();
  const [tours, setTours] = useState([]);
  const [bookingsTotal, setBookingsTotal] = useState(null);

  useEffect(() => {
    if (!token) return undefined;

    let active = true;
    async function load() {
      const [toursResult, bookingsResult] = await Promise.all([
        operatorToursServiceApi.listTours(token, { page: 1, per_page: 15 }),
        operatorBookingsServiceApi.listBookings(token, { page: 1, per_page: 1 }),
      ]);

      if (!active) return;

      if (toursResult.ok) setTours(toursResult.items || []);

      if (bookingsResult.ok) {
        const { totalItems } = mapServerPagination(bookingsResult.pagination, { page: 1, pageSize: 1 });
        setBookingsTotal(totalItems);
      } else {
        setBookingsTotal(0);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [token]);

  const published = tours.filter((t) => t.status === "published").length;
  const drafts = tours.filter((t) => t.status === "draft").length;
  const openSpotsSummary = useMemo(() => summarizeOperatorOpenSpots(tours), [tours]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">Operator dashboard</p>
          <h1 className="mt-1 font-heading text-3xl text-brand-ink sm:text-4xl">
            Welcome back{user?.firstName ? `, ${user.firstName}` : user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-brand-muted">
            Manage tour listings, departure capacity, and bookings for{" "}
            <span className="font-semibold text-brand-ink">{user?.organization || "your tourist site"}</span>.
          </p>
          {user?.location ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-brand-muted">
              <MapPin className="h-3.5 w-3.5 text-brand-green" strokeWidth={1.75} aria-hidden />
              {user.location}
            </p>
          ) : null}
        </div>
        <Link to={ROUTES.operator.tourNew} className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
          Create listing
        </Link>
      </div>

      {user?.isVerified ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-green/20 bg-brand-green/8 px-4 py-2 text-sm font-semibold text-brand-green">
          <BadgeCheck className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          Verified operator account
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Live listings" value={published} sub={`${drafts} draft${drafts === 1 ? "" : "s"} in progress`} accent="bg-brand-green" />
        <StatCard label="Total listings" value={tours.length} sub="All statuses" accent="bg-brand-gold" />
        <StatCard label="Open spots" value={openSpotsSummary.value} sub={openSpotsSummary.sub} accent="bg-brand-orange" />
        <StatCard
          label="Bookings"
          value={bookingsTotal == null ? "—" : bookingsTotal}
          sub={bookingsTotal == null ? "Loading reservations…" : "All reservations"}
          accent="bg-brand-ink"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3 rounded-2xl border border-brand-border/60 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-brand-ink">Recent listings</h2>
            <Link to={ROUTES.operator.tours} className="text-sm font-semibold text-brand-green hover:underline">View all</Link>
          </div>
          {tours.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-brand-border bg-brand-cream/60 px-6 py-10 text-center">
              <p className="text-sm font-semibold text-brand-ink">No listings yet</p>
              <p className="mt-2 text-sm text-brand-muted">Create your first tour using the API-aligned form.</p>
              <Link to={ROUTES.operator.tourNew} className="btn-primary mt-5 inline-flex">Create first listing</Link>
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-brand-border/50">
              {tours.slice(0, 5).map((tour) => (
                <li key={tour.slug || tour.name} className="flex flex-wrap items-center gap-4 py-4 first:pt-0">
                  <img src={tour.coverImageUrl} alt="" className="h-14 w-20 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-brand-ink">{tour.name || "Untitled"}</p>
                    <p className="text-xs text-brand-muted">{buildLocationsLabel(tour.locations) || tour.country}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusPill(tour.status)}`}>
                    {tour.status}
                  </span>
                  <Link to={ROUTES.operator.tourDetail(tour.slug)} className="text-sm font-semibold text-brand-green hover:underline">Manage</Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-brand-ink p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-gold">Quick actions</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link to={ROUTES.operator.tourNew} className="font-semibold hover:text-brand-gold">→ Add new tour listing</Link></li>
              <li><Link to={ROUTES.operator.tours} className="font-semibold hover:text-brand-gold">→ Review all listings</Link></li>
              <li><Link to={ROUTES.operator.bookings} className="font-semibold hover:text-brand-gold">→ Check bookings</Link></li>
              <li><Link to={ROUTES.tours} className="font-semibold hover:text-brand-gold">→ Preview public catalog</Link></li>
            </ul>
          </div>
          <div className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">Publishing tip</p>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">
              Set status to <span className="font-semibold text-brand-ink">Published</span> and add at least one departure date before travelers can book.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
