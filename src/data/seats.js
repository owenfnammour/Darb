const sum = (requests) => requests.reduce((n, r) => n + r.seats, 0)

// Nb of Seats left is always calculated from accepted requests not stored.
// Accepted seats can never be > than seats offered.
export function seatCount(ride, viewer) {
  const accepted = ride.requests.filter((r) => r.status === 'accepted')
  const taken = Math.min(sum(accepted), ride.seatsOffered)
  return {
    taken,
    mine: Math.min(sum(accepted.filter((r) => r.riderId === viewer?.id)), taken),
    pending: sum(ride.requests.filter((r) => r.status === 'pending')),
    left: ride.seatsOffered - taken,
  }
}

// The rider's live request on a ride: pending, accepted or waiting in line
export function activeRequest(ride, riderId) {
  return ride.requests.find(
    (r) => r.riderId === riderId && ['pending', 'accepted', 'waitlisted'].includes(r.status),
  )
}

export function declinedRequest(ride, riderId) {
  return ride.requests.find((r) => r.riderId === riderId && r.status === 'declined')
}

// The people waiting for a seat on a full ride, in the order they asked
export function queue(ride) {
  return ride.requests.filter((r) => r.status === 'waitlisted')
}

const THREE_HOURS = 3 * 60 * 60 * 1000

// House rule: a rider can't hold accepted seats on two rides that leave within three hours
// of each other. Returns the ride in the way, or undefined.
export function conflictingRide(rides, ride, riderId) {
  const start = new Date(ride.departsAt).getTime()
  return rides.find(
    (other) =>
      other.id !== ride.id &&
      !other.cancelled &&
      other.requests.some((r) => r.riderId === riderId && r.status === 'accepted') &&
      Math.abs(new Date(other.departsAt).getTime() - start) <= THREE_HOURS,
  )
}

// Can the driver accept this request? { ok } or { ok: false, reason }
export function acceptCheck(rides, ride, request) {
  const { left } = seatCount(ride)
  if (request.seats > left) {
    return { ok: false, reason: left === 0 ? 'The car is full.' : `Only ${left} seat${left === 1 ? '' : 's'} left.` }
  }
  if (conflictingRide(rides, ride, request.riderId)) {
    return { ok: false, reason: 'Already has a seat on a ride leaving within three hours.' }
  }
  return { ok: true }
}
