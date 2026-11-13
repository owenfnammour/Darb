export default function RoadLine({ className = '' }) {
  const dashes = [];
  for (let i = 0; i < 6; i++) {
    dashes.push(<span key={'long' + i} className="h-0.5 w-6 rounded-full bg-accent-400"></span>);
    dashes.push(<span key={'short' + i} className="h-0.5 w-3 rounded-full bg-accent-200"></span>);
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`} aria-hidden="true">
      {dashes}
      <span className="h-0.5 flex-1 rounded-full bg-line"></span>
    </div>
  )
}
