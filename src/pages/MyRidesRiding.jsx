import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/PageShell.jsx'
import MyRidesTabs from '../components/MyRidesTabs.jsx'
import RidingRow from '../components/riding/RidingRow.jsx'
import { EmptyState, ErrorState, Skeleton } from '../components/PageStates.jsx'
import usePageState from '../hooks/usePageState.js'
import { useRides, useViewer } from '../state/context.js'
import { drivingCount, ridingList } from '../lib/riding.js'

const linkClass = 'font-semibold text-brand-800 underline decoration-accent-400 decoration-2 underline-offset-4'

export default function MyRidesRiding() {
  const { rides, dispatch } = useRides()
  const { viewer } = useViewer()
  const { status, retry } = usePageState()
  // Remembers who the message is for, so switching user does not show someone else's
  const [notice, setNotice] = useState({ viewerId: null, text: '' })

  const title = <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">My rides</h1>

  // Signed out: there is no "my" yet, so point at the way in
  if (!viewer) {
    return (
      <PageShell active="My rides">
        {title}
        <div className="mt-8 rounded-card border border-dashed border-brand-200 bg-surface px-6 py-8 text-center">
          <p className="font-display text-base font-semibold text-brand-900">Sign in to see your rides</p>
          <p className="mt-1 text-sm text-muted">The seats you asked for show up here once you are signed in.</p>
          <Link to="/sign-in" state={{ from: '/my-rides/riding' }} className={`mt-4 inline-block text-sm ${linkClass}`}>Sign in</Link>
        </div>
      </PageShell>
    )
  }

  const rows = ridingList(rides, viewer.id)
  const ready = status === 'ready'
  const counts = ready ? { driving: drivingCount(rides, viewer.id), riding: rows.length } : {}

  function leave(ride) {
    dispatch({ type: 'withdraw', rideId: ride.id, riderId: viewer.id })
    setNotice({ viewerId: viewer.id, text: `You are no longer on ${ride.from} → ${ride.to}.` })
  }

  return (
    <PageShell active="My rides">
      {title}
      <MyRidesTabs active="riding" counts={counts} />

      {/* Read out by screen readers after leaving a ride, since the row disappears */}
      <p role="status" className="mt-4 text-sm text-muted empty:hidden">{notice.viewerId === viewer.id ? notice.text : ''}</p>

      {status === 'loading' && (
        // Same height as a real row, so nothing jumps when the data lands
        <ul className="mt-5 space-y-3" aria-busy="true" aria-label="Loading your rides">
          {[0, 1, 2].map((i) => (
            <li key={i}><Skeleton className="h-[74px]" /></li>
          ))}
        </ul>
      )}

      {status === 'error' && (
        <ErrorState title="We could not load your rides" text="Something went wrong on our side. Check your connection and try again." onRetry={retry} />
      )}

      {ready && rows.length === 0 && (
        <div className="mt-5">
          <EmptyState title="You have not asked for any seats yet" text="When you request a seat on someone's ride, it shows up here." />
          <p className="mt-4 text-center text-sm">
            <Link to="/" className={linkClass}>Find a ride</Link>
          </p>
        </div>
      )}

      {ready && rows.length > 0 && (
        <ul className="mt-5 space-y-3">
          {rows.map(({ ride, status: rowStatus }) => (
            <RidingRow key={ride.id} ride={ride} status={rowStatus} onLeave={() => leave(ride)} />
          ))}
        </ul>
      )}
    </PageShell>
  )
}
