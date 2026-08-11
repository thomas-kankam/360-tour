import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Loader2, MessageSquare, Star } from "lucide-react";
import { toast } from "react-toastify";
import consumerRatingsServiceApi from "../../apis/ConsumerRatingsServiceApi";
import publicRatingsServiceApi from "../../apis/PublicRatingsServiceApi";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import {
  formatReviewDate,
  summarizeReviews,
} from "../../utils/tourReviewsHelpers";

function StarPicker({ value, onChange, disabled }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Your rating">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const active = starValue <= value;
        return (
          <button
            key={starValue}
            type="button"
            disabled={disabled}
            onClick={() => onChange(starValue)}
            className="rounded p-0.5 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`${starValue} star${starValue !== 1 ? "s" : ""}`}
            aria-pressed={active}
          >
            <Star
              className={[
                "h-7 w-7",
                active ? "fill-brand-accent text-brand-accent" : "text-brand-border",
              ].join(" ")}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}

function StarDisplay({ value, size = "md" }) {
  const rounded = Math.round(Number(value) || 0);
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={[
            sizeClass,
            index < rounded ? "fill-brand-accent text-brand-accent" : "text-brand-border",
          ].join(" ")}
          strokeWidth={1.5}
          aria-hidden
        />
      ))}
    </span>
  );
}

function ReviewCard({ review }) {
  return (
    <article className="rounded-2xl border border-brand-border/60 bg-brand-cream/30 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-brand-ink">{review.authorName}</p>
          <p className="mt-0.5 text-xs text-brand-muted">{formatReviewDate(review.createdAt)}</p>
        </div>
        <StarDisplay value={review.rating} />
      </div>
      {review.comment ? (
        <p className="mt-3 text-sm leading-relaxed text-brand-muted">{review.comment}</p>
      ) : null}
    </article>
  );
}

export default function TourReviewsSection({ tourSlug, tourTitle }) {
  const { token, isAuthenticated, isTourist, user } = useAuth();
  const location = useLocation();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const loadReviews = useCallback(async () => {
    if (!tourSlug) return;
    setLoading(true);
    const result = await publicRatingsServiceApi.getTourReviews(tourSlug);
    setLoading(false);
    setReviews(result.items ?? []);
  }, [tourSlug]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const summary = summarizeReviews(reviews);
  const canSubmit = isAuthenticated && isTourist && !submitted;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit || !token) return;

    if (rating < 1) {
      toast.error("Please select a star rating.");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a short comment about your experience.");
      return;
    }

    setSubmitting(true);
    const result = await consumerRatingsServiceApi.submitReview(token, {
      tourSlug,
      tourTitle,
      rating,
      comment,
      clientName: user?.name || user?.firstName,
      clientId: user?.id || user?.slug,
    });
    setSubmitting(false);

    if (!result.ok) {
      toast.error(result.reason || result.message || "Could not submit review.");
      return;
    }

    toast.success(result.reason || "Review submitted for approval.");
    setSubmitted(true);
    setRating(0);
    setComment("");
    loadReviews();
  }

  const loginHref = ROUTES.login;
  const loginState = { from: { pathname: location.pathname, hash: "#tour-reviews" } };

  return (
    <section id="tour-reviews" className="scroll-mt-24 rounded-3xl border border-brand-border/50 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">Traveler reviews</p>
          <h2 className="mt-2 font-heading text-xl font-bold text-brand-ink sm:text-2xl">
            What guests say about this tour
          </h2>
          {summary.count > 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StarDisplay value={summary.average} />
              <span className="text-sm font-bold text-brand-ink">{summary.average.toFixed(1)}</span>
              <span className="text-sm text-brand-muted">
                · {summary.count} review{summary.count !== 1 ? "s" : ""}
              </span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-brand-muted">
              Reviews from verified travelers appear here after admin approval.
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-brand-muted">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        </div>
      ) : reviews.length > 0 ? (
        <div className="mt-6 space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-brand-border/70 bg-brand-cream/40 px-6 py-10 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-brand-muted/50" strokeWidth={1.5} aria-hidden />
          <p className="mt-3 text-sm font-semibold text-brand-ink">No published reviews yet</p>
          <p className="mt-1 text-sm text-brand-muted">
            Be among the first to share feedback on this tour after your trip.
          </p>
        </div>
      )}

      <div className="mt-8 border-t border-brand-border/50 pt-6">
        <h3 className="text-sm font-bold text-brand-ink">Leave a review</h3>

        {!isAuthenticated ? (
          <div className="mt-4 rounded-2xl border border-brand-primary/15 bg-brand-primary/[0.04] px-5 py-5">
            <p className="text-sm text-brand-muted">
              Sign in to your traveler account to rate this tour and share your experience with others.
            </p>
            <Link
              to={loginHref}
              state={loginState}
              className="btn-primary mt-4 inline-flex px-5 py-2.5 text-sm"
            >
              Sign in to leave a review
            </Link>
          </div>
        ) : null}

        {isAuthenticated && !isTourist ? (
          <p className="mt-3 text-sm text-brand-muted">
            Switch to your traveler account to submit a tour review.
          </p>
        ) : null}

        {canSubmit ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">Your rating</p>
              <div className="mt-2">
                <StarPicker value={rating} onChange={setRating} disabled={submitting} />
              </div>
            </div>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-muted">Your review</span>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={submitting}
                placeholder="What did you enjoy most? Would you recommend this tour?"
                className="mt-2 w-full rounded-xl border border-brand-border/70 bg-white px-4 py-3 text-sm outline-none focus:border-brand-green/50 focus:ring-2 focus:ring-brand-green/15 disabled:opacity-60"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Submit review
            </button>
            <p className="text-xs text-brand-muted">Reviews are moderated before they appear publicly.</p>
          </form>
        ) : null}

        {submitted ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Thank you! Your review was submitted and will appear here once approved.
          </div>
        ) : null}
      </div>
    </section>
  );
}
