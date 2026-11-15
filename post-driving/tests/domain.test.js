import test from 'node:test';
import assert from 'node:assert/strict';
import { acceptanceError, campusDateTime, departureInstant, emptyRideForm, riderHasConflict, rideToForm, seatSummary, validateRide } from '../src/domain/rides.js';
import { createSeed, demoUser } from '../src/data/seed.js';
import { createRideService, STORAGE_KEY } from '../src/data/rideService.js';

const tomorrow = new Date(Date.now() + 86400000);
const valid = () => ({ ...emptyRideForm(), origin: 'Jbeil', ...campusDateTime(tomorrow), offeredSeats: '4', price: '4' });
function memoryStorage(initial) {
  const data = new Map(initial ? [[STORAGE_KEY, JSON.stringify(initial)]] : []);
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}

test('remaining seats sum accepted quantities; pending requests never reserve seats', () => {
  assert.deepEqual(seatSummary(createSeed()[0]), { taken: 3, remaining: 2, pendingCount: 2, pendingSeats: 3 });
});

test('Beirut date/time round-trips across winter, summer, and an invalid DST gap', () => {
  for (const date of ['2030-01-15', '2030-07-15']) {
    assert.deepEqual(campusDateTime(departureInstant(date, '07:30')), { date, time: '07:30' });
  }
  assert.equal(Number.isNaN(departureInstant('2030-02-30', '07:30')), true);
  assert.equal(Number.isNaN(departureInstant('2030-03-31', '00:30')), true);
});

test('validation rejects missing fields, past departures, fractional seats, capacity overflow and invalid prices', () => {
  assert.deepEqual(Object.keys(validateRide(emptyRideForm(), 5)).sort(), ['date', 'offeredSeats', 'origin', 'price', 'time']);
  assert.equal(Object.keys(validateRide(valid(), 5)).length, 0);
  assert.ok(validateRide({ ...valid(), offeredSeats: '6' }, 5).offeredSeats);
  assert.ok(validateRide({ ...valid(), offeredSeats: '1.5' }, 5).offeredSeats);
  assert.ok(validateRide({ ...valid(), offeredSeats: '2' }, 5, 3).offeredSeats);
  assert.ok(validateRide({ ...valid(), price: '-1' }, 5).price);
  assert.ok(validateRide({ ...valid(), price: '4.123' }, 5).price);
  assert.ok(validateRide({ ...valid(), date: '2020-01-01' }, 5).date);
  const pastToday = campusDateTime(Date.now() - 60000);
  assert.ok(Object.keys(validateRide({ ...valid(), ...pastToday }, 5)).length);
});

test('a multi-seat request can fill a ride; a later acceptance cannot oversell it', async () => {
  const storage = memoryStorage(createSeed());
  const service = createRideService({ storage, latency: 0 });
  const rides = await service.review('morning-trip', 'r4', 'accepted', demoUser);
  const ride = rides.find(item => item.id === 'morning-trip');
  assert.equal(seatSummary(ride).remaining, 0);
  await assert.rejects(service.review('morning-trip', 'r3', 'accepted', demoUser), /only 0 remain/);
  await assert.rejects(service.review('morning-trip', 'r4', 'accepted', demoUser), /no longer waiting/);
});

test('a rider cannot hold accepted seats on departures less than three hours apart', () => {
  const rides = createSeed();
  const target = rides[0];
  rides[2].departureAt = new Date(Date.parse(target.departureAt) + 2 * 3600000).toISOString();
  rides[2].requests = [{ id: 'conflict', riderId: 'fatme', seats: 1, status: 'accepted' }];
  assert.match(acceptanceError(rides, target, target.requests.find(item => item.id === 'r3')), /within three hours/);
  rides[2].departureAt = new Date(Date.parse(target.departureAt) + 3 * 3600000).toISOString();
  assert.equal(riderHasConflict(rides, 'fatme', target.departureAt, target.id), false);
  rides[2].status = 'cancelled';
  assert.equal(riderHasConflict(rides, 'fatme', target.departureAt, target.id), false);
});

test('the service persists creates/edits and checks ownership and accepted capacity', async () => {
  const storage = memoryStorage(createSeed());
  const service = createRideService({ storage, latency: 0 });
  const created = await service.save(valid(), demoUser);
  assert.equal(created.rides.length, 6);
  assert.equal(created.ride.driverId, demoUser.id);
  const freshService = createRideService({ storage, latency: 0 });
  assert.equal((await freshService.list()).length, 6);
  const edited = await freshService.save({ ...valid(), origin: 'Batroun' }, demoUser, created.ride.id);
  assert.equal(edited.ride.origin, 'Batroun');
  await assert.rejects(service.save(valid(), { ...demoUser, id: 'other' }, 'morning-trip'), /Only the driver/);
  await assert.rejects(service.save({ ...valid(), offeredSeats: '2' }, demoUser, 'morning-trip'), /already accepted/);
  await assert.rejects(service.save(valid(), null), /Sign in/);
});

test('editing a departure rechecks the conflicts of accepted riders', async () => {
  const rides = createSeed();
  rides[2].requests = [{ id: 'conflict', riderId: 'karim', seats: 1, status: 'accepted' }];
  const service = createRideService({ storage: memoryStorage(rides), latency: 0 });
  await assert.rejects(service.save({ ...rideToForm(rides[0]), ...campusDateTime(rides[2].departureAt) }, demoUser, rides[0].id), /conflict/);
});

test('cancelling a ride cancels its active requests, keeping the record', async () => {
  const service = createRideService({ storage: memoryStorage(createSeed()), latency: 0 });
  const rides = await service.cancel('morning-trip', demoUser);
  const cancelled = rides.find(ride => ride.id === 'morning-trip');
  assert.equal(cancelled.status, 'cancelled');
  assert.ok(cancelled.requests.every(request => request.status === 'cancelled'));
  await assert.rejects(service.review('morning-trip', 'r3', 'accepted', demoUser), /cancelled/);
});

test('storage failures reject writes and invalid JSON reports an error', async () => {
  const service = createRideService({ storage: { getItem: () => JSON.stringify(createSeed()), setItem: () => { throw new Error('Storage full'); } }, latency: 0 });
  await assert.rejects(service.save(valid(), demoUser), /Storage full/);
  const invalid = createRideService({ storage: { getItem: () => '{broken' }, latency: 0 });
  await assert.rejects(invalid.list(), /could not be read/);
});
