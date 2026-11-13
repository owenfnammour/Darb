import { Link } from 'react-router-dom'

export default function Breadcrumb({ current }) {
  return (
    <nav className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-brand-900">Darb</Link> <span className="text-accent-500">/</span> {current}
    </nav>
  )
}
