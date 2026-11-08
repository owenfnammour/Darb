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
