import { useMemo, useReducer, useState } from 'react'
import { RidesContext, ViewerContext } from './context.js'
import { initialRides, users } from '../data/rides.js'
import { acceptCheck, activeRequest, conflictingRide, queue, seatCount } from '../data/seats.js'

let nextRequest = 100

function mapRide(state, rideId, change) {
  return state.map((ride) => (ride.id === rideId ? change(ride) : ride))
}

// After seats free up, offer them down the line: each person in the queue whose group still fits
// becomes a pending request (seats already on offer to someone else don't count as free).
function offerFreedSeats(ride) {
  const { left, pending } = seatCount(ride)
  let available = left - pending
  const offered = new Set()
  for (const request of queue(ride)) {
    if (request.seats <= available) {
      offered.add(request)
      available -= request.seats
    }
  }
  if (offered.size === 0) return ride
  return { ...ride, requests: ride.requests.map((r) => (offered.has(r) ? { ...r, status: 'pending' } : r)) }
}

// The house rules live here for Phase 1; in Phase 2 the API enforces them.
function reducer(state, action) {
  const ride = state.find((r) => r.id === action.rideId)
  if (!ride) return state

  switch (action.type) {
    case 'request': {
      if (ride.cancelled || activeRequest(ride, action.riderId)) return state
      if (conflictingRide(state, ride, action.riderId)) return state
      const { left } = seatCount(ride)
      if (left > 0 && action.seats > left) return state
      const request = {
        id: 'r' + nextRequest++,
        riderId: action.riderId,
        seats: action.seats,
        message: action.message,
        status: left === 0 ? 'waitlisted' : 'pending',
      }
      return mapRide(state, ride.id, (r) => ({ ...r, requests: [...r.requests, request] }))
    }

    case 'withdraw': {
      const mine = activeRequest(ride, action.riderId)
      if (!mine) return state
      const next = mapRide(state, ride.id, (r) => ({
        ...r,
        requests: r.requests.map((q) => (q === mine ? { ...q, status: 'withdrawn' } : q)),
      }))
      return mine.status === 'accepted' ? mapRide(next, ride.id, offerFreedSeats) : next
    }

    case 'accept': {
      const request = ride.requests.find((r) => r.id === action.requestId)
      if (!request || request.status !== 'pending' || ride.cancelled) return state
      if (!acceptCheck(state, ride, request).ok) return state
      return mapRide(state, ride.id, (r) => {
        const accepted = { ...r, requests: r.requests.map((q) => (q === request ? { ...q, status: 'accepted' } : q)) }
        if (seatCount(accepted).left > 0) return accepted
        // A full car closes to new requests: whoever was still pending goes into the queue
        return { ...accepted, requests: accepted.requests.map((q) => (q.status === 'pending' ? { ...q, status: 'waitlisted' } : q)) }
      })
    }

    case 'decline':
      // The seats the declined request was holding go to the next people in line
      return mapRide(
        mapRide(state, ride.id, (r) => ({
          ...r,
          requests: r.requests.map((q) => (q.id === action.requestId && q.status === 'pending' ? { ...q, status: 'declined' } : q)),
        })),
        ride.id,
        offerFreedSeats,
      )

    case 'cancelRide':
      return mapRide(state, ride.id, (r) => ({ ...r, cancelled: true }))

    default:
      return state
  }
}

export function RidesProvider({ children }) {
  const [rides, dispatch] = useReducer(reducer, initialRides)
  const value = useMemo(
    () => ({ rides: rides.map((r) => ({ ...r, driver: users[r.driverId] })), dispatch }),
    [rides],
  )
  return <RidesContext.Provider value={value}>{children}</RidesContext.Provider>
}

// Stand-in for sign-in until the auth surface exists
export function ViewerProvider({ children }) {
  const [viewerId, setViewerId] = useState('hana')
  const value = useMemo(() => ({ viewer: users[viewerId] ?? null, setViewerId }), [viewerId])
  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>
}
