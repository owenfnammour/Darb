import { useEffect } from 'react';
import { DrivingRideRow } from '../components/DrivingRideRow.jsx';
import { MyRidesTabs } from '../components/MyRidesTabs.jsx';
import { RequireViewer } from '../components/RequireViewer.jsx';
import { Button, ErrorPanel, LoadingRides, PageHeading } from '../components/ui.jsx';
import { useRides } from '../state/RidesContext.jsx';

export function DrivingPage() {
  const { rides, viewer, status, error, reload } = useRides();
  useEffect(() => { document.title = 'My rides: driving — Darb'; }, []);
  const owned = rides.filter(ride => ride.driverId === viewer?.id && ride.status === 'scheduled')
    .sort((a, b) => Date.parse(a.departureAt) - Date.parse(b.departureAt));
  return <RequireViewer>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <PageHeading>My rides</PageHeading>
      <Button to="/post" variant="secondary" small>Post a ride</Button>
    </div>
    <MyRidesTabs />
    {status === 'loading' && <LoadingRides />}
    {status === 'error' && <ErrorPanel message={error} onRetry={reload} />}
    {status === 'ready' && (owned.length
      ? <ul aria-label="Rides you are driving" className="mt-5 space-y-3">{owned.map(ride => <DrivingRideRow key={ride.id} ride={ride} viewer={viewer} />)}</ul>
      : <div className="mt-5 rounded-card border border-dashed border-brand-200 bg-surface px-6 py-12 text-center">
        <h2 className="font-display text-xl font-semibold text-brand-900">You have not posted a ride yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">If you drive to campus with empty seats, this is where your trips will live.</p>
        <Button to="/post" className="mt-6">Post a ride</Button>
      </div>)}
  </RequireViewer>;
}
