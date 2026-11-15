import { NavLink } from 'react-router-dom';
import { useRides } from '../state/RidesContext.jsx';

export function MyRidesTabs() {
  const { rides, viewer, status } = useRides();
  const driving = rides.filter(ride => ride.driverId === viewer?.id && ride.status === 'scheduled').length;
  const riding = rides.filter(ride => ride.status === 'scheduled' && ride.requests.some(request => request.riderId === viewer?.id
    && ['accepted', 'pending', 'queued'].includes(request.status))).length;
  return <div className="mt-6 border-b border-line">
    <nav className="flex gap-8" aria-label="My rides">
      {[['driving', 'Driving', driving], ['riding', 'Riding', riding]].map(([path, label, count]) => <NavLink key={path} to={`/my-rides/${path}`}
        className={({ isActive }) => `border-b-2 pb-3 font-display text-sm ${isActive ? 'border-accent-500 font-semibold text-brand-900' : 'border-transparent text-muted hover:text-brand-900'}`}>
        {label} <span className="ml-1.5 rounded-full bg-brand-100 px-2 py-0.5 font-mono text-[11px] tabular-nums text-brand-700">{status === 'ready' ? count : '—'}</span>
      </NavLink>)}
    </nav>
  </div>;
}
