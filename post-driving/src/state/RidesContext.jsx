import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createRideService } from '../data/rideService.js';
import { demoUser } from '../data/seed.js';

const RidesContext = createContext(null);

function browserService() {
  let storage;
  try { storage = window.localStorage; } catch { /* Memory mode when browser storage is disabled. */ }
  const scenario = new URLSearchParams(window.location.search).get('demo');
  // Demo state URLs are isolated from the user's saved rides.
  return createRideService({ storage: scenario ? undefined : storage, scenario });
}

/** Supply your group's viewer and API adapter here; screens need no storage knowledge. */
export function RidesProvider({ children, viewer = demoUser, service: suppliedService }) {
  const [service] = useState(() => suppliedService ?? browserService());
  const [rides, setRides] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const loading = useRef(null);

  const reload = useCallback(async () => {
    setStatus('loading');
    setError('');
    // Share an in-flight read (including React StrictMode's development remount).
    const pending = loading.current ?? service.list();
    loading.current = pending;
    try { setRides(await pending); setStatus('ready'); }
    catch (failure) { setError(failure.message); setStatus('error'); }
    finally { if (loading.current === pending) loading.current = null; }
  }, [service]);
  useEffect(() => { reload(); }, [reload]);
  useEffect(() => {
    const update = event => { if (event.key === 'darb.rides.v1') reload(); };
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, [reload]);

  async function saveRide(values, id) {
    const result = await service.save(values, viewer, id);
    setRides(result.rides);
    setNotice(id ? 'Your ride has been updated.' : 'Your ride is posted. Seats are going your way.');
    return result.ride;
  }
  async function reviewRequest(rideId, requestId, decision) {
    setRides(await service.review(rideId, requestId, decision, viewer));
    setNotice(decision === 'accepted' ? 'Request accepted. The seat count is updated.' : 'Request declined.');
  }
  async function cancelRide(id) {
    setRides(await service.cancel(id, viewer));
    setNotice('Ride cancelled. Its requests have been cancelled too.');
  }
  return <RidesContext.Provider value={{ rides, viewer, status, error, notice, setNotice, reload, saveRide, reviewRequest, cancelRide }}>
    {children}
  </RidesContext.Provider>;
}

export function useRides() {
  const context = useContext(RidesContext);
  if (!context) throw new Error('useRides must be used inside RidesProvider.');
  return context;
}
