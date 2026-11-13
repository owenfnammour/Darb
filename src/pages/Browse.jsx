import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageShell from '../components/PageShell.jsx'
import Breadcrumb from '../components/Breadcrumb.jsx'
import Button from '../components/Button.jsx'
import RideCard from '../components/RideCard.jsx'
import RideCardSkeleton from '../components/RideCardSkeleton.jsx'
import usePageState from '../hooks/usePageState.js'
import { useRides, useViewer } from '../state/context.js'
import { seatCount } from '../data/seats.js'

const RIDES_PER_PAGE = 4

const fieldClass =
  'w-full rounded-card border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100'
const labelClass = 'text-xs font-semibold uppercase tracking-wide text-muted'

// The day a ride leaves, as 'YYYY-MM-DD' (the same format an <input type="date"> uses)
function dayOf(ride) {
  return ride.departsAt.slice(0, 10)
}

// '2026-11-02' -> 'Monday 2 November'
function dayName(day) {
  return new Date(day + 'T00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function routeOf(ride) {
  return ride.from + ' → ' + ride.to
}

export default function Browse() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { rides } = useRides()
  const { viewer } = useViewer()
  // 'loading', 'error' or 'ready'. Add ?state=loading or ?state=error to the address to see them.
  const { status, retry } = usePageState()

  // The filters start from what was searched on the home page, if anything.
  // The arrow stays in, so "Jbeil →" only finds rides leaving Jbeil, not rides going there.
  const from = params.get('from') ?? ''
  const to = params.get('to') ?? ''
  const noFilters = { route: '', day: '', seats: 'Any', price: 'Any' }
  const [filters, setFilters] = useState({
    ...noFilters,
    route: from || to ? `${from} → ${to}`.trim() : '',
    day: params.get('day') ?? '',
  })
  const [page, setPage] = useState(1)

  // One handler for every field: the field's name says which filter it changes
  function change(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value })
    setPage(1)
  }

  function clearAll() {
    setFilters(noFilters)
    setPage(1)
  }

  // One test per filter, so we can also tell which one finds nothing
  const tests = {
    route: (ride) => routeOf(ride).toLowerCase().includes(filters.route.trim().toLowerCase()),
    day: (ride) => filters.day === '' || dayOf(ride) === filters.day,
    seats: (ride) => filters.seats === 'Any' || seatCount(ride, viewer).left >= Number(filters.seats),
    price: (ride) => filters.price === 'Any' || ride.price <= Number(filters.price),
  }

  const allRides = rides
    .filter((ride) => !ride.cancelled)
    .sort((a, b) => new Date(a.departsAt) - new Date(b.departsAt))
  const results = allRides.filter((ride) => Object.values(tests).every((test) => test(ride)))
  const routes = [...new Set(allRides.map(routeOf))]

  // Pagination
  const pages = Math.max(1, Math.ceil(results.length / RIDES_PER_PAGE))
  const pageRides = results.slice((page - 1) * RIDES_PER_PAGE, page * RIDES_PER_PAGE)

  // Group this page's rides by day (they are already in time order)
  const days = []
  for (const ride of pageRides) {
    const last = days[days.length - 1]
    if (last && last.day === dayOf(ride)) last.rides.push(ride)
    else days.push({ day: dayOf(ride), rides: [ride] })
  }

  // Empty state: find the filter that matches nothing even on its own, and offer to undo just that one
  const tooNarrow = allRides.length > 0 && Object.keys(tests).find((name) => !allRides.some(tests[name]))
  const emptyMessages = {
    route: { title: 'Nobody is driving ' + filters.route, text: 'Check the spelling, or post the ride yourself and let people come to you.', fix: 'See all routes' },
    day: { title: 'Nobody is driving on ' + (filters.day && dayName(filters.day)), text: 'There are rides on other days. Try another day, or post the ride yourself.', fix: 'See all days' },
    seats: { title: 'No ride has ' + filters.seats + ' seats free', text: 'Try asking for fewer seats, or post the ride yourself.', fix: 'Any number of seats' },
    price: { title: 'No ride costs $' + filters.price + ' or less', text: 'Try a higher max price, or post the ride yourself.', fix: 'Any price' },
  }
  let empty = { title: 'No ride matches all of these together', text: 'Each filter finds rides on its own, just not all at once.', fix: 'Clear all' }
  if (allRides.length === 0) {
    empty = { title: 'Nobody has posted a ride yet', text: 'Be the first, and let people come to you.', fix: 'Clear all' }
  } else if (tooNarrow) {
    empty = emptyMessages[tooNarrow]
  }

  function fixSearch() {
    if (tooNarrow) {
      setFilters({ ...filters, [tooNarrow]: noFilters[tooNarrow] })
      setPage(1)
    } else {
      clearAll()
    }
  }

  return (
    <PageShell active="Find a ride">
      <Breadcrumb current="Find a ride" />
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-brand-900">
        {filters.route.trim() === '' ? 'All rides' : filters.route}
      </h1>
      <p className="mt-1.5 text-sm text-muted">
        {filters.day === '' ? 'Every day.' : dayName(filters.day) + '.'} Prices are per seat, set by the driver.
      </p>

      <div className="mt-6 space-y-5">
        {/* Filters: a normal form, so each label is tied to its field with htmlFor/id */}
        <form className="flex flex-wrap items-end gap-3 rounded-card border border-line bg-surface p-4" onSubmit={(e) => e.preventDefault()}>
          <div className="flex min-w-[9rem] flex-1 flex-col gap-1.5">
            <label htmlFor="f-route" className={labelClass}>Route</label>
            {/* <datalist> suggests the routes that exist while typing */}
            <input id="f-route" name="route" list="f-routes" className={fieldClass} placeholder="Jbeil → Byblos campus" value={filters.route} onChange={change} />
            <datalist id="f-routes">
              {routes.map((route) => <option key={route} value={route} />)}
            </datalist>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-day" className={labelClass}>Day</label>
            <input id="f-day" name="day" type="date" className={fieldClass + ' w-44'} value={filters.day} onChange={change} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-seats" className={labelClass}>Seats needed</label>
            <select id="f-seats" name="seats" className={fieldClass + ' w-32'} value={filters.seats} onChange={change}>
              <option>Any</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-price" className={labelClass}>Max price</label>
            <select id="f-price" name="price" className={fieldClass + ' w-32'} value={filters.price} onChange={change}>
              <option value="Any">Any</option>
              <option value="5">$5</option>
              <option value="10">$10</option>
            </select>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={clearAll}>Clear all</Button>
          <span className="flex-1"></span>
          {/* aria-live: screen readers announce the new count when the filters change */}
          <span className="font-mono text-xs text-muted" aria-live="polite">
            {status === 'ready' && results.length + (results.length === 1 ? ' ride' : ' rides')}
          </span>
        </form>

        {/* State: loading. Skeletons keep the card's shape so nothing jumps when the data lands. */}
        {status === 'loading' && (
          <ul className="grid gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Loading rides">
            <RideCardSkeleton />
            <RideCardSkeleton />
          </ul>
        )}

        {/* State: error. Plain language, no status code, and always a retry. */}
        {status === 'error' && (
          <div role="alert" className="rounded-card border border-red-200 bg-red-50 px-6 py-12 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 font-display text-xl font-bold text-red-800" aria-hidden="true">!</span>
            <h2 className="mt-4 font-display text-xl font-semibold text-red-900">We could not load the rides</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-red-800/80">The server did not answer. This is usually over in a moment.</p>
            <div className="mt-6">
              <Button size="sm" onClick={retry}>Try again</Button>
            </div>
          </div>
        )}

        {/* State: empty. Says which filter is too narrow and offers the two real ways out. */}
        {status === 'ready' && results.length === 0 && (
          <div className="rounded-card border border-dashed border-brand-200 bg-surface px-6 py-12 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-50 text-accent-600" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 12h18M12 3v18" />
              </svg>
            </span>
            <h2 className="mt-4 font-display text-xl font-semibold text-brand-900">{empty.title}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{empty.text}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="sm" onClick={fixSearch}>{empty.fix}</Button>
              <Button variant="secondary" size="sm" onClick={() => navigate('/post')}>Post this ride</Button>
            </div>
          </div>
        )}

        {/* State: populated. Rides grouped under the day they leave. */}
        {status === 'ready' &&
          days.map((group) => (
            <section key={group.day}>
              <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                <time dateTime={group.day}>{dayName(group.day)}</time>
              </h2>
              <ul className="mt-3 grid gap-4 lg:grid-cols-2">
                {group.rides.map((ride) => <RideCard key={ride.id} ride={ride} viewer={viewer} />)}
              </ul>
            </section>
          ))}

        {/* Pagination, only when there is more than one page */}
        {status === 'ready' && pages > 1 && (
          <nav className="flex flex-wrap items-center gap-1.5" aria-label="Pagination">
            {page > 1 && <Button variant="secondary" size="sm" onClick={() => setPage(page - 1)}>Previous</Button>}
            {Array.from({ length: pages }, (_, i) => i + 1).map((number) => (
              <Button
                key={number}
                variant={number === page ? 'primary' : 'secondary'}
                size="sm"
                aria-current={number === page ? 'page' : undefined}
                onClick={() => setPage(number)}
              >
                {number}
              </Button>
            ))}
            {page < pages && <Button variant="secondary" size="sm" onClick={() => setPage(page + 1)}>Next</Button>}
          </nav>
        )}
      </div>
    </PageShell>
  )
}
