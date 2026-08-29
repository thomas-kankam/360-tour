import {
  mergeTourReviews,
  hasExistingTourReview,
  summarizeReviews,
} from "./tourReviewsHelpers";

describe("mergeTourReviews", () => {
  const publicReviews = [
    {
      id: "a",
      authorName: "Ama",
      rating: 5,
      comment: "Great tour",
      status: "approved",
      createdAt: "2026-01-01T00:00:00.000Z",
      tourSlug: "ghana-heritage",
    },
  ];

  test("returns approved public reviews for guests", () => {
    expect(mergeTourReviews(publicReviews, null)).toEqual(publicReviews);
  });

  test("prepends a pending own review for signed-in travelers", () => {
    const ownReview = {
      id: "b",
      rating: 4,
      comment: "Waiting",
      status: "pending",
      createdAt: "2026-02-01T00:00:00.000Z",
      tourSlug: "ghana-heritage",
    };

    const merged = mergeTourReviews(publicReviews, ownReview, "Thomas");
    expect(merged).toHaveLength(2);
    expect(merged[0].isOwnReview).toBe(true);
    expect(merged[0].status).toBe("pending");
    expect(merged[1].authorName).toBe("Ama");
  });

  test("marks an approved own review in the public list", () => {
    const ownReview = {
      id: "a",
      rating: 5,
      comment: "Great tour",
      status: "approved",
      createdAt: "2026-01-01T00:00:00.000Z",
      tourSlug: "ghana-heritage",
    };

    const merged = mergeTourReviews(publicReviews, ownReview, "Thomas");
    expect(merged).toHaveLength(1);
    expect(merged[0].isOwnReview).toBe(true);
  });
});

describe("hasExistingTourReview", () => {
  test("detects when a traveler already reviewed a tour", () => {
    expect(hasExistingTourReview({ id: "review-1" })).toBe(true);
    expect(hasExistingTourReview(null)).toBe(false);
  });
});

describe("summarizeReviews", () => {
  test("computes average from approved reviews only when filtered upstream", () => {
    const summary = summarizeReviews([
      { rating: 5, status: "approved" },
      { rating: 3, status: "approved" },
    ]);
    expect(summary.average).toBe(4);
    expect(summary.count).toBe(2);
  });
});
