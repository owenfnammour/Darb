import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

// Anywhere in the app: const { user, status, signIn, register, signOut } = useAuth()
export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return auth
}