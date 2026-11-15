import { Link } from 'react-router-dom';
import { formatDeparture, formatPrice, seatSummary } from '../domain/rides.js';
import { SeatCounter } from './SeatCounter.jsx';
import { Badge, Button } from './ui.jsx';
import { useHasDeparted } from '../hooks/useHasDeparted.js';

export function DrivingRideRow({ ride, viewer }) {
  const { pendingCount } = seatSummary(ride);
  const hasDeparted = useHasDeparted(ride.departureAt);
  return <li className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-card border border-line bg-surface px-5 py-4">
    <div className="min-w-0 flex-1">
      <Link to={`/rides/${ride.id}`} className="font-display text-base font-semibold text-brand-900 hover:underline">
        {ride.origin} <span className="text-accent-500">→</span> {ride.destination}
      </Link>
      <p className="mt-0.5 text-xs text-muted">{formatDeparture(ride.departureAt)} · {formatPrice(ride.price)} a seat</p>
    </div>
    <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
      <SeatCounter ride={ride} viewer={viewer} />
      <span className="flex-1 sm:flex-none" />
      {hasDeparted ? <>
        <Badge>Departed</Badge>
        <Button to={`/rides/${ride.id}`} variant="secondary" small>View ride</Button>
      </> : pendingCount > 0
        ? <Button to={`/rides/${ride.id}#requests`} small>Review {pendingCount} {pendingCount === 1 ? 'request' : 'requests'}</Button>
        : <Button to={`/rides/${ride.id}/edit`} variant="secondary" small>Edit</Button>}
    </div>
  </li>;
}
