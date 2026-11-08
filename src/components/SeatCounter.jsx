import SeatGlyph from './SeatGlyph.jsx'
import StatusPill from './StatusPill.jsx'
import { seatCount } from '../data/seats.js'

// ride: {seatsOffered, requests: [{riderId, seats, status}]}
export default function SeatCounter({ ride, viewer }) {
  const { taken, mine, pending, left } = seatCount(ride, viewer);
  const amber = Math.min(pending, left);
  const glyphs = [];
  
  for (let i = 0; i < taken - mine; i++) {
    glyphs.push('taken');
  }
  for (let i = 0; i < mine; i++) {
    glyphs.push('yours');
  }
  for (let i = 0; i < amber; i++) {
    glyphs.push('pending');
  }
  for (let i = 0; i < left - amber; i++) {
    glyphs.push('free');
  }

  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="flex flex-wrap gap-1">
        {glyphs.map((state, i) => <SeatGlyph key={i} state={state} />)}
      </span>

      <span className="font-mono text-xs tabular-nums text-muted">{taken}/{ride.seatsOffered}</span>

      {left === 0
        ? <StatusPill tone="full">Full</StatusPill>
        : <StatusPill tone={left === 1 ? 'amber' : 'green'}>{left} seat{left === 1 ? '' : 's'} left</StatusPill>
      }

      {pending > 0
        ? <span className="text-xs text-accent-700">{pending} pending</span>
        : null
      }
    </span>
  )
}
