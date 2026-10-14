// src/features/auth/AuthProvider.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'

import {
  bootstrap as apiBootstrap,
  getMe,
  getSetupStatus,
  login as apiLogin,
  logout as apiLogout,
} from '../../services/endpoints'
import {
  ensureCsrfCookie,
  refreshAccessToken,
  setAccessToken,
  setAuthLostHandler,
} from '../../services/http'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready'
  const [setupComplete, setSetupComplete] = useState(null)
  const queryClient = useQueryClient()
  const didInit = useRef(false)

  const clearSession = useCallback(() => {
    setAccessToken(null)
    setUser(null)
  }, [])

  const restore = useCallback(async () => {
    setStatus('loading')
    try {
      await ensureCsrfCookie().catch(() => {})
      await refreshAccessToken().catch(() => {})
      const me = await getMe()
      setUser(me.user)
    } catch {
      clearSession()
    } finally {
      setStatus('ready')
    }
  }, [clearSession])

  useEffect(() => {
    setAuthLostHandler(() => {
      clearSession()
      queryClient.clear()
    })
  }, [clearSession, queryClient])

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    getSetupStatus()
      .then((data) => setSetupComplete(data.setup_complete))
      .catch(() => setSetupComplete(null))
    restore()
  }, [restore])

  const login = useCallback(
    async (username, password) => {
      const data = await apiLogin({ username, password })
      setUser(data.user)
      queryClient.invalidateQueries()
      return data.user
    },
    [queryClient],
  )

  const bootstrapAdmin = useCallback(
    async (payload) => {
      const data = await apiBootstrap(payload)
      setUser(data.user)
      setSetupComplete(true)
      queryClient.invalidateQueries()
      return data.user
    },
    [queryClient],
  )

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // ignore logout errors
    }
    clearSession()
    queryClient.clear()
  }, [clearSession, queryClient])

  const value = {
    user,
    status,
    setupComplete,
    isAuthenticated: !!user,
    login,
    bootstrapAdmin,
    logout,
    refreshSession: restore,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
