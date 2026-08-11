import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Loader2, Star } from "lucide-react";
import { toast } from "react-toastify";
import Container from "../../components/layout/Container";
import consumerRatingsServiceApi from "../../apis/ConsumerRatingsServiceApi";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";

const EASE = [0.16, 1, 0.3, 1];

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
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
      const result = await consumerRatingsServiceApi.listMyRatings(token);
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
          <h1 className="mt-2 font-heading text-3xl font-bold text-brand-green sm:text-4xl">My reviews</h1>
          <p className="mt-3 max-w-2xl text-brand-muted">
            Ratings and comments you have submitted for completed tours.
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
              After a tour, you can share your experience from your booking details.
            </p>
            <Link to={ROUTES.myBookings} className="btn-primary mt-6 inline-flex px-5 py-2.5 text-sm">
              View my bookings
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {reviews.map((review, index) => (
              <motion.article
                key={review.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04, ease: EASE }}
                className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    {review.tourSlug ? (
                      <Link
                        to={ROUTES.tourDetail(review.tourSlug)}
                        className="text-base font-bold text-brand-primary hover:underline"
                      >
                        {review.tourTitle}
                      </Link>
                    ) : (
                      <p className="text-base font-bold text-brand-ink">{review.tourTitle}</p>
                    )}
                    <div className="mt-2">
                      <StarDisplay value={review.rating} />
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[review.status] ?? "bg-brand-cream text-brand-muted"}`}
                  >
                    {review.status}
                  </span>
                </div>
                {review.comment ? (
                  <p className="mt-4 text-sm leading-relaxed text-brand-muted">{review.comment}</p>
                ) : null}
              </motion.article>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
