import React, { useState, useEffect, useCallback, createContext, useContext } from 'react'
import * as api from '../lib/api'

const TOKEN_KEY = 'auth_token'
const EXPIRY_KEY = 'token_expiry'
const REFRESH_INTERVAL = 50 * 60 * 1000

// Tạo AuthContext
export const AuthContext = createContext<any | undefined>(undefined)

export function useProvideAuth() {
  const [user, setUser] = useState<any | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      const saved = localStorage.getItem(TOKEN_KEY)
      const expiry = localStorage.getItem(EXPIRY_KEY)
      
      if (saved && expiry && new Date().getTime() < new Date(expiry).getTime()) {
        setToken(saved)
        await fetchUser(saved)
      } else {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(EXPIRY_KEY)
      }
      setIsLoading(false)
    }
    
    initializeAuth()
  }, [])

  useEffect(() => {
    let id: any
    if (token) {
      id = setInterval(() => {
        handleRefresh()
      }, REFRESH_INTERVAL)
    }
    return () => clearInterval(id)
  }, [token])

  const fetchUser = useCallback(async (t: string) => {
    try {
      const res = await api.getCurrentUser(t)
      setUser(res.user)
    } catch (err) {
      console.error(err)
      handleLogout()
    }
  }, [])

  const handleLogin = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await api.login({ email, password })
      setToken(res.token)
      setUser(res.user)
      localStorage.setItem(TOKEN_KEY, res.token)
      localStorage.setItem(EXPIRY_KEY, res.expiresAt)
      return res.user
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      if (token) await api.logout(token)
    } catch (err) {
      console.error(err)
    } finally {
      setToken(null)
      setUser(null)
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(EXPIRY_KEY)
    }
  }, [token])

  const handleRefresh = useCallback(async () => {
    if (!token) return
    try {
      const res = await api.refreshToken(token)
      setToken(res.token)
      localStorage.setItem(TOKEN_KEY, res.token)
      localStorage.setItem(EXPIRY_KEY, res.expiresAt)
    } catch (err) {
      console.error(err)
      handleLogout()
    }
  }, [token])

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    login: handleLogin,
    logout: handleLogout,
    refresh: handleRefresh,
  }
}

// Hook để sử dụng AuthContext
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default useProvideAuth