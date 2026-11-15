import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RideForm } from '../components/RideForm.jsx';
import { RequireViewer } from '../components/RequireViewer.jsx';
import { Button, ErrorPanel, LoadingRides, PageHeading } from '../components/ui.jsx';
import { useRides } from '../state/RidesContext.jsx';

export function PostRidePage() {
  const { rideId } = useParams();
  const { rides, viewer, status, error, reload } = useRides();
  const ride = rides.find(item => item.id === rideId);
  useEffect(() => { document.title = `${rideId ? 'Edit' : 'Post'} a ride — Darb`; }, [rideId]);
  if (status === 'loading') return <LoadingRides />;
  if (status === 'error') return <ErrorPanel message={error} onRetry={reload} />;
  if (rideId && (!ride || ride.driverId !== viewer?.id || ride.status !== 'scheduled')) {
    return <div><PageHeading>This ride is unavailable</PageHeading><p className="mt-3 text-sm text-muted">You can edit your own active rides.</p><Button to="/my-rides/driving" className="mt-6">Back to my rides</Button></div>;
  }
  return <RequireViewer><div className="mx-auto max-w-5xl">
    <nav className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-brand-900">Darb</Link> <span className="text-accent-500">/</span> {rideId ? 'Edit' : 'Post'} a ride
    </nav>
    <PageHeading>{rideId ? 'Edit' : 'Post'} a ride</PageHeading>
    <p className="mt-1.5 max-w-prose text-sm text-muted">{rideId ? 'Plans changed? Update your trip. Your accepted riders keep their seats.' : 'You are driving anyway. Say where and when, and how many seats are going spare.'}</p>
    <RideForm key={rideId ?? 'new'} ride={ride} />
  </div></RequireViewer>;
}
