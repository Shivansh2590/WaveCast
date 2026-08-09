import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me')
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Only attempt to restore a session if we have a cached token,
    // otherwise skip straight to "logged out" without a failing request.
    if (localStorage.getItem('wavecast_token')) {
      fetchMe()
    } else {
      setLoading(false)
    }
  }, [fetchMe])

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    localStorage.setItem('wavecast_token', data.token)
    setUser(data.user)
    return data.user
  }

  const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload)
    localStorage.setItem('wavecast_token', data.token)
    setUser(data.user)
    return data.user
  }

  const registerCreator = async (payload) => {
    const { data } = await api.post('/auth/creator/register', payload)
    localStorage.setItem('wavecast_token', data.token)
    setUser(data.user)
    return data.user
  }

  const loginCreator = async (payload) => {
    const { data } = await api.post('/auth/creator/login', payload)
    localStorage.setItem('wavecast_token', data.token)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore network errors on logout, clear local state regardless
    }
    localStorage.removeItem('wavecast_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        registerCreator,
        loginCreator,
        logout,
        refresh: fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
