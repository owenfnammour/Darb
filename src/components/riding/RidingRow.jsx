import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../Button.jsx'
import StatusPill from '../StatusPill.jsx'
import { dayLabel, timeLabel } from '../../data/rides.js'

// One ride on the Riding tab: where it goes, when, and where the viewer stands.
// The question here is "where do I stand?", not "how full is the car?",
// so it shows a status pill instead of the seat counter.
export default function RidingRow({ ride, status, onLeave }) {
  const [confirming, setConfirming] = useState(false)
  const { action } = status

  function handleAction() {
    if (action.confirm) setConfirming(true)
    else onLeave()
  }

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-card border border-line bg-surface px-5 py-4">
      <span className="min-w-0 flex-1">
        <Link to={`/ride/${ride.id}`} className="block font-display text-base font-semibold text-brand-900 hover:underline hover:decoration-accent-400 hover:decoration-2 hover:underline-offset-4">
          {ride.from} <span className="text-accent-500">&rarr;</span> {ride.to}
        </Link>
        <span className="mt-0.5 block text-xs text-muted">
          {dayLabel(ride)} &middot; {timeLabel(ride)} &middot; driven by {ride.driver.name}
        </span>
      </span>

      {confirming ? (
        <span role="group" aria-label="Confirm giving up your seat" className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <span className="text-sm text-ink">Give up your seat? Someone waiting may get it.</span>
          {/* autoFocus on the safe choice, so Enter never gives the seat away by accident */}
          <Button size="sm" variant="secondary" autoFocus onClick={() => setConfirming(false)}>Keep it</Button>
          <Button size="sm" variant="danger" onClick={onLeave}>Give it up</Button>
        </span>
      ) : (
        <span className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <StatusPill tone={status.tone}>{status.label}</StatusPill>
          <span className="flex-1 sm:flex-none"></span>
          {action && <Button size="sm" variant={action.variant} onClick={handleAction}>{action.label}</Button>}
        </span>
      )}
    </li>
  )
}
