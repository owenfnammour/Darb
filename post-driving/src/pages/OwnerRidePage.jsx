import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { RequestReview } from '../components/RequestReview.jsx';
import { RequireViewer } from '../components/RequireViewer.jsx';
import { SeatCounter } from '../components/SeatCounter.jsx';
import { Badge, Button, ErrorPanel, LoadingRides, PageHeading } from '../components/ui.jsx';
import { formatDeparture, formatPrice } from '../domain/rides.js';
import { useRides } from '../state/RidesContext.jsx';
import { useHasDeparted } from '../hooks/useHasDeparted.js';

export function OwnerRidePage() {
  const { rideId } = useParams();
  const { rides, viewer, status, error, reload, cancelRide } = useRides();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const navigate = useNavigate();
  const ride = rides.find(item => item.id === rideId && item.driverId === viewer?.id);
  const hasDeparted = useHasDeparted(ride?.departureAt);
  useEffect(() => { document.title = 'Manage your ride — Darb'; }, []);
  if (status === 'loading') return <LoadingRides />;
  if (status === 'error') return <ErrorPanel message={error} onRetry={reload} />;
  if (!ride) return <div><PageHeading>Ride not found</PageHeading><p className="mt-3 text-sm text-muted">Open one of your own rides to manage requests.</p><Button to="/my-rides/driving" className="mt-6">Back to my rides</Button></div>;
  const accepted = ride.requests.filter(request => request.status === 'accepted');
  async function cancel() {
    setBusy(true);
    try { await cancelRide(ride.id); navigate('/my-rides/driving'); }
    catch (failure) { setCancelError(failure.message); setConfirming(false); }
    finally { setBusy(false); }
  }
  return <RequireViewer>
    <Link to="/my-rides/driving" className="text-xs text-muted hover:text-brand-900">← My rides</Link>
    <div className="mt-4 flex flex-wrap items-start justify-between gap-5">
      <div><PageHeading>{ride.origin} <span className="text-accent-500">→</span> {ride.destination}</PageHeading>
        <p className="mt-2 text-sm text-muted">{formatDeparture(ride.departureAt)} · {formatPrice(ride.price)} a seat</p>
        {ride.status === 'scheduled' && hasDeparted && <div className="mt-3"><Badge>Departed</Badge></div>}
      </div>
      {ride.status === 'scheduled' ? <div className="flex gap-2">
        <Button to={`/rides/${ride.id}/edit`} variant="secondary" small>Edit ride</Button>
        <Button variant="danger" small onClick={() => setConfirming(true)}>Cancel ride</Button>
      </div> : <Badge tone="danger">Cancelled</Badge>}
    </div>
    <section className="mt-8 rounded-card border border-line bg-surface p-5">
      <h2 className="mb-4 font-display text-xl font-semibold text-brand-900">Who is in the car</h2>
      <SeatCounter ride={ride} viewer={viewer} />
      {accepted.length > 0 && <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
        {accepted.map(request => <li key={request.id}>{request.riderName} · {request.seats} {request.seats === 1 ? 'seat' : 'seats'}</li>)}
      </ul>}
      {ride.notes && <p className="mt-5 whitespace-pre-wrap border-t border-line pt-4 text-sm text-muted">{ride.notes}</p>}
    </section>
    {ride.status === 'scheduled' && <RequestReview ride={ride} />}
    {cancelError && <p role="alert" className="mt-4 text-sm text-red-700">{cancelError}</p>}
    <ConfirmDialog open={confirming} title="Cancel this ride?" confirmLabel="Cancel ride" cancelLabel="Keep ride" busy={busy}
      onCancel={() => setConfirming(false)} onConfirm={cancel}>
      This trip and all its accepted, pending, and queued requests will be cancelled.
    </ConfirmDialog>
  </RequireViewer>;
}
