const sizes = {
  sm: 'h-7 w-7 text-[11px] bg-brand-50 text-brand-700',
  md: 'h-9 w-9 text-[11px] bg-brand-50 text-brand-700',
  lg: 'h-10 w-10 text-sm bg-brand-100 text-brand-800',
}

// A round badge with someone's initials
export default function Avatar({ initials, size = 'md', className = '' }) {
  return (
    <span className={`inline-flex flex-none items-center justify-center rounded-full font-display font-bold ${sizes[size]} ${className}`}>
      {initials}
    </span>
  )
}
