import { Link } from 'react-router-dom'

const tabs = [
  { key: 'driving', label: 'Driving', to: '/my-rides/driving' },
  { key: 'riding', label: 'Riding', to: '/my-rides/riding' },
]

const activeClass = 'border-b-2 border-accent-500 pb-3 font-display text-sm font-semibold text-brand-900'
const idleClass = 'border-b-2 border-transparent pb-3 font-display text-sm text-muted hover:text-brand-900'

// The Driving / Riding tabs at the top of My rides. Shared by both tabs.
// counts: { driving, riding }, leave one out to hide its badge (e.g. while loading)
export default function MyRidesTabs({ active, counts = {} }) {
  return (
    <div className="mt-6 border-b border-line">
      <nav className="flex gap-8" aria-label="My rides">
        {tabs.map((tab) => {
          const current = tab.key === active
          return (
            <Link key={tab.key} to={tab.to} className={current ? activeClass : idleClass} aria-current={current ? 'page' : undefined}>
              {tab.label}{' '}
              {counts[tab.key] != null && (
                <span className="ml-1.5 rounded-full bg-brand-100 px-2 py-0.5 font-mono text-[11px] tabular-nums text-brand-700">
                  {counts[tab.key]}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
