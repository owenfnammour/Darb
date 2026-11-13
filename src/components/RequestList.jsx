import Avatar from './Avatar.jsx'
import Button from './Button.jsx'
import StatusPill from './StatusPill.jsx'
import { EmptyState } from './PageStates.jsx'
import { useRides } from '../state/context.js'
import { acceptCheck, seatCount } from '../data/seats.js'
import { users } from '../data/rides.js'

// Only the driver sees this: the people waiting on an answer. Accepting is checked against the house
// rule, so a request that would overfill the car (or double-book the rider) can't be accepted.
export default function RequestList({ ride }) {
  const { rides, dispatch } = useRides()
  const pending = ride.requests.filter((r) => r.status === 'pending')
  const { left } = seatCount(ride)
  const filler = pending.find((r) => r.seats === left && acceptCheck(rides, ride, r).ok)

  return (
    <section className="mt-6">
      <h2 className="font-display text-xl font-semibold tracking-tight text-brand-900">Requests waiting on you</h2>

      {pending.length === 0 ? (
        <div className="mt-3"><EmptyState title="No requests right now" text="When someone asks for a seat it will show up here." /></div>
      ) : (
        <ul className="mt-3 space-y-2">
          {pending.map((request) => {
            const rider = users[request.riderId]
            const check = acceptCheck(rides, ride, request)
            return (
              <li key={request.id} className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface px-4 py-3">
                <Avatar initials={rider.initials} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-brand-900">{rider.name}</span>
                  {request.message && <span className="block text-xs text-muted">&ldquo;{request.message}&rdquo;</span>}
                  {!check.ok && <span className="mt-0.5 block text-xs text-red-700">Can't accept: {check.reason}</span>}
                </span>
                <span className="flex w-full items-center gap-2 sm:w-auto">
                  <StatusPill tone="queue">{request.seats} seat{request.seats === 1 ? '' : 's'}</StatusPill>
                  <span className="flex-1 sm:flex-none"></span>
                  <Button
                    size="sm"
                    disabled={!check.ok}
                    onClick={() => dispatch({ type: 'accept', rideId: ride.id, requestId: request.id })}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch({ type: 'decline', rideId: ride.id, requestId: request.id })}
                  >
                    Decline
                  </Button>
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {filler && (
        <p className="mt-3 text-xs text-muted">
          Accepting {users[filler.riderId].name.split(' ')[0]}'s {filler.seats === 1 ? 'seat' : `${filler.seats} seats`} would fill the car and close the ride to new requests.
        </p>
      )}
    </section>
  )
}
