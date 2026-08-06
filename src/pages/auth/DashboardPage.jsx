import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import Container from "../../components/layout/Container";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { getBookings, isUpcoming } from "../../utils/bookingStorage";

const EASE = [0.16, 1, 0.3, 1];

function statusLabel(status) {
  const map = {
    paid: { text: "Paid", className: "bg-brand-green/10 text-brand-green" },
    deposit_paid: { text: "Deposit paid", className: "bg-brand-gold/15 text-brand-ink" },
    pay_onsite: { text: "Pay on-site", className: "bg-brand-orange/10 text-brand-orange" },
    reserved: { text: "Reserved", className: "bg-brand-muted/10 text-brand-muted" },
  };
  return map[status] || map.reserved;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    function refresh() {
      setBookings(getBookings());
    }
    refresh();
    window.addEventListener("afriqwest:bookings-updated", refresh);
    return () => window.removeEventListener("afriqwest:bookings-updated", refresh);
  }, []);

  const upcoming = bookings.filter(isUpcoming);
  const recent = bookings.slice(0, 3);

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">Traveler hub</p>
          <h1 className="mt-2 font-heading text-3xl text-brand-green sm:text-4xl">
            Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-3 max-w-2xl text-brand-muted">
            Your trips, bookings, and inquiries in one place. Pick up where you left off or explore new departures.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Upcoming trips", value: upcoming.length, sub: "Confirmed departures" },
            { label: "Total bookings", value: bookings.length, sub: "All time" },
            { label: "Open inquiries", value: "—", sub: "Contact follow-ups" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: EASE }}
              className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-brand-ink">{stat.value}</p>
              <p className="mt-1 text-xs text-brand-muted">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3 rounded-2xl border border-brand-border/60 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-brand-ink">Recent bookings</h2>
              <Link to={ROUTES.myBookings} className="text-sm font-semibold text-brand-green hover:underline">View all</Link>
            </div>
            {recent.length === 0 ? (
              <div className="mt-8 rounded-xl border border-dashed border-brand-border bg-brand-cream/50 px-6 py-10 text-center">
                <p className="font-semibold text-brand-ink">No bookings yet</p>
                <p className="mt-2 text-sm text-brand-muted">Browse live Ghana tours and reserve your spot.</p>
                <Link to={ROUTES.tours} className="btn-primary mt-5 inline-flex">Explore tours</Link>
              </div>
            ) : (
              <ul className="mt-5 divide-y divide-brand-border/50">
                {recent.map((b) => {
                  const status = statusLabel(b.status);
                  return (
                    <li key={b.bookingRef} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0">
                      <div>
                        <p className="font-semibold text-brand-ink">{b.tourName}</p>
                        <p className="text-xs text-brand-muted">{b.bookingRef} · {b.selectedDate || "Date TBC"}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${status.className}`}>{status.text}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <aside className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-brand-green p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-gold">Quick links</p>
              <ul className="mt-4 space-y-3 text-sm font-semibold">
                <li><Link to={ROUTES.tours} className="hover:text-brand-gold">→ Browse tours</Link></li>
                <li><Link to={ROUTES.myBookings} className="hover:text-brand-gold">→ My bookings</Link></li>
                <li><Link to={ROUTES.myInquiries} className="hover:text-brand-gold">→ My inquiries</Link></li>
                <li><Link to={ROUTES.profile} className="hover:text-brand-gold">→ Profile settings</Link></li>
              </ul>
            </div>
            <div className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">Need help?</p>
              <p className="mt-2 text-sm text-brand-muted">Our consultants can tailor group itineraries across Ghana, Kenya, and South Africa.</p>
              <Link to={ROUTES.contact} className="mt-4 inline-flex text-sm font-semibold text-brand-green hover:underline">Contact us →</Link>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
