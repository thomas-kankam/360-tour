import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import operatorToursServiceApi from "../../apis/OperatorToursServiceApi";
import TourListingForm from "../../components/operator/TourListingForm";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { createEmptyTourListing } from "../../utils/operatorTourStorage";
import { mapOperatorTourToForm } from "../../utils/operatorTourMapper";

export default function OperatorTourFormPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEdit = Boolean(slug);
  const isCreate = !isEdit;

  const [initial, setInitial] = useState(() => createEmptyTourListing());
  const [loading, setLoading] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isEdit || !token) return undefined;

    let active = true;
    async function loadTour() {
      setLoading(true);
      const result = await operatorToursServiceApi.getTour(token, slug);
      if (!active) return;

      setLoading(false);
      if (!result.ok || !result.tour) {
        setNotFound(true);
        return;
      }

      setInitial(mapOperatorTourToForm(result.tour));
    }

    loadTour();
    return () => {
      active = false;
    };
  }, [isEdit, slug, token]);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-brand-border/60 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" strokeWidth={2} aria-hidden />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="rounded-2xl border border-brand-border bg-white p-10 text-center">
        <p className="font-semibold text-brand-ink">Listing not found</p>
        <Link to={ROUTES.operator.tours} className="btn-primary mt-4 inline-flex">Back to listings</Link>
      </div>
    );
  }

  async function handleSubmit(payload) {
    if (!token) return;

    const result = isEdit
      ? await operatorToursServiceApi.updateTour(token, slug, payload)
      : await operatorToursServiceApi.createTour(token, payload);

    if (!result.ok) {
      toast.error(result.reason || result.message);
      return;
    }

    toast.success(result.reason || (isEdit ? "Tour updated successfully." : "Tour created successfully."));
    navigate(result.tour?.slug ? ROUTES.operator.tourDetail(result.tour.slug) : ROUTES.operator.tours, { replace: true });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
          {isCreate ? "New listing" : "Edit listing"}
        </p>
        <h1 className="mt-1 font-heading text-3xl text-brand-ink">
          {isCreate ? "Create tour listing" : initial.name || "Update tour"}
        </h1>
        <p className="mt-2 text-sm text-brand-muted">
          {isCreate
            ? "Walk through each step — add cities in travel order, upload images, and publish when ready."
            : "Update your listing details, adjust departures, and save when ready."}
        </p>
      </div>
      <TourListingForm
        initial={initial}
        onSubmit={handleSubmit}
        submitLabel={isCreate ? "Create listing" : "Save changes"}
        isUpdate={isEdit}
      />
    </div>
  );
}
