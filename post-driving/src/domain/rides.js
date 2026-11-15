export const CAMPUSES = ['Byblos campus', 'Beirut campus'];
export const CAMPUS_TIME_ZONE = 'Asia/Beirut';

/** Forms and display use campus local time; stored departure times are ISO instants. */
export function campusDateTime(instant = new Date()) {
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

export function seatSummary(ride) {
  const accepted = ride.requests.filter(request => request.status === 'accepted');
  const pending = ride.requests.filter(request => request.status === 'pending');
  const taken = accepted.reduce((sum, request) => sum + request.seats, 0);
  return {
    taken, remaining: ride.offeredSeats - taken,
    pendingCount: pending.length,
    pendingSeats: pending.reduce((sum, request) => sum + request.seats, 0),
  };
}

export function validateRide(values, capacity, acceptedSeats = 0, now = Date.now()) {
  const errors = {};
  const seats = Number(values.offeredSeats);
  const price = Number(values.price);
  if (!values.origin.trim()) errors.origin = 'Say where you are leaving from.';
  if (!CAMPUSES.includes(values.destination)) errors.destination = 'Choose a campus.';
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
    origin: ride.origin, destination: ride.destination, ...campusDateTime(ride.departureAt),
    offeredSeats: String(ride.offeredSeats), price: String(ride.price), notes: ride.notes,
  };
}

export function formToRide(values) {
  return {
    origin: values.origin.trim(), destination: values.destination,
    departureAt: new Date(departureInstant(values.date, values.time)).toISOString(),
    offeredSeats: Number(values.offeredSeats), price: Number(values.price), notes: values.notes.trim(),
  };
}

export function riderHasConflict(rides, riderId, departureAt, excludingRideId) {
  return rides.some(ride => ride.id !== excludingRideId && ride.status === 'scheduled'
    && Math.abs(Date.parse(ride.departureAt) - Date.parse(departureAt)) < 3 * 60 * 60 * 1000
    && ride.requests.some(request => request.riderId === riderId && request.status === 'accepted'));
}

export function acceptanceError(rides, ride, request) {
  if (ride.status !== 'scheduled') return 'This ride is cancelled.';
  if (Date.parse(ride.departureAt) <= Date.now()) return 'This ride has already departed.';
  if (request.status !== 'pending') return 'This request has already been reviewed.';
  if (request.seats > seatSummary(ride).remaining) return `This request needs ${request.seats} ${request.seats === 1 ? 'seat' : 'seats'}, but only ${seatSummary(ride).remaining} remain.`;
  if (riderHasConflict(rides, request.riderId, ride.departureAt, ride.id)) return 'This rider already has an accepted ride departing within three hours.';
  return null;
}

export function formatDeparture(departureAt) {
  const date = new Intl.DateTimeFormat('en-GB', { timeZone: CAMPUS_TIME_ZONE, weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(departureAt));
  return `${date} · ${campusDateTime(departureAt).time}`;
}

export const formatPrice = price => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 2,
}).format(price).replace(/\.00$/, '');
