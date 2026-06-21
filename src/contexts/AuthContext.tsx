import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { auth, type AuthUser } from '../lib/api'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: { email: string; password: string; fullName: string; companyName: string }) => Promise<void>
  logout: () => void
  isEmployer: boolean
  isEmployee: boolean
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount: restore from localStorage, verify with server
  useEffect(() => {
    const stored = auth.getStoredUser()
    if (stored && auth.getToken()) {
      setUser(stored)
      // Silently verify token is still valid
      auth.me()
        .then(setUser)
        .catch(() => {
          // Token expired or invalid — clear session
          auth.logout()
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await auth.login(email, password)
    setUser(res.user)
  }, [])

  const signup = useCallback(async (data: {
    email: string
    password: string
    fullName: string
    companyName: string
  }) => {
    const res = await auth.signup(data)
    setUser(res.user)
  }, [])

  const logout = useCallback(() => {
    auth.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      isEmployer: user?.role === 'employer',
      isEmployee: user?.role === 'employee',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
