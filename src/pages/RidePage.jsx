import { Link, useParams } from 'react-router-dom'
import PageShell from '../components/PageShell.jsx'
import Breadcrumb from '../components/Breadcrumb.jsx'
import Avatar from '../components/Avatar.jsx'
import RideActions from '../components/RideActions.jsx'
import CarPanel from '../components/CarPanel.jsx'
import RequestList from '../components/RequestList.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { ErrorState, Skeleton } from '../components/PageStates.jsx'
import usePageState from '../hooks/usePageState.js'
import { useRides, useViewer } from '../state/context.js'
import { longDate, timeLabel } from '../data/rides.js'

export default function RidePage() {
  const { id } = useParams()
  const { rides } = useRides()
  const { viewer } = useViewer()
  const { status, retry } = usePageState()
  const ride = rides.find((r) => String(r.id) === id)

  if (status === 'loading') {
    return (
      <PageShell active="Find a ride">
        <Breadcrumb current="Ride" />
        <div aria-busy="true" aria-label="Loading ride">
          <Skeleton className="mt-4 h-10 w-80 max-w-full" />
          <Skeleton className="mt-6 h-16" />
          <Skeleton className="mt-6 h-48" />
        </div>
      </PageShell>
    )
  }

  if (status === 'error') {
    return (
      <PageShell active="Find a ride">
        <Breadcrumb current="Ride" />
        <ErrorState title="We could not load this ride" text="Something went wrong on our side. Check your connection and try again." onRetry={retry} />
      </PageShell>
    )
  }

  if (!ride) {
    return (
      <PageShell active="Find a ride">
        <Breadcrumb current="Ride" />
        <ErrorState title="This ride does not exist" text="It may have been removed, or the link is wrong." />
      </PageShell>
    )
  }

  const isOwner = viewer && viewer.id === ride.driverId

  return (
    <PageShell active="Find a ride">
      <Breadcrumb current="Ride" />

      <div className="mt-3 flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
            {ride.from} <span className="text-accent-500">&rarr;</span> {ride.to}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {longDate(ride)} &middot; departs {timeLabel(ride)} &middot; <span className="font-mono tabular-nums">${ride.price}</span> a seat
            {ride.cancelled && <span className="ml-2 align-middle"><StatusPill tone="red">Cancelled</StatusPill></span>}
          </p>
        </div>
        <Link
          to={`/driver/${ride.driver.id}`}
          className="flex items-center gap-3 rounded-card border border-line bg-surface px-4 py-2.5 hover:border-brand-300"
        >
          <Avatar initials={ride.driver.initials} size="lg" />
          <span className="text-left">
            <span className="block text-sm font-semibold text-brand-900">{ride.driver.name}</span>
            <span className="block text-xs text-muted">{ride.driver.ridesDriven} rides driven &middot; view profile</span>
          </span>
        </Link>
      </div>

      <RideActions key={`${ride.id}-${viewer?.id ?? 'out'}`} ride={ride} viewer={viewer} />
      <CarPanel ride={ride} viewer={viewer} />
      {isOwner && !ride.cancelled && <RequestList ride={ride} />}
    </PageShell>
  )
}
