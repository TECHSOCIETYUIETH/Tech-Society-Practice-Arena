import React, { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as authApi from '../api/auth.js'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loginLoading, setLoginLoading] = useState(false)
  const navigate = useNavigate()

  // On mount, try to restore session
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authApi.fetchMe(token)
        .then(u => setUser(u))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    if (loginLoading) return
    setLoginLoading(true)
    try {
      const { user: u, token } = await authApi.login(email, password)
      localStorage.setItem('token', token)
      setUser(u)
      navigate('/')
    } finally {
      setLoginLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading user…</p>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loginLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
