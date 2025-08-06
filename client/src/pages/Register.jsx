import { useState } from 'react'
import { register } from '../api/auth.js'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, User, Mail, Lock, ArrowRight } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    branch: '',
    year: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  // Validation helpers
  const isValidEmail = email => /^\S+@\S+\.\S+$/.test(email)
  const isValidPassword = pw => pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)

  const handleSubmit = async e => {
    e.preventDefault()
    const { name, email, password } = form
    if (!name.trim()) return toast.error('Name is required')
    if (!isValidEmail(email)) return toast.error('Enter a valid email')
    if (!isValidPassword(password))
      return toast.error('Password must be 8+ chars, include uppercase & number')

    setIsSubmitting(true)
    try {
      await register(form.name, form.email, form.password, form.branch, form.year)
      toast.success('Check your email to verify!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onChange = (field, value) =>
    setForm(f => ({ ...f, [field]: value }))

  return (
    <div className="max-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex max-w-3xl w-full" style={{ maxHeight: '90vh' }}>
        {/* Left Side - Simple Welcome */}
        <div className="hidden md:flex w-1/3 bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center p-6">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-2">Welcome!</h2>
            <p className="text-sm">Join TechSociety to start learning.</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-2/3 p-6 overflow-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Create Account</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={e => onChange('name', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={e => onChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={e => onChange('password', e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {/* Branch */}
            <input
              type="text"
              placeholder="Branch"
              value={form.branch}
              onChange={e => onChange('branch', e.target.value)}
              className="w-full pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {/* Year */}
            <input
              type="text"
              placeholder="Year"
              value={form.year}
              onChange={e => onChange('year', e.target.value)}
              className="w-full pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
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
                  <span>Create Account</span>
                  <ArrowRight />
                </>
              )}
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
