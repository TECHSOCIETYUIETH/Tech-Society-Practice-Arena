import React, { useState } from 'react'
import { resetPassword } from '../api/auth.js'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Lock, ArrowRight } from 'lucide-react'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { token } = useParams()
  const navigate   = useNavigate()

  const isValidPassword = pw => pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!isValidPassword(password)) {
      return toast.error('Password must be 8+ chars, include uppercase & number')
    }

    setIsSubmitting(true)
    try {
      await resetPassword(token, password)
      toast.success('Password updated successfully')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* New Password Field */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" />
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-3 text-gray-400"
            >
              {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50`}
          >
            {isSubmitting ? (
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
              <>
                <span>Reset Password</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          <Link to="/login" className="text-blue-600 hover:underline">
            Back to Log In
          </Link>
        </p>
      </div>
    </div>
  )
}
