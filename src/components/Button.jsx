const variants = {
  primary: 'bg-brand-900 text-paper hover:bg-brand-800 focus-visible:outline-brand-900',
  secondary: 'border border-line bg-surface text-brand-900 hover:bg-brand-50',
  ghost: 'text-muted hover:bg-brand-50 hover:text-brand-900',
  danger: 'bg-red-700 text-white hover:bg-red-800',
  accent: 'bg-accent-400 text-brand-900 hover:bg-accent-300',
  onDark: 'border border-paper/25 text-paper hover:bg-paper/10',
}

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-card px-4 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
