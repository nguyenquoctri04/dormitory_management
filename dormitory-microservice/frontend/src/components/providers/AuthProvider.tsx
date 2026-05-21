import React from 'react'
import { useProvideAuth, AuthContext } from '../../hooks/useAuth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useProvideAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

// Re-export useAuth để các component khác có thể import
export { useAuth } from '../../hooks/useAuth'