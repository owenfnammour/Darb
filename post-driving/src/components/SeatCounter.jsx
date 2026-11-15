import { seatSummary } from '../domain/rides.js';
import { Badge } from './ui.jsx';

const seatColors = { taken: 'text-brand-700', free: 'text-brand-200', pending: 'text-accent-400', yours: 'text-brand-700 ring-2 ring-accent-500 ring-offset-2 rounded-sm' };

export function SeatIcon({ state = 'free' }) {
  return <span className={`block h-5 w-5 ${seatColors[state]}`} title={state}>
    <svg viewBox="0 0 16 16" className="h-full w-full" fill="none" aria-hidden="true">
      <path d="M4 3.2a1.2 1.2 0 0 1 1.2-1.2h5.6A1.2 1.2 0 0 1 12 3.2V9H4V3.2Z" fill="currentColor" />
      <path d="M2.6 9.6A1.6 1.6 0 0 1 4.2 8h7.6a1.6 1.6 0 0 1 1.6 1.6V13H2.6V9.6Z" fill="currentColor" opacity=".55" />
    </svg>
  </span>;
}

/** All five reference states come from ride + viewer, never a stored remaining count. */
export function SeatCounter({ ride, viewer }) {
  const { taken, remaining, pendingCount, pendingSeats } = seatSummary(ride);
  const isOwner = viewer?.id === ride.driverId;
  const ownSeats = ride.requests.filter(request => request.status === 'accepted' && request.riderId === viewer?.id)
    .reduce((sum, request) => sum + request.seats, 0);
  const wording = remaining === 0 ? 'Full' : `${remaining} ${remaining === 1 ? 'seat' : 'seats'} left`;
  const glyphs = [];
  ride.requests.filter(request => request.status === 'accepted').forEach(request => {
    for (let i = 0; i < request.seats; i++) glyphs.push(viewer?.id === request.riderId && i === 0 ? 'yours' : 'taken');
  });
  for (let i = 0; i < remaining; i++) glyphs.push(isOwner && i < pendingSeats ? 'pending' : 'free');
  return <div className="flex flex-wrap items-center gap-x-3 gap-y-2" role="group"
    aria-label={`${taken} of ${ride.offeredSeats} seats accepted. ${wording}.${isOwner && pendingCount ? ` ${pendingCount} requests pending.` : ''}${ownSeats ? ' You are in this car.' : ''}`}>
    <div className="flex flex-wrap gap-1" aria-hidden="true">{glyphs.map((state, index) => <SeatIcon key={index} state={state} />)}</div>
    <span className="font-mono text-xs tabular-nums text-muted">{taken}/{ride.offeredSeats}</span>
    <Badge tone={remaining === 0 ? 'neutral' : remaining === 1 ? 'warning' : 'available'}>{wording}</Badge>
    {isOwner && pendingCount > 0 && <span className="text-xs text-accent-700">{pendingCount} pending</span>}
    {ownSeats > 0 && <span className="sr-only">Your seat is ringed.</span>}
  </div>;
}
