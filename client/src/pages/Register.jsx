// src/pages/Register.jsx
import { useState } from 'react'
import { register } from '../api/auth.js'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    branch: '',
    year: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handle = async e => {
    e.preventDefault()
    try {
      await register(
        form.name,
        form.email,
        form.password,
        form.branch,
        form.year
      )
      toast.success('Check your email to verify!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    }
  }

  const onChange = (field, value) =>
    setForm(f => ({ ...f, [field]: value }))

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Create Your Account
        </h2>

        <form onSubmit={handle} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              placeholder="Your full name"
              value={form.name}
              onChange={e => onChange('name', e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={e => onChange('email', e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter a secure password"
              value={form.password}
              onChange={e => onChange('password', e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Branch</label>
            <input
              type="text"
              required
              placeholder="Your branch"
              value={form.branch}
              onChange={e => onChange('branch', e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Year</label>
            <input
              type="text"
              required
              placeholder="e.g. Third Year"
              value={form.year}
              onChange={e => onChange('year', e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
          >
            Register
          </button>
        </form>

        <p className="text-center text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  )
}
