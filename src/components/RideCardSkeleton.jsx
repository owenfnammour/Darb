// Grey placeholder shaped like a RideCard, shown while rides are loading.
// The seat row and the button keep their space so nothing jumps when the data lands.
export default function RideCardSkeleton() {
  return (
    <li className="rounded-card border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="w-full space-y-2.5">
          <span className="block h-5 w-3/5 animate-pulse rounded bg-brand-100"></span>
          <span className="block h-3.5 w-2/5 animate-pulse rounded bg-brand-100"></span>
        </div>
        <span className="h-8 w-8 flex-none animate-pulse rounded-full bg-brand-100"></span>
      </div>
      <div className="my-4 h-0.5 w-full animate-pulse rounded bg-brand-100"></div>
      <div className="flex items-center justify-between gap-3">
        <span className="h-5 w-40 animate-pulse rounded bg-brand-100"></span>
        <span className="h-8 w-32 animate-pulse rounded-card bg-brand-100"></span>
      </div>
    </li>
  )
}
