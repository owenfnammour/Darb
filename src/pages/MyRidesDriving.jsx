import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageShell from '../components/PageShell.jsx'
import MyRidesTabs from '../components/MyRidesTabs.jsx'
import { EmptyState, ErrorState, Skeleton } from '../components/PageStates.jsx'
import usePageState from '../hooks/usePageState.js'
import { useRides, useViewer } from '../state/context.js'
import { drivingCount, ridingList } from '../lib/riding.js'
import { NOW } from '../data/rides.js'
import DrivingRideRow from '../features/driving/DrivingRideRow.jsx'
import DriverRequests from '../features/driving/DriverRequests.jsx'

export default function MyRidesDriving() {
  const { rides } = useRides()
  const { viewer } = useViewer()
  const { status, retry } = usePageState()
  const [params] = useSearchParams()
  const [reviewId, setReviewId] = useState(null)
  const owned = params.get('state') === 'empty' ? [] : rides.filter((ride) => ride.driverId === viewer?.id && !ride.cancelled && new Date(ride.departsAt) >= NOW)
    .sort((a, b) => Date.parse(a.departsAt) - Date.parse(b.departsAt))
  const selected = owned.find((ride) => ride.id === reviewId)
  const counts = status === 'ready' && viewer ? { driving: params.get('state') === 'empty' ? 0 : drivingCount(rides, viewer.id), riding: ridingList(rides, viewer.id).length } : {}
  return <PageShell active="My rides"><title>My rides: driving — Darb</title>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">My rides</h1>
      {viewer && <Link to="/post" className="rounded-card border border-line px-3 py-2 text-xs font-medium text-brand-900 hover:bg-brand-50">Post a ride</Link>}
    </div>
    {!viewer ? <div className="mt-8 rounded-card border border-dashed border-brand-200 bg-surface px-6 py-8 text-center">
      <h2 className="font-display text-xl font-semibold text-brand-900">Sign in to see your rides</h2>
      <Link to="/sign-in" state={{ from: '/my-rides/driving' }} className="mt-4 inline-block font-semibold text-brand-800 underline">Sign in</Link>
    </div> : <>
      <MyRidesTabs active="driving" counts={counts} />
      {status === 'loading' && <div role="status" aria-label="Loading rides" className="mt-5 space-y-3"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>}
      {status === 'error' && <ErrorState title="We could not load your rides" text="Please try again." onRetry={retry} />}
      {status === 'ready' && (owned.length > 0 ? <ul aria-label="Rides you are driving" className="mt-5 space-y-3">{owned.map((ride) => <DrivingRideRow key={ride.id} ride={ride} viewer={viewer} onReview={setReviewId} />)}</ul>
        : <div className="mt-5"><EmptyState title="You have not posted a ride yet" text="If you drive to campus with empty seats, this is where your trips will live." /><div className="mt-5 text-center"><Link to="/post" className="inline-block rounded-card bg-brand-900 px-4 py-2.5 text-sm font-medium text-paper">Post a ride</Link></div></div>)}
      {status === 'ready' && selected && <DriverRequests key={selected.id} ride={selected} viewer={viewer} onClose={() => setReviewId(null)} />}
    </>}
  </PageShell>
}
