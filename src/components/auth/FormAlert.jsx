// role="alert" makes screen readers announce it as soon as it appears
export default function FormAlert({ title, detail }) {
  return (
    <div role="alert" className="rounded-card border border-red-200 bg-red-50 px-5 py-4">
      <p className="text-sm font-semibold text-red-900">{title}</p>
      {detail && <p className="mt-1 text-xs text-red-800/80">{detail}</p>}
    </div>
  )
}