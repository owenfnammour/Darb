import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from './Button.jsx'
import RequestForm from './RequestForm.jsx'
import { useRides } from '../state/context.js'
import { activeRequest, conflictingRide, declinedRequest, queue, seatCount } from '../data/seats.js'
import { timeLabel } from '../data/rides.js'

const bar = 'mt-6 flex flex-wrap items-center gap-3 rounded-card border border-line bg-brand-50 px-5 py-4'

function ordinal(n) {
  return ['first', 'second', 'third', 'fourth', 'fifth'][n - 1] ?? `number ${n}`
}

// The strip under the title. What it says depends on who is looking and where they stand on the ride,
// worked out from the ride itself (never from a flag set once).
export default function RideActions({ ride, viewer }) {
  const { rides, dispatch } = useRides()
  const [asking, setAsking] = useState(false)
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  const firstName = ride.driver.name.split(' ')[0]
  const { left, pending } = seatCount(ride)
  const isOwner = viewer && viewer.id === ride.driverId

  if (ride.cancelled) {
    return (
      <div className={bar} role="status">
        <span className="text-sm text-ink">
          {isOwner ? 'You cancelled this ride.' : 'This ride was cancelled.'}{' '}
          <span className="text-muted">Nobody can request a seat any more.</span>
        </span>
      </div>
    )
  }

  // 1. The driver
  if (isOwner) {
    return (
      <div className={bar}>
        <span className="text-sm text-ink">
          This is your ride.{' '}
          <span className="text-muted">
            {pending > 0
              ? `${ride.requests.filter((r) => r.status === 'pending').length} waiting on your answer.`
              : 'Nobody is waiting on you.'}
          </span>
        </span>
        <span className="flex-1"></span>
        {confirmingCancel ? (
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">Cancel this ride for everyone?</span>
            <Button variant="danger" size="sm" onClick={() => dispatch({ type: 'cancelRide', rideId: ride.id })}>
              Yes, cancel it
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setConfirmingCancel(false)}>Keep it</Button>
          </span>
        ) : (
          <>
            <Link
              to={`/post?edit=${ride.id}`}
              className="inline-flex items-center justify-center rounded-card border border-line bg-surface px-3 py-1.5 text-xs font-medium text-brand-900 hover:bg-brand-50"
            >
              Edit ride
            </Link>
            <Button variant="danger" size="sm" onClick={() => setConfirmingCancel(true)}>Cancel ride</Button>
          </>
        )}
      </div>
    )
  }

  // 2. Signed out: same place, but the action is "sign in"
  if (!viewer) {
    return (
      <div className={bar}>
        <span className="text-sm text-ink">
          {left === 0 ? `This ride is full. Sign in to join the queue for ${firstName}'s car.` : `Sign in to ask ${firstName} for a seat.`}
        </span>
        <span className="flex-1"></span>
        <Link
          to="/sign-in"
          className="inline-flex items-center justify-center rounded-card border border-line bg-surface px-3 py-1.5 text-xs font-medium text-brand-900 hover:bg-brand-50"
        >
          Sign in
        </Link>
      </div>
    )
  }

  // 3. Another signed-in rider
  const mine = activeRequest(ride, viewer.id)
  const declined = declinedRequest(ride, viewer.id)
  const clash = !mine ? conflictingRide(rides, ride, viewer.id) : null
  const withdraw = () => dispatch({ type: 'withdraw', rideId: ride.id, riderId: viewer.id })

  let text
  let action = null

  if (mine?.status === 'accepted') {
    text = <>You are in the car. <span className="text-muted">{mine.seats} seat{mine.seats === 1 ? '' : 's'} booked.</span></>
    action = <Button variant="secondary" size="sm" onClick={withdraw}>Leave this ride</Button>
  } else if (mine?.status === 'pending') {
    text = <>Request sent. <span className="text-muted">{firstName} has your ask for {mine.seats} seat{mine.seats === 1 ? '' : 's'}.</span></>
    action = <Button variant="secondary" size="sm" onClick={withdraw}>Cancel request</Button>
  } else if (mine?.status === 'waitlisted') {
    const place = queue(ride).indexOf(mine) + 1
    text = <>This ride is full. <span className="text-muted">You are {ordinal(place)} in line if a seat frees up.</span></>
    action = <Button variant="secondary" size="sm" onClick={withdraw}>Leave the queue</Button>
  } else if (clash) {
    text = (
      <>
        {left === 0 ? 'This ride is full.' : `${left} seat${left === 1 ? '' : 's'} left on this trip.`}{' '}
        <span className="text-muted">
          You already have a seat on a ride leaving at {timeLabel(clash)}, and rides within three hours of each other can't both be yours.
        </span>
      </>
    )
  } else if (left === 0) {
    text = <>This ride is full. <span className="text-muted">You can join the queue; if a seat frees up the first in line is offered it.</span></>
    action = <Button size="sm" onClick={() => setAsking(true)}>Join the queue</Button>
  } else {
    text = <>{declined ? `${firstName} declined your last request. ` : ''}{left} seat{left === 1 ? '' : 's'} left on this trip.</>
    action = <Button size="sm" onClick={() => setAsking(true)}>Request a seat</Button>
  }

  return (
    <>
      <div className={bar} role="status">
        <span className="text-sm text-ink">{text}</span>
        <span className="flex-1"></span>
        {asking && !mine ? null : action}
      </div>
      {asking && !mine && !clash && (
        <RequestForm
          ride={ride}
          full={left === 0}
          onCancel={() => setAsking(false)}
          onSubmit={({ seats, message }) => {
            dispatch({ type: 'request', rideId: ride.id, riderId: viewer.id, seats, message })
            setAsking(false)
          }}
        />
      )}
    </>
  )
}
