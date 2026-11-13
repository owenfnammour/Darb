import { useState } from 'react'
import { Link } from 'react-router-dom'

// Pages nobody has built yet land on the "nothing here yet" page
const links = [
  { label: 'Find a ride', to: '/' },
  { label: 'Post a ride', to: '/post' },
  { label: 'My rides', to: '/my-rides' },
]

// active: which nav link is the current page
// initials: the signed-in user's initials (OW for Owen Nammour), empty when signed out
export default function Header({ active, initials }) {
  const [menuOpen, setMenuOpen] = useState(false)

  function linkClass(link) {
    if (link.label === active) {
      return 'rounded-card px-3 py-2 text-sm bg-brand-50 font-semibold text-brand-900'
    }
    return 'rounded-card px-3 py-2 text-sm text-muted hover:bg-brand-50 hover:text-brand-900'
  }

  const navLinks = links.map((link) => (
    <Link key={link.label} to={link.to} className={linkClass(link)} aria-current={link.label === active ? 'page' : undefined}>
      {link.label}
    </Link>
  ))

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3.5">
        <button
          className="rounded-card border border-line p-2 md:hidden"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M2 4h12M2 8h12M2 12h12" />
          </svg>
        </button>

        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-bold tracking-tight text-brand-900">Darb</span>
          <span className="hidden text-[11px] uppercase tracking-[0.18em] text-accent-600 sm:inline">Seats going your way</span>
        </Link>

        <nav className="ml-4 hidden gap-1 md:flex">{navLinks}</nav>

        <span className="flex-1"></span>

        {initials ? (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-900 font-display text-xs font-bold text-paper">
            {initials}
          </span>
        ) : (
          <Link to="/sign-in" className="rounded-card px-3 py-2 text-sm font-semibold text-brand-900 hover:bg-brand-50">
            Sign in
          </Link>
        )}
      </div>

      {/* Phone menu: same links stacked, only shown when the button is pressed */}
      {menuOpen && <nav className="flex flex-col gap-1 border-t border-line px-4 py-3 md:hidden">{navLinks}</nav>}
    </header>
  )
}
