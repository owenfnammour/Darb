import { useState } from 'react'
import Button from './Button.jsx'
import { seatCount } from '../data/seats.js'

const MAX_MESSAGE = 140

// Asking for seats (or for a place in the queue when the ride is full). Validates before sending.
export default function RequestForm({ ride, full, onSubmit, onCancel }) {
  const { left } = seatCount(ride)
  const maxSeats = full ? ride.seatsOffered : left
  const [seats, setSeats] = useState('1')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})

  function submit(e) {
    e.preventDefault()
    const found = {}
    const n = Number(seats)
    if (!Number.isInteger(n) || n < 1 || n > maxSeats) {
      found.seats = `Choose between 1 and ${maxSeats} seat${maxSeats === 1 ? '' : 's'}.`
    }
    if (message.length > MAX_MESSAGE) {
      found.message = `Keep the note under ${MAX_MESSAGE} characters.`
    }
    setErrors(found)
    if (Object.keys(found).length === 0) onSubmit({ seats: n, message: message.trim() })
  }

  const field = (bad) =>
    `mt-1.5 w-full rounded-card border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-500 ${bad ? 'border-red-600' : 'border-line'}`

  return (
    <form onSubmit={submit} noValidate className="mt-3 rounded-card border border-line bg-surface px-5 py-5">
      <h2 className="font-display text-lg font-semibold text-brand-900">
        {full ? 'Join the queue' : 'Ask for a seat'}
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-[8rem_1fr]">
        <div>
          <label htmlFor="req-seats" className="text-xs font-semibold uppercase tracking-wide text-muted">Seats</label>
          <input
            id="req-seats"
            type="number"
            min="1"
            max={maxSeats}
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            aria-invalid={Boolean(errors.seats)}
            aria-describedby={errors.seats ? 'req-seats-error' : undefined}
            className={field(errors.seats)}
          />
          {errors.seats && <p id="req-seats-error" className="mt-1 text-xs text-red-700">{errors.seats}</p>}
        </div>
        <div>
          <label htmlFor="req-note" className="text-xs font-semibold uppercase tracking-wide text-muted">
            Note for the driver <span className="font-normal normal-case">(optional)</span>
          </label>
          <textarea
            id="req-note"
            rows="2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            aria-invalid={Boolean(errors.message)}
            className={field(errors.message)}
          />
          <p className={`mt-1 text-xs ${message.length > MAX_MESSAGE ? 'text-red-700' : 'text-muted'}`}>
            {message.length}/{MAX_MESSAGE}
          </p>
          {errors.message && <p className="text-xs text-red-700">{errors.message}</p>}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button type="submit" size="sm">{full ? 'Join the queue' : 'Send request'}</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Not now</Button>
      </div>
    </form>
  )
}
