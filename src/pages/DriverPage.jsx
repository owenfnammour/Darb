import { Link, useParams } from 'react-router-dom'
import PageShell from '../components/PageShell.jsx'
import Breadcrumb from '../components/Breadcrumb.jsx'
import Button from '../components/Button.jsx'
import SeatCounter from '../components/SeatCounter.jsx'
import { EmptyState, ErrorState, Skeleton } from '../components/PageStates.jsx'
import usePageState from '../hooks/usePageState.js'
import { useRides, useViewer } from '../state/context.js'
import { NOW, shortDate, timeLabel, users } from '../data/rides.js'
import { seatCount } from '../data/seats.js'

// Only drivers have these numbers; a plain rider has no profile to show.
const stats = (d) => [
  ['Rides driven', d.ridesDriven],
  ['Seats shared', d.seatsShared],
  ['On time', `${d.onTime}%`],
  ['Member since', d.memberSince],
]

// A driver's public page. It never shows a phone number: that is revealed to a rider only once
// their request is accepted (and in Phase 2 the server decides that, not this page).
export default function DriverPage() {
  const { id } = useParams()
  const { rides } = useRides()
  const { viewer } = useViewer()
  const { status, retry } = usePageState()
  const driver = users[id]?.ridesDriven !== undefined ? users[id] : null

  if (status === 'loading') {
    return (
      <PageShell active="Find a ride">
        <Breadcrumb current="Driver" />
        <div aria-busy="true" aria-label="Loading profile">
          <Skeleton className="mt-3 h-56" />
          <Skeleton className="mt-8 h-8 w-64" />
          <Skeleton className="mt-4 h-20" />
          <Skeleton className="mt-3 h-20" />
        </div>
      </PageShell>
    )
  }

  if (status === 'error') {
    return (
      <PageShell active="Find a ride">
        <Breadcrumb current="Driver" />
        <ErrorState title="We could not load this profile" text="Something went wrong on our side. Check your connection and try again." onRetry={retry} />
      </PageShell>
    )
  }

  if (!driver) {
    return (
      <PageShell active="Find a ride">
        <Breadcrumb current="Driver" />
        <ErrorState title="No driver here" text="This person has not offered any rides, or the link is wrong." />
      </PageShell>
    )
  }

  const upcoming = rides
    .filter((r) => r.driverId === driver.id && !r.cancelled && new Date(r.departsAt) > NOW)
    .sort((a, b) => new Date(a.departsAt) - new Date(b.departsAt))
  const firstName = driver.name.split(' ')[0]
  const isMe = viewer && viewer.id === driver.id

  return (
    <PageShell active="Find a ride">
      <Breadcrumb current="Driver" />

      <section className="mt-3 overflow-hidden rounded-card border border-line bg-surface">
        <div className="h-28 bg-brand-900"></div>
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-wrap items-end gap-5">
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-full border-4 border-surface bg-brand-100 font-display text-2xl font-bold text-brand-800">
              {driver.initials}
            </span>
            <div className="min-w-[12rem] flex-1">
              <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">{driver.name}</h1>
              <p className="mt-1 text-sm text-muted">{driver.major} &middot; {driver.routine.replace('→', '→')}</p>
            </div>
            {!isMe && (
              <Button variant="secondary" size="sm" disabled title="Messaging arrives in a later phase">Message</Button>
            )}
          </div>

          <dl className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {stats(driver).map(([label, value]) => (
              <div key={label} className="rounded-card bg-brand-50 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
                <dd className="mt-1 font-display text-2xl font-bold tabular-nums text-brand-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold tracking-tight text-brand-900">Upcoming rides from {firstName}</h2>

        {upcoming.length === 0 ? (
          <div className="mt-4"><EmptyState title={`${firstName} has no rides coming up`} text="Check back soon, or look at what else is leaving." /></div>
        ) : (
          <ul className="mt-4 space-y-3">
            {upcoming.map((ride) => {
              const full = seatCount(ride, viewer).left === 0
              return (
                <li key={ride.id} className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-surface px-5 py-4">
                  <span className="min-w-0 flex-1">
                    <Link to={`/ride/${ride.id}`} className="block font-display text-base font-semibold text-brand-900 hover:underline">
                      {ride.from} <span className="text-accent-500">&rarr;</span> {ride.to}
                    </Link>
                    <span className="mt-0.5 block text-xs text-muted">
                      {shortDate(ride)} &middot; {timeLabel(ride)} &middot; <span className="font-mono tabular-nums">${ride.price}</span> a seat
                    </span>
                  </span>
                  <span className="flex w-full items-center gap-3 sm:w-auto">
                    <SeatCounter ride={ride} viewer={viewer} />
                    <span className="flex-1 sm:flex-none"></span>
                    <Link
                      to={`/ride/${ride.id}`}
                      className="inline-flex items-center justify-center rounded-card bg-brand-900 px-3 py-1.5 text-xs font-medium text-paper hover:bg-brand-800"
                    >
                      {isMe ? 'Manage' : full ? 'Join queue' : 'Request'}
                    </Link>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </PageShell>
  )
}
