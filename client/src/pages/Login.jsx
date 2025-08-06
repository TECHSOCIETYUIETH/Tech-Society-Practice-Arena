import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { AuthContext } from '../contexts/AuthContext.jsx'

export default function Login() {
  const { login, loginLoading } = useContext(AuthContext)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await login(email, password)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-5">

          <label className="block">
            <span className="text-gray-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            />
          </label>

          <label className="block relative">
            <span className="text-gray-700">Password</span>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute top-9 right-3 text-gray-500"
            >
              {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </label>

          <div className="flex justify-between items-center">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className={`w-full py-2 rounded-lg text-white font-medium ${
              loginLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loginLoading ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-gray-600">
          Don’t have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
