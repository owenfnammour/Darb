const variants = {
  primary: 'bg-brand-900 text-paper hover:bg-brand-800 focus-visible:outline-brand-900',
  secondary: 'border border-line bg-surface text-brand-900 hover:bg-brand-50',
  ghost: 'text-muted hover:bg-brand-50 hover:text-brand-900',
  danger: 'bg-red-700 text-white hover:bg-red-800',
  accent: 'bg-accent-400 text-brand-900 hover:bg-accent-300',
  onDark: 'border border-paper/25 text-paper hover:bg-paper/10',
}

// Two sizes: the default, and a small one for buttons inside cards and lists.
const sizes = {
  md: 'px-4 py-2.5 text-sm',
  sm: 'px-3 py-1.5 text-xs',
}

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-card font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
