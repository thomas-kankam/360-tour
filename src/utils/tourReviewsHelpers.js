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
    id: raw.id ?? raw.uuid ?? raw.rating_uuid ?? raw.slug ?? "",
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

const REVIEW_STATUS_LABELS = {
  pending: "Pending approval",
  approved: "Published",
  rejected: "Not published",
};

export function getReviewStatusLabel(status) {
  return REVIEW_STATUS_LABELS[status] ?? status;
}

/** Merge a signed-in traveler's own review with the public approved list. */
export function mergeTourReviews(publicReviews, ownReview, authorName = "You") {
  const approvedPublic = (publicReviews ?? []).filter((item) => item?.status === "approved");

  if (!ownReview?.id) {
    return approvedPublic;
  }

  const ownEntry = {
    ...mapPublicReview({
      ...ownReview,
      author_name: authorName,
    }),
    isOwnReview: true,
    status: ownReview.status ?? "pending",
  };

  const withoutDuplicate = approvedPublic.filter((item) => item.id !== ownReview.id);

  if (ownReview.status === "approved") {
    const alreadyListed = approvedPublic.some((item) => item.id === ownReview.id);
    if (alreadyListed) {
      return approvedPublic.map((item) =>
        item.id === ownReview.id ? { ...item, isOwnReview: true, authorName } : item,
      );
    }
    return [ownEntry, ...withoutDuplicate];
  }

  return [ownEntry, ...withoutDuplicate];
}

export function hasExistingTourReview(ownReview) {
  return Boolean(ownReview?.id);
}
