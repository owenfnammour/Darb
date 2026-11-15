import { campusDateTime, departureInstant } from '../domain/rides.js';

export const demoUser = { id: 'hana', name: 'Hana Ali', initials: 'HA', passengerCapacity: 5 };

/** Fresh future dates keep the sample trips usable on the first visit. */
export function createSeed(now = Date.now()) {
  const day = offset => {
    const date = campusDateTime(now + offset * 86400000).date;
    return new Date(departureInstant(date, '07:30')).toISOString();
  };
  const request = (id, riderId, riderName, seats, status, message = '') => ({ id, riderId, riderName, seats, status, message });
  const ride = (id, driverId, departureAt, requests, origin = 'Jbeil') => ({
    id, driverId, origin, destination: 'Byblos campus', departureAt,
    offeredSeats: 5, price: 4, notes: 'Pickup at the main roundabout. A small bag is fine.', status: 'scheduled', requests,
  });
  return [
    ride('morning-trip', 'hana', day(1), [
      request('r1', 'karim', 'Karim Hawa', 1, 'accepted'),
      request('r2', 'saad', 'Saad Eldin Elchakra', 2, 'accepted'),
      request('r3', 'fatme', 'Fatme Akar', 1, 'pending', 'Can you drop me at the roundabout?'),
      request('r4', 'owen', 'Owen Nammour', 2, 'pending', 'Me and a friend, if there is room.'),
    ]),
    ride('midweek-trip', 'hana', day(3), [request('r5', 'karim', 'Karim Hawa', 1, 'accepted')]),
    ride('karim-trip', 'karim', day(5), [request('r6', 'hana', 'Hana Ali', 1, 'accepted')], 'Jounieh'),
    ride('fatme-trip', 'fatme', day(6), [request('r7', 'hana', 'Hana Ali', 1, 'pending')]),
    ride('owen-trip', 'owen', day(7), [request('r8', 'hana', 'Hana Ali', 1, 'queued')]),
  ];
}
