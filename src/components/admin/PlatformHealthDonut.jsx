import { lazy, Suspense } from "react";

const PlatformHealthDonutChart = lazy(() => import("./PlatformHealthDonutChart"));

function ChartFallback() {
  return (
    <div className="flex w-full max-w-4xl flex-col items-center">
      <div
        className="mx-auto w-full max-w-[480px] animate-pulse rounded-full bg-brand-cream/70"
        style={{ height: 480 }}
        aria-hidden
      />
      <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-2xl bg-brand-cream/60" aria-hidden />
        ))}
      </div>
    </div>
  );
}

export default function PlatformHealthDonut(props) {
  return (
    <Suspense fallback={<ChartFallback />}>
      <PlatformHealthDonutChart {...props} />
    </Suspense>
  );
}
