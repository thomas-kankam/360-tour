import { BedDouble, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import ItineraryDayImageField from "./ItineraryDayImageField";

const emptyImage = () => ({ uri: "", data: "", mimeType: "image/jpeg" });

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-brand-ink">{label}</span>
      {hint ? <p className="mt-0.5 text-[11px] text-brand-muted">{hint}</p> : null}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function ToggleBlock({ enabled, onToggle, title, icon: Icon, children }) {
  return (
    <div className="mt-4 rounded-xl border border-brand-border/50 bg-white/80 p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary/30"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-ink">
            <Icon className="h-4 w-4 text-brand-primary" strokeWidth={2} aria-hidden />
            {title}
          </span>
        </span>
      </label>
      {enabled ? <div className="mt-4 space-y-4 border-t border-brand-border/40 pt-4">{children}</div> : null}
    </div>
  );
}

export default function ItineraryDayExtrasFields({ day, dayIndex, onChange }) {
  const accommodationEnabled = Boolean(day.accommodation);
  const mealsEnabled = Array.isArray(day.meals);

  function patchDay(next) {
    onChange(next);
  }

  function toggleAccommodation(checked) {
    if (!checked) {
      const { accommodation: _removed, ...rest } = day;
      patchDay(rest);
      return;
    }
    patchDay({
      ...day,
      accommodation: day.accommodation || { name: "", location: "", image: emptyImage() },
    });
  }

  function toggleMeals(checked) {
    if (!checked) {
      const { meals: _removed, ...rest } = day;
      patchDay(rest);
      return;
    }
    patchDay({
      ...day,
      meals: day.meals?.length ? day.meals : [{ name: "", image: emptyImage() }],
    });
  }

  function updateAccommodation(patch) {
    patchDay({
      ...day,
      accommodation: { ...(day.accommodation || {}), ...patch },
    });
  }

  function updateMeal(mealIndex, patch) {
    const meals = [...(day.meals || [])];
    meals[mealIndex] = { ...meals[mealIndex], ...patch };
    patchDay({ ...day, meals });
  }

  return (
    <>
      <ToggleBlock enabled={accommodationEnabled} onToggle={toggleAccommodation} title="Accommodation" icon={BedDouble}>
        <Field label="Name" hint="Hotel, lodge, or stay name shown on the tour page.">
          <input
            className="w-full rounded-xl border border-brand-border/70 bg-white px-3 py-2 text-sm outline-none focus:border-brand-primary/50"
            value={day.accommodation?.name || ""}
            onChange={(e) => updateAccommodation({ name: e.target.value })}
            placeholder="Oceanview Lodge"
          />
        </Field>
        <Field label="Location" hint="City or area — e.g. Cape Coast.">
          <input
            className="w-full rounded-xl border border-brand-border/70 bg-white px-3 py-2 text-sm outline-none focus:border-brand-primary/50"
            value={day.accommodation?.location || ""}
            onChange={(e) => updateAccommodation({ location: e.target.value })}
            placeholder="Cape Coast"
          />
        </Field>
        <ItineraryDayImageField
          dayNumber={day.day || dayIndex + 1}
          value={day.accommodation?.image}
          onChange={(image) => updateAccommodation({ image })}
        />
      </ToggleBlock>

      <ToggleBlock enabled={mealsEnabled} onToggle={toggleMeals} title="Meals" icon={UtensilsCrossed}>
        {(day.meals || []).map((meal, mealIndex) => (
          <div key={mealIndex} className="rounded-lg border border-brand-border/40 bg-brand-cream/30 p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">Meal {mealIndex + 1}</p>
              {(day.meals || []).length > 1 ? (
                <button
                  type="button"
                  onClick={() => patchDay({ ...day, meals: day.meals.filter((_, idx) => idx !== mealIndex) })}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Remove
                </button>
              ) : null}
            </div>
            <Field label="Meal name" hint="e.g. Welcome dinner, Breakfast buffet.">
              <input
                className="w-full rounded-xl border border-brand-border/70 bg-white px-3 py-2 text-sm outline-none focus:border-brand-primary/50"
                value={meal.name || ""}
                onChange={(e) => updateMeal(mealIndex, { name: e.target.value })}
                placeholder="Welcome dinner"
              />
            </Field>
            <div className="mt-3">
              <ItineraryDayImageField
                dayNumber={`${day.day || dayIndex + 1}-meal-${mealIndex + 1}`}
                value={meal.image}
                onChange={(image) => updateMeal(mealIndex, { image })}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            patchDay({
              ...day,
              meals: [...(day.meals || []), { name: "", image: emptyImage() }],
            })
          }
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add meal
        </button>
      </ToggleBlock>
    </>
  );
}
