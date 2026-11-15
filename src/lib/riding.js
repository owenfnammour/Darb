// Everything the Riding tab shows is worked out from the rides and their requests.
// Nothing here is stored: same idea as "seats left" in seats.js.
import { activeRequest, declinedRequest, queue } from '../data/seats.js'
import { NOW } from '../data/rides.js'

const ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth']

// 2 -> "Second", 7 -> "7th"
export function ordinal(n) {
  return ORDINALS[n - 1] ?? `${n}th`
}

// Where the viewer stands on one ride: the pill to show and the action they can take.
export function riderStatus(ride, request) {
  if (ride.cancelled) {
    return { key: 'cancelled', label: 'Cancelled', tone: 'red', action: null }
  }

  switch (request.status) {
    case 'accepted':
      // Giving up a seat you already have is destructive, so it asks first
      return { key: 'accepted', label: 'Accepted', tone: 'green', action: { label: 'Give up my seat', variant: 'secondary', confirm: true } }
    case 'pending':
      return { key: 'pending', label: 'Waiting on the driver', tone: 'amber', action: { label: 'Withdraw', variant: 'ghost', confirm: false } }
    case 'waitlisted': {
      const place = queue(ride).findIndex((r) => r.id === request.id) + 1
      return { key: 'queue', label: `${ordinal(place)} in the queue`, tone: 'queue', action: { label: 'Leave queue', variant: 'ghost', confirm: false } }
    }
    case 'declined':
      return { key: 'declined', label: 'Declined', tone: 'red', action: null }
    default:
      return null
  }
}

const isUpcoming = (ride, now) => new Date(ride.departsAt) >= now

// The rows of the Riding tab: every upcoming ride the viewer asked to join, soonest first.
// Withdrawn requests are left out on purpose: the rider chose to leave.
export function ridingList(rides, riderId, now = NOW) {
  return rides
    .filter((ride) => isUpcoming(ride, now))
    .map((ride) => {
      const request = activeRequest(ride, riderId) ?? declinedRequest(ride, riderId)
      return request ? { ride, request, status: riderStatus(ride, request) } : null
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.ride.departsAt) - new Date(b.ride.departsAt))
}

// For the number on the Driving tab
export function drivingCount(rides, driverId, now = NOW) {
  return rides.filter((ride) => ride.driverId === driverId && !ride.cancelled && isUpcoming(ride, now)).length
}
