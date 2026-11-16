import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from './Avatar.jsx'
import Button from './Button.jsx'
import SeatCounter from './SeatCounter.jsx'
import StatusPill from './StatusPill.jsx'
import { useRides } from '../state/context.js'
import { users } from '../data/rides.js'
import { acceptCheck } from '../data/seats.js'
import { ConfirmDialog } from './ConfirmDialog.jsx'
import { hasDeparted, isDriverReviewClosed } from '../lib/rideForm.js'

// Review from Driving, using the existing provider's request/queue transitions.
export default function DriverRequests({ ride, viewer, onClose }) {
  const { rides, dispatch } = useRides()
  const [confirming, setConfirming] = useState(null)
  const departed = hasDeparted(ride.departsAt)
  const heading = useRef(null)
  useEffect(() => { heading.current?.focus(); heading.current?.scrollIntoView({ block: 'start' }) }, [ride.id])
  if (ride.driverId !== viewer.id) return null
  const pending = ride.requests.filter((request) => request.status === 'pending')
  function review(requestId, type) {
    if (isDriverReviewClosed(ride)) return
    dispatch({ type, rideId: ride.id, requestId })
    setConfirming(null)
  }
  function confirm() {
    if (!confirming || isDriverReviewClosed(ride)) { setConfirming(null); return }
    if (confirming.type === 'cancelRide') {
      dispatch({ type: 'cancelRide', rideId: ride.id })
      onClose()
    } else review(confirming.request.id, 'decline')
  }
  return <section className="mt-8 rounded-card border border-line bg-surface p-5" aria-label="Driver request review">
    <div className="flex flex-wrap items-start gap-3">
      <div className="min-w-0 flex-1">
        <h2 ref={heading} tabIndex={-1} className="scroll-mt-24 font-display text-xl font-semibold text-brand-900 focus:outline-hidden">{departed ? 'Request review closed' : 'Requests waiting on you'}</h2>
        <p className="mt-1 text-sm text-muted">{ride.from} → {ride.to}</p>
      </div>
      <Button type="button" size="sm" variant="ghost" onClick={onClose}>Close review</Button>
    </div>
    <div className="mt-4"><SeatCounter ride={ride} viewer={viewer} /></div>
    {departed ? <p className="mt-4 text-sm text-muted">This ride has departed. Seat requests can no longer be accepted or declined.</p>
      : pending.length === 0 ? <p className="mt-4 text-sm text-muted">You are all caught up. No requests are waiting for review.</p>
        : <ul className="mt-4 space-y-2">{pending.map((request) => {
          const rider = users[request.riderId] ?? { name: 'Student', initials: 'ST' }
          const check = acceptCheck(rides, ride, request)
          return <li key={request.id} className="flex flex-wrap items-center gap-3 rounded-card border border-line p-4">
            <Avatar initials={rider.initials} />
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-brand-900">{rider.name}</p>
              {request.message && <p className="text-xs text-muted">“{request.message}”</p>}
              {!check.ok && <p className="mt-1 text-xs text-red-700">{check.reason}</p>}
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <StatusPill tone="queue">{request.seats} {request.seats === 1 ? 'seat' : 'seats'}</StatusPill><span className="flex-1 sm:flex-none" />
              <Button type="button" size="sm" disabled={!check.ok} aria-label={`Accept ${rider.name}'s request`} onClick={() => review(request.id, 'accept')}>Accept</Button>
              <Button type="button" size="sm" variant="ghost" aria-label={`Decline ${rider.name}'s request`} onClick={() => setConfirming({ type: 'decline', request, rider })}>Decline</Button>
            </div>
          </li>
        })}</ul>}
    {!isDriverReviewClosed(ride) && <div className="mt-5 flex flex-wrap gap-3 border-t border-line pt-4">
      <Link to={`/post?edit=${ride.id}`} className="rounded-card border border-line px-3 py-2 text-xs font-medium text-brand-900 hover:bg-brand-50">Edit ride</Link>
      <Button type="button" size="sm" variant="danger" onClick={() => setConfirming({ type: 'cancelRide' })}>Cancel ride</Button>
    </div>}
    <ConfirmDialog open={Boolean(confirming) && !isDriverReviewClosed(ride)}
      title={confirming?.type === 'cancelRide' ? 'Cancel this ride?' : 'Decline this request?'}
      confirmLabel={confirming?.type === 'cancelRide' ? 'Cancel ride' : 'Decline request'}
      cancelLabel={confirming?.type === 'cancelRide' ? 'Keep ride' : 'Keep request'}
      onCancel={() => setConfirming(null)} onConfirm={confirm}>
      {confirming?.type === 'cancelRide' ? 'This cancels the trip for everyone. Existing requests are kept in the shared ride record.' : `${confirming?.rider?.name ?? 'This rider'} will not get these seats on the trip.`}
    </ConfirmDialog>
  </section>
}
