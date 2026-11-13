const colors = {
  taken: 'text-brand-700',
  free: 'text-brand-200',
  pending: 'text-accent-400',
  yours: 'text-accent-600 ring-2 ring-accent-500 ring-offset-1 ring-offset-paper rounded-sm',
}

export default function SeatGlyph({ state }) {
  return (
    <span className={`block h-5 w-5 ${colors[state]}`} title={state}>
      <svg viewBox="0 0 16 16" className="h-full w-full" fill="none" aria-hidden="true">
        <path d="M4 3.2a1.2 1.2 0 0 1 1.2-1.2h5.6A1.2 1.2 0 0 1 12 3.2V9H4V3.2Z" fill="currentColor" />
        <path d="M2.6 9.6A1.6 1.6 0 0 1 4.2 8h7.6a1.6 1.6 0 0 1 1.6 1.6V13H2.6V9.6Z" fill="currentColor" opacity=".55" />
      </svg>
    </span>
  )
}
