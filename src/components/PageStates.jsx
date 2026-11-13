import { Link } from 'react-router-dom'
import Button from './Button.jsx'

// A grey block that pulses while data loads
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-card bg-brand-100 ${className}`} aria-hidden="true"></div>
}

// Shown when a page could not load. onRetry is optional.
export function ErrorState({ title, text, onRetry }) {
  return (
    <div role="alert" className="mt-8 rounded-card border border-red-100 bg-red-50 px-6 py-8 text-center">
      <h2 className="font-display text-xl font-semibold text-red-800">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-red-800/80">{text}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {onRetry && <Button variant="danger" onClick={onRetry}>Try again</Button>}
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-card border border-line bg-surface px-4 py-2.5 text-sm font-medium text-brand-900 hover:bg-brand-50"
        >
          Back to rides
        </Link>
      </div>
    </div>
  )
}

// Shown when there is nothing to list (not an error)
export function EmptyState({ title, text }) {
  return (
    <div className="rounded-card border border-dashed border-brand-200 bg-surface px-6 py-8 text-center">
      <p className="font-display text-base font-semibold text-brand-900">{title}</p>
      {text && <p className="mt-1 text-sm text-muted">{text}</p>}
    </div>
  )
}
