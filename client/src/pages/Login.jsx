import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { AuthContext } from '../contexts/AuthContext.jsx'

export default function Login() {
  const { login, loginLoading } = useContext(AuthContext)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)

  // Validation helpers
  const isValidEmail = email => /^\S+@\S+\.\S+$/.test(email)
  const isValidPassword = pw => pw.length >= 8

  const handleSubmit = async e => {
    e.preventDefault()
    if (!isValidEmail(email)) return toast.error('Enter a valid email')
    if (!isValidPassword(password)) return toast.error('Password must be >= 8 characters')

    try {
      await login(email, password)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="max-h-screen flex items-center  justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg flex  max-w-3xl w-full  overflow-hidden">
        {/* Left Panel */}
        <div className="hidden md:flex w-1/3 bg-gradient-to-br from-indigo-600 to-blue-600 items-center justify-center p-6">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="text-sm">Log in to continue your journey</p>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full md:w-2/3 p-6 flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Log In</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPw ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginLoading}
              className={`w-full flex justify-center items-center gap-2 py-2 rounded-lg text-white font-medium transition disabled:opacity-50 ${
                loginLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loginLoading ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          {/* Signup Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don’t have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
