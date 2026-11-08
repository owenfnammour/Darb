const tones = {
  green: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
  amber: 'bg-accent-50 text-accent-800 ring-accent-200',
  full: 'bg-brand-100 text-brand-700 ring-brand-200',
  queue: 'bg-brand-50 text-brand-700 ring-brand-100',
  red: 'bg-red-50 text-red-800 ring-red-100',
  dark: 'bg-brand-900 text-paper ring-brand-900',
}

export default function StatusPill({ tone, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${tones[tone]}`}>
      {children}
    </span>
  )
}
