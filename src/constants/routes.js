export const ROUTES = {
  home: "/",
  about: "/about",
  experiences: "/experiences",
  tours: "/tours",
  toursWithCountry: (countryId) =>
    countryId && countryId !== "all" ? `/tours?country=${countryId}` : "/tours",
  toursSearch: ({ country, date, package: packageId } = {}) => {
    const params = new URLSearchParams();
    if (country && country !== "all") params.set("country", country);
    if (packageId) params.set("package", packageId);
    if (date) params.set("date", date);
    const query = params.toString();
    return query ? `/tours?${query}` : "/tours";
  },
  tourBook: (slug) => `/tours/${slug}/book`,
  tourDetail: (slug) => `/tours/${slug}`,
  whyUs: "/why-us",
  stories: "/stories",
  storyDetail: (slug) => `/stories/${slug}`,
  contact: "/contact",
  login: "/login",
  signup: "/signup",
  verify: "/verify",
  dashboard: "/dashboard",
  profile: "/profile",
  myInquiries: "/my-inquiries",
  myBookings: "/my-bookings",
  myBookingDetail: (bookingCode) => `/my-bookings/${bookingCode}`,
  myBookingEdit: (bookingCode) => `/my-bookings/${bookingCode}/edit`,
  myPayments: "/my-payments",
  bookingSuccess: "/booking/success",
  paymentSuccess: (bookingCode) => {
    if (!bookingCode) return "/payment/success";
    const params = new URLSearchParams({ ref: bookingCode });
    return `/payment/success?${params.toString()}`;
  },
  paymentFailure: (bookingCode, reason) => {
    const params = new URLSearchParams();
    if (bookingCode) params.set("ref", bookingCode);
    if (reason) params.set("reason", reason);
    const query = params.toString();
    return query ? `/payment/failure?${query}` : "/payment/failure";
  },
  unauthorized: "/unauthorized",
  admin: {
    login: "/admin/login",
    dashboard: "/admin/dashboard",
    users: "/admin/users",
    userNew: "/admin/users/new",
    userDetail: (id) => `/admin/users/${id}`,
    userEdit: (id) => `/admin/users/${id}/edit`,
    clients: "/admin/clients",
    clientDetail: (clientSlug) => `/admin/clients/${encodeURIComponent(clientSlug)}`,
    bookings: "/admin/bookings",
    bookingDetail: (bookingCode) => `/admin/bookings/${encodeURIComponent(bookingCode)}`,
    payments: "/admin/payments",
    paymentDetail: (paymentSlug) => `/admin/payments/${encodeURIComponent(paymentSlug)}`,
    contacts: "/admin/contacts",
    contactDetail: (id) => `/admin/contacts/${id}`,
    listings: "/admin/listings",
    listingDetail: (slug) => `/admin/listings/${slug}`,
    operators: "/admin/operators",
    operatorDetail: (operatorSlug) => `/admin/operators/${encodeURIComponent(operatorSlug)}`,
    roles: "/admin/roles",
    profile: "/admin/profile",
  },
  operator: {
    dashboard: "/operator/dashboard",
    tours: "/operator/tours",
    tourNew: "/operator/tours/new",
    tourDetail: (slug) => `/operator/tours/${slug}`,
    tourEdit: (slug) => `/operator/tours/${slug}/edit`,
    bookings: "/operator/bookings",
    payments: "/operator/payments",
    paymentDetail: (paymentSlug) => `/operator/payments/${paymentSlug}`,
    profile: "/operator/profile",
  },
};
