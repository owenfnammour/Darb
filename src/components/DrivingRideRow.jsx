import { Link } from 'react-router-dom'
import Button from './Button.jsx'
import SeatCounter from './SeatCounter.jsx'
import StatusPill from './StatusPill.jsx'
import { shortDate, timeLabel } from '../data/rides.js'
import { hasDeparted } from '../lib/rideForm.js'

export default function DrivingRideRow({ ride, viewer, onReview }) {
  const departed = hasDeparted(ride.departsAt)
  const pending = ride.requests.filter((request) => request.status === 'pending').length
  return <li className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-card border border-line bg-surface px-5 py-4">
    <div className="min-w-0 flex-1">
      <Link to={`/ride/${ride.id}`} className="font-display text-base font-semibold text-brand-900 hover:underline">{ride.from} <span className="text-accent-500">→</span> {ride.to}</Link>
      <p className="mt-0.5 text-xs text-muted">{shortDate(ride)} · {timeLabel(ride)} · ${ride.price} a seat</p>
    </div>
    <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
      <SeatCounter ride={ride} viewer={viewer} /><span className="flex-1 sm:flex-none" />
      {departed && <StatusPill tone="queue">Departed</StatusPill>}
      {departed ? <Button type="button" size="sm" variant="secondary" onClick={() => onReview(ride.id)}>View ride</Button>
        : pending > 0 ? <Button type="button" size="sm" onClick={() => onReview(ride.id)}>Review {pending} {pending === 1 ? 'request' : 'requests'}</Button>
          : <Link to={`/post?edit=${ride.id}`} className="rounded-card border border-line px-3 py-2 text-xs font-medium text-brand-900 hover:bg-brand-50">Edit</Link>}
    </div>
  </li>
}
