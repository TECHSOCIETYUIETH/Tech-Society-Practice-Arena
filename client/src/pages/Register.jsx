// src/pages/Register.jsx
import { useState } from 'react'
import { register } from '../api/auth.js'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Lock, 
  BookOpen, 
  Calendar, 
  Sparkles,
  Code,
  Users,
  Trophy,
  Zap,
  ArrowRight,
  CheckCircle,
  Target,
  Award,
  Lightbulb
} from 'lucide-react'

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

  const handle = async e => {
    e.preventDefault()
    setIsSubmitting(true)
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const onChange = (field, value) =>
    setForm(f => ({ ...f, [field]: value }))

  const inputFields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your name', icon: User },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', icon: Mail },
    { key: 'branch', label: 'Branch', type: 'text', placeholder: 'Computer Science', icon: BookOpen },
    { key: 'year', label: 'Year', type: 'text', placeholder: 'Third Year', icon: Calendar }
  ]

  const benefits = [
    "Interactive coding challenges and projects",
    "1-on-1 mentorship from industry experts", 
    "Collaborative learning with peer groups",
    "Industry-recognized skill certificates",
    "Access to exclusive tech workshops",
    "Career guidance and placement support",
    "Open source project contributions",
    "Technical interview preparation"
  ]

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Left Side - Platform Information */}
      <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-32 left-16 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white rounded-full"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-white max-w-2xl">
          {/* Brand Header */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">TechSociety</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl font-bold mb-3">Create Account</h1>
            <p className="text-xl text-white/90 mb-8">Start your learning journey</p>
            
            {/* Platform Benefits */}
            <div className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                  <span className="text-white/90 leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">5,000+</div>
              <div className="text-white/70">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">200+</div>
              <div className="text-white/70">Expert Mentors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">98%</div>
              <div className="text-white/70">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form Only */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
          <div className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            <span className="text-lg font-bold">TechSociety</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            
            {/* Mobile Title */}
            <div className="lg:hidden text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
              <p className="text-gray-600 text-sm">Start your learning journey</p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handle} className="space-y-4">
              {/* Input Fields */}
              {inputFields.map(field => {
                const Icon = field.icon
                return (
                  <div key={field.key}>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={field.type}
                        required
                        placeholder={field.placeholder}
                        value={form[field.key]}
                        onChange={e => onChange(field.key, e.target.value)}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                      />
                    </div>
                  </div>
                )
              })}

              {/* Password Field */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Create password"
                  value={form.password}
                  onChange={e => onChange('password', e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                />
                <span className="text-xs text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-blue-600 hover:underline">Terms</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}