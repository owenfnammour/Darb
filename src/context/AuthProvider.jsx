import { useEffect, useState } from 'react'
import { AuthContext } from './authContext.js'
import * as authApi from '../lib/authApi.js'

// status is 'loading' while we check for a saved session,
// then 'signed-in' or 'signed-out'
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')

  // On first load: is someone already signed in from last time?
  useEffect(() => {
    let cancelled = false
    authApi.getSession().then((sessionUser) => {
      if (cancelled) return
      setUser(sessionUser)
      setStatus(sessionUser ? 'signed-in' : 'signed-out')
    })
    return () => {
      cancelled = true
    }
  }, [])

  // These throw an AuthError when they fail.
  // The page that calls them catches it and shows the message.
  async function signIn(credentials) {
    const signedInUser = await authApi.signIn(credentials)
    setUser(signedInUser)
    setStatus('signed-in')
    return signedInUser
  }

  async function register(details) {
    const newUser = await authApi.register(details)
    setUser(newUser)
    setStatus('signed-in')
    return newUser
  }

  async function signOut() {
    await authApi.signOut()
    setUser(null)
    setStatus('signed-out')
  }

  // Dev only, for the "Viewing as" switch. Not available in a real build.
  async function signInAs(id) {
    const switchedUser = await authApi.signInAs(id)
    setUser(switchedUser)
    setStatus(switchedUser ? 'signed-in' : 'signed-out')
  }

  const value = { user, status, signIn, register, signOut, signInAs: import.meta.env.DEV ? signInAs : undefined }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}