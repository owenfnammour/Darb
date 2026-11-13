import SeatCounter from './SeatCounter.jsx'
import RoadLine from './RoadLine.jsx'
import Button from './Button.jsx'
import { seatCount } from '../data/seats.js'


export default function RideCard({ ride, viewer }) {
  const full = seatCount(ride, viewer).left === 0

  return (
    <li className="relative rounded-card border border-line bg-surface p-5 transition hover:border-brand-300 hover:shadow-[0_2px_0_0_theme(colors.accent.300)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold leading-tight text-brand-900">
            <a href="#" className="after:absolute after:inset-0">
              {ride.from} <span className="text-accent-500">&rarr;</span> {ride.to}
            </a>
          </p>
          <p className="mt-1 text-sm text-muted">
            {ride.day} &middot; departs {ride.time} &middot; <span className="font-mono tabular-nums">${ride.price}</span> a seat
          </p>
        </div>
        <span className="inline-flex items-center gap-2 text-sm">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-display text-[11px] font-bold text-brand-800">
            {ride.driver.initials}
          </span>
          <span className="text-muted">{ride.driver.name}</span>
        </span>
      </div>

      <RoadLine className="my-4" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SeatCounter ride={ride} viewer={viewer} />
        {full ? null : <Button className="relative px-3 py-1.5 text-xs">Request a seat</Button>}
      </div>
    </li>
  )
}