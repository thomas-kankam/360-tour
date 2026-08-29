import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  CalendarCheck,
  Globe,
  Loader2,
  Map,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import adminBookingsServiceApi from "../../apis/AdminBookingsServiceApi";
import adminContactsServiceApi from "../../apis/AdminContactsServiceApi";
import adminListingsServiceApi from "../../apis/AdminListingsServiceApi";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import {
  AdminMobileCard,
  AdminMobileCardBody,
  AdminMobileCardHeader,
  AdminMobileCardRow,
  AdminTableDesktop,
  AdminTableMobile,
} from "../../components/admin/AdminResponsiveTable";
import PlatformHealthDonut from "../../components/admin/PlatformHealthDonut";
import AdminActivePermissionsCard from "../../components/admin/AdminActivePermissionsCard";
import { buildListQueryParams, mapServerPagination } from "../../utils/adminPaginationHelpers";
import { formatContactDate, formatContactLabel } from "../../utils/adminContactHelpers";

const EASE = [0.22, 1, 0.36, 1];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function StatPill({ label, value, icon: Icon, loading = false }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/8 bg-white px-5 py-4 shadow-sm">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-cream text-brand-primary">
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>
      <div>
        <p className="text-2xl font-bold leading-none text-brand-ink">
          {loading ? "—" : value}
        </p>
        <p className="mt-0.5 text-xs text-brand-muted">{label}</p>
      </div>
    </div>
  );
}

function getDashboardBookingStatus(booking) {
  return booking.apiStatus || booking.status || "pending";
}

