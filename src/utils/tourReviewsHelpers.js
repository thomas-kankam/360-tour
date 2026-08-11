const STORAGE_KEY = "360tours_public_reviews";

export function mapPublicReview(raw) {
  if (!raw) return null;

  const authorName =
    raw.client_name ??
    raw.clientName ??
    raw.author_name ??
    raw.authorName ??
    "Traveler";

  return {
    id: raw.id ?? raw.uuid ?? raw.slug ?? crypto.randomUUID(),
    tourSlug: raw.tour_slug ?? raw.tourSlug ?? raw.tour?.slug ?? "",
    tourTitle: raw.tour_title ?? raw.tourTitle ?? raw.tour?.title ?? "",
    authorName,
    rating: Number(raw.rating ?? raw.score ?? 0),
    comment: raw.comment ?? raw.review ?? raw.body ?? "",
    status: raw.status ?? "approved",
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
  };
}

function readAllReviews() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAllReviews(reviews) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export function getLocalTourReviews(tourSlug, { approvedOnly = true } = {}) {
  return readAllReviews()
    .filter((item) => item.tourSlug === tourSlug)
    .filter((item) => (approvedOnly ? item.status === "approved" : true))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function saveLocalTourReview(review) {
  const items = readAllReviews();
  items.unshift(review);
  writeAllReviews(items);
  return review;
}

export function buildLocalPendingReview({ tourSlug, tourTitle, rating, comment, clientName, clientId }) {
  return {
    id: crypto.randomUUID(),
    tourSlug,
    tourTitle,
    authorName: clientName || "Traveler",
    clientId: clientId || "",
    rating: Number(rating) || 0,
    comment: comment?.trim() || "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

export function summarizeReviews(reviews) {
  if (!reviews.length) {
    return { average: 0, count: 0 };
  }

  const total = reviews.reduce((sum, item) => sum + (Number(item.rating) || 0), 0);
  return {
    average: Math.round((total / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}

export function formatReviewDate(iso) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
  } catch {
    return "";
  }
}
