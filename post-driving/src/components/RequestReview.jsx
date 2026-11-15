import { useEffect, useState } from 'react';
import { acceptanceError } from '../domain/rides.js';
import { useHasDeparted } from '../hooks/useHasDeparted.js';
import { useRides } from '../state/RidesContext.jsx';
import { ConfirmDialog } from './ConfirmDialog.jsx';
import { Badge, Button } from './ui.jsx';

/** Also usable inside the team's complete owner ride-detail screen. */
export function RequestReview({ ride }) {
  const { rides, viewer, reviewRequest } = useRides();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [declining, setDeclining] = useState(null);
  const pending = ride.requests.filter(request => request.status === 'pending');
  const hasDeparted = useHasDeparted(ride.departureAt);
  useEffect(() => { if (hasDeparted) setDeclining(null); }, [hasDeparted]);
  if (viewer?.id !== ride.driverId) return null;
  async function review(requestId, decision) {
    if (busy || Date.parse(ride.departureAt) <= Date.now()) return;
    setBusy(true);
    setError('');
    try { await reviewRequest(ride.id, requestId, decision); setDeclining(null); }
    catch (failure) { setError(failure.message); setDeclining(null); }
    finally { setBusy(false); }
  }
  return <section id="requests" className="mt-8 scroll-mt-24">
    <h2 className="font-display text-xl font-semibold tracking-tight text-brand-900">{hasDeparted ? 'Request review closed' : 'Requests waiting on you'}</h2>
    {!hasDeparted && error && <p role="alert" className="mt-3 rounded-card bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {hasDeparted ? <p className="mt-3 rounded-card border border-line bg-surface p-5 text-sm text-muted">This ride has departed. Seat requests can no longer be accepted or declined.</p>
      : pending.length === 0 ? <p className="mt-3 rounded-card border border-line bg-surface p-5 text-sm text-muted">You are all caught up. No requests are waiting for review.</p>
      : <ul className="mt-3 space-y-2">{pending.map(request => {
        const reason = acceptanceError(rides, ride, request);
        return <li key={request.id} className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface px-4 py-3">
          <span aria-hidden="true" className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand-50 font-display text-[11px] font-bold text-brand-700">
            {request.riderName.split(' ').map(word => word[0]).slice(0, 2).join('')}
          </span>
          <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-brand-900">{request.riderName}</p>
            {request.message && <p className="text-xs text-muted">“{request.message}”</p>}
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Badge>{request.seats} {request.seats === 1 ? 'seat' : 'seats'}</Badge>
            <span className="flex-1 sm:flex-none" />
            <Button small disabled={busy || Boolean(reason)} aria-label={`Accept ${request.riderName}'s request`}
              aria-describedby={reason ? `reason-${request.id}` : undefined} onClick={() => review(request.id, 'accepted')}>Accept</Button>
            <Button small variant="ghost" disabled={busy} aria-label={`Decline ${request.riderName}'s request`} onClick={() => setDeclining(request)}>Decline</Button>
          </div>
          {reason && <p id={`reason-${request.id}`} className="w-full text-xs text-accent-800">{reason}</p>}
        </li>;
      })}</ul>}
    <ConfirmDialog open={!hasDeparted && Boolean(declining)} title="Decline this request?" confirmLabel="Decline request" cancelLabel="Keep request"
      busy={busy} onCancel={() => setDeclining(null)} onConfirm={() => review(declining.id, 'declined')}>
      {declining?.riderName} will not get {declining?.seats === 1 ? 'a seat' : 'these seats'} on this trip.
    </ConfirmDialog>
  </section>;
}
