import { useCallback, useMemo, useReducer } from 'react'
import { RidesContext, ViewerContext, useViewer } from './context.js'
import { prepareDriverRide } from '../lib/rideForm.js'
import { useAuth } from '../context/authContext.js'
import { initialRides, users } from '../data/rides.js'
import { reducer } from '../lib/ridesReducer.js'

export function RidesProvider({ children }) {
  const [rides, dispatch] = useReducer(reducer, initialRides)
  const { viewer } = useViewer()
  const saveRide = useCallback((values, rideId) => {
    const ride = prepareDriverRide(rides, values, viewer, rideId, crypto.randomUUID())
    dispatch({ type: 'driver/save', ride })
    return ride
  }, [rides, viewer])
  const value = useMemo(
    () => ({ rides: rides.map((r) => ({ ...r, driver: users[r.driverId] ?? r.driver })), dispatch, saveRide }),
    [rides, saveRide],
  )
  return <RidesContext.Provider value={value}>{children}</RidesContext.Provider>
}

// The viewer is whoever is signed in (see context/AuthProvider.jsx).
// Sample users also carry profile details (major, rides driven...), so those are added when they exist.
// useViewer() stays the same for every page.
export function ViewerProvider({ children }) {
  const { user, status, signInAs } = useAuth()
  const value = useMemo(
    () => ({
      viewer: user ? { ...user, ...users[user.id] } : null,
      // The dev "Viewing as" switch signs in as that person for real
      setViewerId: (id) => signInAs?.(id),
    }),
    [user, signInAs],
  )

  // Wait until we know who is signed in, so no page flashes its signed-out version on refresh
  if (status === 'loading') return null

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>
}
