import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useRides } from '../state/RidesContext.jsx';

const navigation = [
  { to: '/rides', label: 'Find a ride' },
  { to: '/post', label: 'Post a ride' },
  { to: '/my-rides/driving', label: 'My rides' },
];

export function AppLayout() {
  const { viewer, notice, setNotice } = useRides();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setMenuOpen(false);
    document.getElementById('main-content')?.focus();
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const navLink = ({ isActive }) => `rounded-card px-3 py-2 text-sm ${isActive ? 'bg-brand-50 font-semibold text-brand-900' : 'text-muted hover:bg-brand-50 hover:text-brand-900'}`;
  return <div className="flex min-h-screen flex-col">
    <a href="#main-content" className="sr-only z-50 bg-brand-900 p-3 text-paper focus:not-sr-only focus:fixed">Skip to content</a>
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3.5">
        <button type="button" className="rounded-card border border-line p-2 md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(open => !open)}>
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12" /></svg>
        </button>
        <Link to="/" className="flex items-baseline gap-2" aria-label="Darb home">
          <span className="font-display text-xl font-bold tracking-tight text-brand-900">Darb</span>
          <span className="hidden text-[11px] uppercase tracking-[0.18em] text-accent-600 sm:inline">Seats going your way</span>
        </Link>
        <nav className="ml-4 hidden gap-1 md:flex" aria-label="Main navigation">
          {navigation.map(item => <NavLink key={item.to} to={item.to} className={navLink}>{item.label}</NavLink>)}
        </nav>
        <span className="flex-1" />
        {viewer ? <span aria-label={`Signed in as ${viewer.name}`} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-900 font-display text-xs font-bold text-paper">{viewer.initials}</span>
          : <Link to="/sign-in" className="text-sm font-semibold text-brand-900">Sign in</Link>}
      </div>
      {menuOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="flex flex-col gap-1 border-t border-line px-4 py-3 md:hidden">
        {navigation.map(item => <NavLink key={item.to} to={item.to} className={navLink} onClick={() => setMenuOpen(false)}>{item.label}</NavLink>)}
      </nav>}
    </header>
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 focus:outline-none">
      <div aria-live="polite" aria-atomic="true">
        {notice && <div className="mb-6 flex items-start justify-between gap-4 rounded-card border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p>{notice}</p><button type="button" onClick={() => setNotice('')} aria-label="Dismiss notification" className="font-semibold">×</button>
        </div>}
      </div>
      <Outlet />
    </main>
    <footer className="mx-auto mt-20 w-full max-w-6xl border-t border-line px-4 py-8 text-xs text-muted">
      <span className="font-display font-bold tracking-wide">DARB</span> · Seats going your way · CSC443 · Fall 2026
    </footer>
  </div>;
}
