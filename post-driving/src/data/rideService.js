import { acceptanceError, formToRide, riderHasConflict, seatSummary, validateRide } from '../domain/rides.js';
import { createSeed } from './seed.js';

export const STORAGE_KEY = 'darb.rides.v1';

/** Replace this adapter with HTTP calls when the group API is ready. */
export function createRideService({ storage, latency = 180, scenario = '', seed = createSeed } = {}) {
  let memory;
  let failNextLoad = scenario === 'error';
  const pause = () => new Promise(resolve => setTimeout(resolve, latency));
  const clone = value => JSON.parse(JSON.stringify(value));
  function read() {
    if (!storage && memory) return clone(memory);
    const saved = storage?.getItem(STORAGE_KEY);
    if (!saved) return scenario === 'empty' ? [] : seed();
    let data;
    try { data = JSON.parse(saved); } catch { throw new Error('Saved rides could not be read. Your browser data may be damaged.'); }
    if (!Array.isArray(data) || data.some(ride => !ride.id || !Array.isArray(ride.requests))) {
      throw new Error('Saved rides use an unsupported format.');
    }
    return data;
  }
  function write(rides) {
    // Write first so storage failures never report an unsuccessful save as successful.
    storage?.setItem(STORAGE_KEY, JSON.stringify(rides));
    memory = clone(rides);
    return clone(rides);
  }
  function ownedRide(rides, id, viewer) {
    if (!viewer) throw new Error('Sign in to manage your rides.');
    const ride = rides.find(item => item.id === id);
    if (!ride) throw new Error('This ride could not be found.');
    if (ride.driverId !== viewer.id) throw new Error('Only the driver can manage this ride.');
    if (ride.status !== 'scheduled') throw new Error('This ride is cancelled.');
    return ride;
  }
  return {
    async list() {
      await pause();
      if (failNextLoad) {
        failNextLoad = false;
        throw new Error('We could not load your rides. Please try again.');
      }
      const rides = read();
      if (!storage?.getItem(STORAGE_KEY) && !memory) write(rides);
      return rides;
    },
    async save(values, viewer, id) {
      await pause();
      if (!viewer) throw new Error('Sign in to post a ride.');
      const rides = read();
      const previous = id ? ownedRide(rides, id, viewer) : null;
      const errors = validateRide(values, viewer.passengerCapacity, previous ? seatSummary(previous).taken : 0);
      if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
      const fields = formToRide(values);
      if (previous?.requests.some(request => request.status === 'accepted'
        && riderHasConflict(rides, request.riderId, fields.departureAt, id))) {
        throw new Error('This departure would conflict with another accepted ride for one of your riders. Choose a time at least three hours apart.');
      }
      const ride = previous ? { ...previous, ...fields } : {
        ...fields, id: crypto.randomUUID(), driverId: viewer.id, status: 'scheduled', requests: [],
      };
      return { ride, rides: write(previous ? rides.map(item => item.id === id ? ride : item) : [...rides, ride]) };
    },
    async review(rideId, requestId, decision, viewer) {
      await pause();
      const rides = read();
      const ride = ownedRide(rides, rideId, viewer);
      const request = ride.requests.find(item => item.id === requestId);
      if (!request || request.status !== 'pending') throw new Error('This request is no longer waiting for review.');
      if (!['accepted', 'declined'].includes(decision)) throw new Error('Choose accept or decline.');
      if (Date.parse(ride.departureAt) <= Date.now()) throw new Error('This ride has already departed.');
      if (decision === 'accepted') {
        const error = acceptanceError(rides, ride, request);
        if (error) throw new Error(error);
      }
      request.status = decision;
      return write(rides);
    },
    async cancel(id, viewer) {
      await pause();
      const rides = read();
      const ride = ownedRide(rides, id, viewer);
      ride.status = 'cancelled';
      ride.requests.forEach(request => {
        if (['pending', 'accepted', 'queued'].includes(request.status)) request.status = 'cancelled';
      });
      return write(rides);
    },
  };
}
