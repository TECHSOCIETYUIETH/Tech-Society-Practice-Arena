import React, { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as authApi from '../api/auth.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  // on mount, try fetch /auth/me
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authApi.fetchMe(token)
        .then(u => setUser(u))
        .catch(() => { localStorage.removeItem('token') })
    }
  }, [])

  const login = async (email, password) => {
    const { user, token } = await authApi.login(email, password)
    localStorage.setItem('token', token)
    setUser(user)
    navigate('/')
  }

  const register = async (name,email,password,role) => {
    const { user, token } = await authApi.register(name,email,password,role)
    localStorage.setItem('token', token)
    setUser(user)
    navigate('/')
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
