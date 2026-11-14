import PageShell from '../PageShell.jsx'
import RoadLine from '../RoadLine.jsx'

// The design says Register is the "same frame" as Sign in,
// so both pages render inside this, with the normal header and footer around it.
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <PageShell>
      <div className="mx-auto grid max-w-5xl items-start gap-10 lg:grid-cols-[1fr_auto]">
        <div className="max-w-md lg:pt-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent-600">Seats going your way</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-brand-900">
            Two campuses, one road.
          </h1>
          <p className="mt-4 text-sm text-muted">
            Everyone here is an LAU student. Your university email is all you need.
          </p>
          <RoadLine className="mt-8" />
        </div>

        <div className="w-full max-w-md">
          <div className="overflow-hidden rounded-card border border-line bg-surface">
            <div className="border-b border-line px-7 py-5">
              <h2 className="font-display text-2xl font-bold tracking-tight text-brand-900">{title}</h2>
              <p className="mt-1 text-sm text-muted">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
