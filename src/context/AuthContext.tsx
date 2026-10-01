import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { auth, ApiError, type AuthUser } from '../lib/api'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  signup: (data: { email: string; password: string; fullName: string; companyName: string }) => Promise<AuthUser>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount: optimistically load cached profile, then confirm with server via cookie
  useEffect(() => {
    const stored = auth.getStoredUser()
    if (stored) setUser(stored) // pre-fill so UI renders immediately

    auth.me()
      .then((fresh) => setUser(fresh))
      .catch((err) => {
        // 401 means the cookie is missing or expired — log out
        if (err instanceof ApiError && err.status === 401) {
          setUser(null)
        }
        // Network error — keep cached profile so app works offline
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const { user } = await auth.login(email, password)
    setUser(user)
    return user
  }, [])

  const signup = useCallback(
    async (data: { email: string; password: string; fullName: string; companyName: string }): Promise<AuthUser> => {
      const { user } = await auth.signup(data)
      setUser(user)
      return user
    },
    [],
  )

  const logout = useCallback(async () => {
    await auth.logout()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const fresh = await auth.me()
    setUser(fresh)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
