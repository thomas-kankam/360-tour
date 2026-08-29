import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Loader2, MapPin, Star } from "lucide-react";
import { toast } from "react-toastify";
import Container from "../../components/layout/Container";
import consumerRatingsServiceApi from "../../apis/ConsumerRatingsServiceApi";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { formatReviewDate } from "../../utils/tourReviewsHelpers";

const EASE = [0.16, 1, 0.3, 1];

const STATUS_CONFIG = {
  pending: { label: "Pending approval", className: "bg-amber-100 text-amber-800 ring-amber-200" },
  approved: { label: "Published", className: "bg-emerald-100 text-emerald-700 ring-emerald-200" },
  rejected: { label: "Not published", className: "bg-red-100 text-red-700 ring-red-200" },
};

function StarDisplay({ value }) {
  const rounded = Math.round(Number(value) || 0);
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={[
            "h-4 w-4",
            index < rounded ? "fill-brand-accent text-brand-accent" : "text-brand-border",
          ].join(" ")}
          strokeWidth={1.5}
          aria-hidden
        />
      ))}
    </span>
  );
}

function buildTourReviewsHref(tourSlug, reviewId) {
  const base = ROUTES.tourDetail(tourSlug);
  if (!reviewId) return `${base}#tour-reviews`;
  return `${base}?review=${encodeURIComponent(reviewId)}#tour-reviews`;
}

function ReviewCard({ review, index }) {
  const status = STATUS_CONFIG[review.status] ?? STATUS_CONFIG.pending;
  const tourHref = review.tourSlug ? buildTourReviewsHref(review.tourSlug, review.id) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE, delay: Math.min(index * 0.06, 0.3) }}
      className="overflow-hidden rounded-[1.5rem] border border-brand-border/60 bg-white shadow-[0_10px_36px_-20px_rgba(23,19,14,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_44px_-18px_rgba(23,19,14,0.28)]"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative aspect-[16/9] shrink-0 overflow-hidden sm:aspect-auto sm:w-52 md:w-60">
          {review.tourImage ? (
            <img
              src={review.tourImage}
              alt={review.tourTitle}
              className="h-full w-full object-cover sm:min-h-[200px]"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full min-h-[160px] items-center justify-center bg-brand-cream sm:min-h-[200px]">
              <MapPin className="h-10 w-10 text-brand-primary/40" aria-hidden />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent sm:bg-gradient-to-r" />
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold leading-snug text-brand-ink sm:text-lg">{review.tourTitle}</h2>
              <div className="mt-2">
                <StarDisplay value={review.rating} />
              </div>
            </div>
            {review.createdAt ? (
              <p className="text-xs text-brand-muted">{formatReviewDate(review.createdAt)}</p>
            ) : null}
          </div>

          {review.comment ? (
            <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-brand-muted">{review.comment}</p>
          ) : (
            <p className="mt-4 text-sm italic text-brand-muted">No written comment.</p>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-brand-border/40 pt-4">
            {tourHref ? (
              <Link to={tourHref} className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm">
                {review.status === "approved" ? "View on tour page" : "View tour"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : null}
            {review.status === "pending" ? (
              <p className="text-xs text-brand-muted">Your review will appear on the tour page after approval.</p>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function MyReviewsPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      const result = await consumerRatingsServiceApi.listAllMyRatings(token);
      if (cancelled) return;
      setLoading(false);

      if (!result.ok) {
        toast.error(result.reason || result.message || "Could not load your reviews.");
        setReviews([]);
        return;
      }

      setReviews(result.items ?? []);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">Your feedback</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-brand-primary sm:text-4xl">My reviews</h1>
          <p className="mt-3 max-w-2xl text-brand-muted">
            Tours you have reviewed. Open a card to see your comment on the tour page once it is approved.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20 text-brand-muted">
            <Loader2 className="h-6 w-6 animate-spin" strokeWidth={1.75} aria-hidden />
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-brand-border/70 bg-white px-6 py-16 text-center">
            <Star className="mx-auto h-8 w-8 text-brand-muted/40" strokeWidth={1.5} aria-hidden />
            <p className="mt-3 text-sm font-semibold text-brand-ink">No reviews yet</p>
            <p className="mt-1 text-sm text-brand-muted">
              After a tour, share your experience from the tour page or your booking details.
            </p>
            <Link to={ROUTES.myBookings} className="btn-primary mt-6 inline-flex px-5 py-2.5 text-sm">
              View my bookings
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-5">
            {reviews.map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
