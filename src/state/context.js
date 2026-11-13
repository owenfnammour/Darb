import { createContext, useContext } from 'react'

export const RidesContext = createContext(null)
export const ViewerContext = createContext({ viewer: null, setViewerId: () => {} })

// { rides, dispatch } where every ride already carries its driver
export function useRides() {
  return useContext(RidesContext)
}

// { viewer, setViewerId } viewer is null when signed out
export function useViewer() {
  return useContext(ViewerContext)
}
