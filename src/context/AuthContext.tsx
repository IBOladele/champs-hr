import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { auth, ApiError, type AuthUser } from '../lib/api'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  signup: (data: { email: string; password: string; fullName: string; companyName: string }) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount: if we have a valid token, validate it with the server
  useEffect(() => {
    const stored = auth.getStoredUser()
    const token = auth.getToken()

    if (!token) {
      // No valid token — clear any stale user cache and stop loading
      setUser(null)
      setIsLoading(false)
      return
    }

    // Token exists and hasn't expired client-side — verify with server
    if (stored) setUser(stored) // Optimistic pre-fill so the page loads fast

    auth.me()
      .then((fresh) => setUser(fresh))
      .catch((err) => {
        // 401 = token rejected by server; clear everything
        if (err instanceof ApiError && err.status === 401) {
          auth.logout()
          setUser(null)
        }
        // Any other error (network down) — keep the stored user so app still works offline
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const res = await auth.login(email, password)
    setUser(res.user)
    return res.user
  }, [])

  const signup = useCallback(
    async (data: { email: string; password: string; fullName: string; companyName: string }): Promise<AuthUser> => {
      const res = await auth.signup(data)
      setUser(res.user)
      return res.user
    },
    [],
  )

  const logout = useCallback(() => {
    auth.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
