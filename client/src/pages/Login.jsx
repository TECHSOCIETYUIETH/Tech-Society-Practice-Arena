// src/pages/Login.jsx
import React, { useState, useContext } from 'react'
import AuthContext from '../contexts/AuthContext.jsx'

export default function Login() {
  const { login } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [pw, setPw]       = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await login(email, pw)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  // Quick dev logins
  const quickLogin = async (role) => {
    let creds = {}
    if (role === 'admin') {
      creds = { email: 'alice.admin@example.com',   password: 'AdminPass123' }
    } else if (role === 'mentor') {
      creds = { email: 'mona.mentor@example.com',   password: 'MentorPass123' }
    } else {
      creds = { email: 'stu.dent@example.com',      password: 'StudentPass123' }
    }
    try {
      await login(creds.email, creds.password)
    } catch (err) {
      setError('Quick login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-md space-y-6">
        {/* Dev quick-login buttons */}
        {import.meta.env.DEV && (
          <div className="flex justify-between space-x-2">
            <button
              onClick={() => quickLogin('admin')}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded"
            >
              Login as Admin
            </button>
            <button
              onClick={() => quickLogin('mentor')}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded"
            >
              Mentor
            </button>
            <button
              onClick={() => quickLogin('student')}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
            >
              Student
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow space-y-4"
        >
          <h2 className="text-2xl font-semibold text-center">Login</h2>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <label className="block">
            <span className="text-gray-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1 block w-full border px-3 py-2 rounded"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Password</span>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              required
              className="mt-1 block w-full border px-3 py-2 rounded"
            />
          </label>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            Log In
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  )
}
