import SeatCounter, { SeatRow } from './SeatCounter.jsx'
import Avatar from './Avatar.jsx'
import { queue } from '../data/seats.js'
import { users } from '../data/rides.js'

// "Who is in the car": the seats, where to meet, and, when the car is full, the line of people waiting
export default function CarPanel({ ride, viewer }) {
  const line = queue(ride)

  return (
    <section className="mt-6 overflow-hidden rounded-card border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-4">
        <h2 className="font-display text-xl font-semibold tracking-tight text-brand-900">Who is in the car</h2>
        <span className="flex-1"></span>
        <SeatCounter ride={ride} viewer={viewer} />
      </div>

      <div className="px-5 py-5">
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Seats</p>
            <div className="mt-2"><SeatRow ride={ride} viewer={viewer} /></div>
          </div>
          <div className="min-w-[12rem] flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Pickup</p>
            <p className="mt-1.5 text-sm text-ink">{ride.pickup}</p>
            {ride.notes && <p className="mt-1 text-xs text-muted">{ride.notes}</p>}
          </div>
        </div>
      </div>

      {line.length > 0 && (
        <div className="border-t border-line px-5 py-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Waiting for a seat</h3>
          <ol className="mt-3 space-y-2">
            {line.map((request, i) => {
              const rider = users[request.riderId]
              const you = viewer && viewer.id === request.riderId
              return (
                <li
                  key={request.id}
                  className={`flex items-center gap-3 rounded-card border px-3.5 py-2.5 ${you ? 'border-accent-300 bg-accent-50' : 'border-line bg-surface'}`}
                >
                  <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-100 font-mono text-[11px] font-bold tabular-nums text-brand-800">
                    {i + 1}
                  </span>
                  <Avatar initials={rider.initials} size="sm" />
                  <span className="min-w-0 truncate text-sm text-ink">{rider.name}</span>
                  {you && <span className="ml-auto text-xs font-semibold text-accent-700">you</span>}
                </li>
              )
            })}
          </ol>
          <p className="mt-3 text-xs text-muted">If an accepted rider drops out, the first person here is offered the seat.</p>
        </div>
      )}
    </section>
  )
}