function BookingStatusBadge({ status }) {
  const statusMap = {
    confirmed: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    cancelled: "bg-red-100 text-red-700",
    "payment-processing": "bg-sky-100 text-sky-700",
    completed: "bg-brand-primary/10 text-brand-primary",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${statusMap[status] ?? "bg-brand-cream text-brand-muted"}`}>
      {(status || "pending").replace(/-/g, " ")}
    </span>
  );
}

function BookingRow({ booking, index }) {
  const status = getDashboardBookingStatus(booking);
  const amountLabel = booking.amountLabel || "—";

  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: EASE, delay: index * 0.04 }}
      className="group border-b border-black/5 last:border-0 hover:bg-brand-cream/30"
    >
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-brand-ink group-hover:text-brand-primary">
          {booking.tourTitle || booking.tour?.name || "Unnamed tour"}
        </p>
        <p className="text-xs text-brand-muted">{booking.travelerName || "—"}</p>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm text-brand-ink">{amountLabel}</p>
      </td>
      <td className="px-5 py-4">
        <BookingStatusBadge status={status} />
      </td>
    </motion.tr>
  );
}

export default function AdminDashboardPage() {
  const { user, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [totalBookings, setTotalBookings] = useState(null);
  const [totalListings, setTotalListings] = useState(null);
  const [publishedListings, setPublishedListings] = useState(null);
  const [bookingHealth, setBookingHealth] = useState({
    confirmed: 0,
    pending: 0,
    cancelled: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [totalContacts, setTotalContacts] = useState(null);
  const [recentContacts, setRecentContacts] = useState([]);

  useEffect(() => {
    if (!location.state?.accessDenied) return;

    toast.error("You don't have permission to access that area.");
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return undefined;
    }

    let active = true;

    async function loadDashboard() {
      setLoading(true);

      const [
        bookingsTotalResult,
        confirmedBookingsResult,
        pendingBookingsResult,
        cancelledBookingsResult,
        recentBookingsResult,
        listingsTotalResult,
        publishedListingsResult,
        contactsTotalResult,
        recentContactsResult,
      ] = await Promise.all([
        adminBookingsServiceApi.listBookings(token, buildListQueryParams({ page: 1, per_page: 1 })),
        adminBookingsServiceApi.listBookings(token, buildListQueryParams({ page: 1, per_page: 1, status: "confirmed" })),
        adminBookingsServiceApi.listBookings(token, buildListQueryParams({ page: 1, per_page: 1, status: "pending" })),
        adminBookingsServiceApi.listBookings(token, buildListQueryParams({ page: 1, per_page: 1, status: "cancelled" })),
        adminBookingsServiceApi.listBookings(token, buildListQueryParams({ page: 1, per_page: 15 })),
        adminListingsServiceApi.listListings(token, buildListQueryParams({ page: 1, per_page: 1 })),
        adminListingsServiceApi.listListings(token, buildListQueryParams({ page: 1, per_page: 1, status: "published" })),
        adminContactsServiceApi.listContacts(token, buildListQueryParams({ page: 1, per_page: 1 })),
        adminContactsServiceApi.listContacts(token, buildListQueryParams({ page: 1, per_page: 5 })),
      ]);

      if (!active) return;

      const failedResult = [
        bookingsTotalResult,
        confirmedBookingsResult,
        pendingBookingsResult,
        cancelledBookingsResult,
        recentBookingsResult,
        listingsTotalResult,
        publishedListingsResult,
        contactsTotalResult,
        recentContactsResult,
      ].find((result) => !result.ok);

      if (failedResult) {
        toast.error(failedResult.reason || failedResult.message || "Could not load dashboard metrics.");
      }

      setTotalBookings(mapServerPagination(bookingsTotalResult.pagination, { page: 1, pageSize: 1 }).totalItems);
      setBookingHealth({
        confirmed: mapServerPagination(confirmedBookingsResult.pagination, { page: 1, pageSize: 1 }).totalItems,
        pending: mapServerPagination(pendingBookingsResult.pagination, { page: 1, pageSize: 1 }).totalItems,
        cancelled: mapServerPagination(cancelledBookingsResult.pagination, { page: 1, pageSize: 1 }).totalItems,
      });
      setRecentBookings(recentBookingsResult.ok ? recentBookingsResult.items : []);
      setTotalListings(mapServerPagination(listingsTotalResult.pagination, { page: 1, pageSize: 1 }).totalItems);
      setPublishedListings(mapServerPagination(publishedListingsResult.pagination, { page: 1, pageSize: 1 }).totalItems);
      setTotalContacts(mapServerPagination(contactsTotalResult.pagination, { page: 1, pageSize: 1 }).totalItems);
      setRecentContacts(recentContactsResult.ok ? recentContactsResult.items : []);
      setLoading(false);
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [token]);

  const permissions = user?.permissions ?? [];
  const permNames = permissions.map((p) => p.name);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="flex flex-wrap items-start justify-between gap-5"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
            {getGreeting()}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-brand-ink sm:text-4xl">
            {user?.firstName ? `${user.firstName}'s dashboard` : "Admin dashboard"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-brand-muted">
            Platform-level control across {permissions.length} active permission module{permissions.length !== 1 ? "s" : ""}.
          </p>
        </div>

        <span className="rounded-full border border-brand-border bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-ink">
          {user?.roleLabel || user?.roleSlug || "administrator"}
        </span>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <StatPill label="Total bookings" value={totalBookings ?? 0} icon={CalendarCheck} loading={loading} />
        <StatPill label="Total listings" value={totalListings ?? 0} icon={Map} loading={loading} />
        <StatPill label="Published tours" value={publishedListings ?? 0} icon={Globe} loading={loading} />
        <StatPill label="Contact enquiries" value={totalContacts ?? 0} icon={MessageSquare} loading={loading} />
        <StatPill label="Permissions" value={permissions.length} icon={ShieldCheck} />
      </div>

      {/* Platform health + administrator session */}
      <div className="grid gap-6 lg:grid-cols-5 lg:items-stretch">
        <section className="flex min-h-full flex-col rounded-2xl border border-black/8 bg-white p-6 shadow-sm lg:col-span-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-muted">Platform health</p>
          <div className="flex flex-1 items-center justify-center py-8 sm:py-10">
            <PlatformHealthDonut
              confirmedBookings={bookingHealth.confirmed}
              pendingPaymentBookings={bookingHealth.pending}
              cancelledBookings={bookingHealth.cancelled}
            />
          </div>
        </section>

        <aside className="flex min-h-full flex-col gap-4 lg:col-span-2">
          <div className="shrink-0 rounded-2xl bg-brand-ink p-6 text-white shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">Administrator session</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-gold text-lg font-bold text-brand-ink">
                {(user?.firstName?.[0] || "A").toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{user?.name || "Administrator"}</p>
                <p className="truncate text-xs text-white/50">{user?.email || user?.phone || "—"}</p>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/50">Role</span>
                <span className="font-semibold text-white">{user?.roleLabel || user?.roleSlug || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/50">Access modules</span>
                <span className="font-semibold text-brand-gold">{permissions.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/50">Status</span>
                <span className="font-semibold text-brand-primary">Active</span>
              </div>
            </div>
          </div>

          <AdminActivePermissionsCard permissions={permissions} className="min-h-0 flex-1" />
        </aside>
      </div>

      {/* Recent bookings — full width */}
      <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">Live data</p>
            <h2 className="mt-0.5 text-base font-bold text-brand-ink">Recent bookings</h2>
          </div>
          {permNames.includes("booking_management") && (totalBookings ?? 0) > 0 && (
            <Link
              to={ROUTES.admin.bookings}
              className="flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="mt-6 flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-black/12 bg-brand-cream/40">
            <Loader2 className="h-7 w-7 animate-spin text-brand-primary" strokeWidth={2} aria-hidden />
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/12 bg-brand-cream/40 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-muted/40 shadow-sm">
              <CalendarCheck className="h-7 w-7" strokeWidth={1.5} aria-hidden />
            </span>
            <div>
              <p className="text-base font-bold text-brand-ink">No bookings yet</p>
              <p className="mt-1 max-w-sm text-sm text-brand-muted">
                Traveler reservations will show up here as soon as bookings are made on the platform.
              </p>
            </div>
          </div>
        ) : (
          <>
            <AdminTableMobile columns={2} className="mt-4">
              {recentBookings.map((booking, index) => (
                <AdminMobileCard key={booking.bookingRef || booking.bookingCode || index}>
                  <AdminMobileCardHeader
                    title={booking.tourTitle || booking.tour?.name || "Unnamed tour"}
                    subtitle={booking.travelerName || "—"}
                    trailing={<BookingStatusBadge status={getDashboardBookingStatus(booking)} />}
                  />
                  <AdminMobileCardBody>
                    <AdminMobileCardRow
                      label="Amount"
                      value={booking.amountLabel || "—"}
                    />
                  </AdminMobileCardBody>
                </AdminMobileCard>
              ))}
            </AdminTableMobile>

            <AdminTableDesktop className="mt-4">
              <table className="w-full text-left">
                <thead className="border-b border-black/8 bg-brand-cream/50">
                  <tr>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Tour / Traveler</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Amount</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking, index) => (
                    <BookingRow key={booking.bookingRef || booking.bookingCode || index} booking={booking} index={index} />
                  ))}
                </tbody>
              </table>
            </AdminTableDesktop>
          </>
        )}
      </section>

      {/* Recent contact enquiries */}
      <section className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">Live data</p>
            <h2 className="mt-0.5 text-base font-bold text-brand-ink">Recent contact enquiries</h2>
          </div>
          {permNames.includes("contact_management") && (totalContacts ?? 0) > 0 && (
            <Link
              to={ROUTES.admin.contacts}
              className="flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="mt-6 flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-black/12 bg-brand-cream/40">
            <Loader2 className="h-7 w-7 animate-spin text-brand-primary" strokeWidth={2} aria-hidden />
          </div>
        ) : recentContacts.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/12 bg-brand-cream/40 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-muted/40 shadow-sm">
              <MessageSquare className="h-7 w-7" strokeWidth={1.5} aria-hidden />
            </span>
            <div>
              <p className="text-base font-bold text-brand-ink">No contact enquiries yet</p>
              <p className="mt-1 max-w-sm text-sm text-brand-muted">
                Messages from the contact form will appear here as soon as visitors submit them.
              </p>
            </div>
          </div>
        ) : (
          <>
            <AdminTableMobile columns={2} className="mt-4">
              {recentContacts.map((contact, index) => (
                <AdminMobileCard key={contact.id || index}>
                  <AdminMobileCardHeader
                    title={contact.fullname || "—"}
                    subtitle={contact.email || "—"}
                    trailing={
                      <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-sky-700">
                        {formatContactLabel(contact.status)}
                      </span>
                    }
                  />
                  <AdminMobileCardBody>
                    <AdminMobileCardRow label="Type" value={formatContactLabel(contact.type)} />
                    <AdminMobileCardRow label="Message" value={contact.message || "—"} />
                    <AdminMobileCardRow label="Received" value={formatContactDate(contact.created_at)} />
                  </AdminMobileCardBody>
                </AdminMobileCard>
              ))}
            </AdminTableMobile>

            <AdminTableDesktop className="mt-4">
              <table className="w-full text-left">
                <thead className="border-b border-black/8 bg-brand-cream/50">
                  <tr>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Contact</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Type</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Message</th>
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {recentContacts.map((contact, index) => (
                    <motion.tr
                      key={contact.id || index}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, ease: EASE, delay: index * 0.04 }}
                      className="group border-b border-black/5 last:border-0 hover:bg-brand-cream/30"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-brand-ink group-hover:text-brand-primary">
                          {contact.fullname || "—"}
                        </p>
                        <p className="text-xs text-brand-muted">{contact.email || "—"}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-brand-ink">{formatContactLabel(contact.type)}</td>
                      <td className="max-w-xs truncate px-5 py-4 text-sm text-brand-muted">{contact.message || "—"}</td>
                      <td className="px-5 py-4 text-sm text-brand-muted">{formatContactDate(contact.created_at)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </AdminTableDesktop>
          </>
        )}
      </section>
    </div>
  );
}
