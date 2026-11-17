import { NOW } from '../data/rides.js'
import { conflictingRide } from '../data/seats.js'

export const CAMPUSES = ['Byblos campus', 'Beirut campus'];
export const CAMPUS_TIME_ZONE = 'Asia/Beirut';

/** Forms and display use campus local time; stored departure times are ISO instants. */
export function campusDateTime(instant = NOW) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: CAMPUS_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(instant)).map(({ type, value }) => [type, value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

export function departureInstant(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return NaN;
  const wallClock = Date.parse(`${date}T${time}:00Z`);
  if (!Number.isFinite(wallClock)) return NaN;
  let guess = wallClock;
  // Resolve the IANA zone offset, including daylight-saving changes.
  for (let i = 0; i < 3; i++) {
    const local = campusDateTime(guess);
    guess += wallClock - Date.parse(`${local.date}T${local.time}:00Z`);
  }
  const resolved = campusDateTime(guess);
  return resolved.date === date && resolved.time === time ? guess : NaN;
}

export function validateRide(values, capacity, acceptedSeats = 0, now = NOW, existingDestination) {
  const errors = {};
  const seats = Number(values.offeredSeats);
  const price = Number(values.price);
  if (!values.origin.trim()) errors.origin = 'Say where you are leaving from.';
  if (!CAMPUSES.includes(values.destination) && values.destination !== existingDestination) errors.destination = 'Choose a campus.';
  const departure = departureInstant(values.date, values.time);
  if (!values.date) errors.date = 'Choose a departure date.';
  else if (!Number.isFinite(departure) && values.time) errors.date = 'Choose a valid date and time.';
  else if (values.date < campusDateTime(now).date) errors.date = 'That date has already gone. Pick today or later.';
  if (!values.time) errors.time = 'Choose a departure time.';
  else if (!errors.date && Number.isFinite(departure) && departure <= now) errors.time = 'Choose a departure time in the future.';
  if (values.offeredSeats === '' || !Number.isInteger(seats) || seats < 1) errors.offeredSeats = 'Offer at least one whole passenger seat.';
  else if (seats > capacity) errors.offeredSeats = `Your car seats ${capacity} passengers. Enter ${capacity} or fewer.`;
  else if (seats < acceptedSeats) errors.offeredSeats = `${acceptedSeats} seats are already accepted. You cannot offer fewer.`;
  if (values.price === '' || !Number.isFinite(price) || price < 0) errors.price = 'Enter a price of zero or more.';
  else if (Math.abs(price * 100 - Math.round(price * 100)) > 0.00001) errors.price = 'Use no more than two decimal places.';
  return errors;
}

export function emptyRideForm() {
  return { origin: '', destination: CAMPUSES[0], date: '', time: '', offeredSeats: '', price: '', notes: '' };
}

export function rideToForm(ride) {
  return {
    origin: ride.from, destination: ride.to, ...campusDateTime(ride.departsAt),
    offeredSeats: String(ride.seatsOffered), price: String(ride.price), notes: ride.notes ?? '',
  };
}

export function formToRide(values) {
  return {
    from: values.origin.trim(), to: values.destination,
    departsAt: new Date(departureInstant(values.date, values.time)).toISOString(),
    seatsOffered: Number(values.offeredSeats), price: Number(values.price), notes: values.notes.trim(),
  };
}


// Phase 1 has no vehicle profile screen. Prefer a supplied capacity, otherwise use
// the documented demo cars; these defaults do not change the shared user records.
export function passengerCapacity(viewer) {
  if (Number.isInteger(viewer?.passengerCapacity) && viewer.passengerCapacity > 0) return viewer.passengerCapacity
  return { karim: 5, hana: 5, fatme: 4 }[viewer?.id] ?? 4
}

export function prepareDriverRide(rides, values, viewer, rideId, newId, now = NOW) {
  if (!viewer) throw new Error('Sign in to post a ride.')
  const previous = rideId == null ? null : rides.find((ride) => String(ride.id) === String(rideId))
  if (rideId != null && !previous) throw new Error('This ride could not be found.')
  if (previous && (previous.driverId !== viewer.id || previous.cancelled)) throw new Error('You can edit your own active rides.')
  if (previous && hasDeparted(previous.departsAt, now)) throw new Error('This ride has departed and can no longer be edited.')
  const accepted = previous?.requests.filter((request) => request.status === 'accepted').reduce((sum, request) => sum + request.seats, 0) ?? 0
  const errors = validateRide(values, passengerCapacity(viewer), accepted, now, previous?.to)
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0])
  const fields = formToRide(values)
  if (previous?.requests.some((request) => request.status === 'accepted'
    && conflictingRide(rides, { ...previous, ...fields }, request.riderId))) {
    throw new Error('This departure would conflict with another accepted ride for one of your riders. Choose a later departure.')
  }
  return previous ? { ...previous, ...fields } : {
    ...fields, id: newId, driverId: viewer.id, cancelled: false, pickup: fields.from, requests: [],
    // New registered drivers are not in the static sample-user dictionary.
    driver: { id: viewer.id, name: viewer.name, initials: viewer.initials, ridesDriven: 0 },
  }
}

export function isDriverReviewClosed(ride, now = NOW) {
  return ride.cancelled || hasDeparted(ride.departsAt, now)
}

export function hasDeparted(departsAt, now = NOW) {
  return Date.parse(departsAt) <= now
}
