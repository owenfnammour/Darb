// One labelled input. Shows the hint before anything is wrong,
// and the error in the same spot (in red) once something is.
const inputBase =
  'w-full rounded-card border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-4'
const okStyle = 'border-line focus:border-brand-500 focus:ring-brand-100'
const errorStyle = 'border-red-500 focus:border-red-600 focus:ring-red-100'

export default function FormField({ id, label, hint, error, ...inputProps }) {
  const message = error || hint
  const messageId = message ? `${id}-msg` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </label>
      <input
        id={id}
        className={`${inputBase} ${error ? errorStyle : okStyle}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        {...inputProps}
      />
      {message && (
        <p id={messageId} className={error ? 'text-xs font-medium text-red-700' : 'text-xs text-muted'}>
          {message}
        </p>
      )}
    </div>
  )
}