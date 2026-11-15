import { Link } from 'react-router-dom';

const buttonVariants = {
  primary: 'bg-brand-900 text-paper hover:bg-brand-800',
  secondary: 'border border-line bg-surface text-brand-900 hover:bg-brand-50',
  ghost: 'text-muted hover:bg-brand-50 hover:text-brand-900',
  danger: 'bg-red-700 text-white hover:bg-red-800',
};
export function Button({ to, variant = 'primary', small = false, className = '', children, ...props }) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-card font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-900 ${small ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm'} ${buttonVariants[variant]} ${className}`;
  return to ? <Link to={to} className={classes} {...props}>{children}</Link>
    : <button type="button" className={classes} {...props}>{children}</button>;
}

const badgeVariants = {
  available: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
  warning: 'bg-accent-50 text-accent-800 ring-accent-200',
  neutral: 'bg-brand-50 text-brand-700 ring-brand-100',
  danger: 'bg-red-50 text-red-800 ring-red-100',
};
export function Badge({ tone = 'neutral', children }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${badgeVariants[tone]}`}>{children}</span>;
}

export function PageHeading({ children }) {
  return <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">{children}</h1>;
}

export function ErrorPanel({ message, onRetry }) {
  return <div role="alert" className="mt-6 rounded-card border border-red-100 bg-red-50 px-6 py-8">
    <h2 className="font-display text-xl font-semibold text-red-900">We could not load the rides</h2>
    <p className="mt-2 text-sm text-red-800">{message}</p>
    {onRetry && <Button variant="secondary" className="mt-5" onClick={onRetry}>Try again</Button>}
  </div>;
}

export function LoadingRides() {
  return <div role="status" aria-label="Loading rides" className="mt-5 space-y-3">
    <span className="sr-only">Loading rides…</span>
    {[0, 1].map(item => <div key={item} aria-hidden="true" className="animate-pulse rounded-card border border-line bg-surface p-5">
      <div className="h-4 w-1/2 rounded bg-brand-100" /><div className="mt-3 h-3 w-1/3 rounded bg-brand-50" />
    </div>)}
  </div>;
}
