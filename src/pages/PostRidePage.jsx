import { isDriverReviewClosed } from '../lib/rideForm.js'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import PageShell from '../components/PageShell.jsx'
import Breadcrumb from '../components/Breadcrumb.jsx'
import { ErrorState, Skeleton } from '../components/PageStates.jsx'
import usePageState from '../hooks/usePageState.js'
import { useRides, useViewer } from '../state/context.js'
import { RideForm } from '../components/RideForm.jsx'

export default function PostRidePage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const rideId = id ?? params.get('edit')
  const { rides } = useRides()
  const { viewer } = useViewer()
  const { status, retry } = usePageState()
  const ride = rides.find((item) => String(item.id) === String(rideId))
  const title = rideId ? 'Edit a ride' : 'Post a ride'
  function retryForm() {
    if (rideId && !id) navigate(`/ride/${encodeURIComponent(rideId)}/edit`, { replace: true })
    else retry()
  }
  let content
  if (!viewer) content = <div className="mt-6 rounded-card border border-line bg-surface p-6">
    <h2 className="font-display text-xl font-semibold text-brand-900">Sign in to post a ride</h2>
    <Link to="/sign-in" state={{ from: location.pathname + location.search }} className="mt-4 inline-block font-semibold text-brand-800 underline">Sign in</Link>
  </div>
  else if (status === 'loading') content = <div role="status" aria-label="Loading ride form" className="mt-6 space-y-4"><Skeleton className="h-36" /><Skeleton className="h-36" /></div>
  else if (status === 'error') content = <ErrorState title="We could not load this ride" text="Please try again." onRetry={retryForm} />
  else if (rideId && (!ride || ride.driverId !== viewer.id || isDriverReviewClosed(ride))) content = <div className="mt-6">
    <h2 className="font-display text-xl font-semibold text-brand-900">This ride is unavailable</h2>
    <p className="mt-2 text-sm text-muted">You can edit your own active rides.</p>
    <Link to="/my-rides/driving" className="mt-4 inline-block font-semibold text-brand-800 underline">Back to my rides</Link>
  </div>
  else content = <RideForm key={`${viewer.id}-${rideId ?? 'new'}`} ride={rideId ? ride : undefined} />
  return <PageShell active="Post a ride"><title>{title} — Darb</title>
    <div className="mx-auto max-w-5xl"><Breadcrumb current={title} />
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-brand-900">{title}</h1>
      <p className="mt-1.5 max-w-prose text-sm text-muted">{rideId ? 'Update your trip. Your accepted riders keep their seats.' : 'You are driving anyway. Say where and when, and how many seats are going spare.'}</p>
      {content}
    </div>
  </PageShell>
}
