// src/components/Layout.jsx
import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthContext from '../contexts/AuthContext.jsx'
import { LogOut, Menu } from 'lucide-react'

export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Tech Society
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex space-x-6">
            {/* everyone */}
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>

            {/* only mentors & admins */}
            {user?.role !== 'student' && (
              <>
                <Link to="/questions" className="text-gray-700 hover:text-blue-600">
                  Questions
                </Link>
                <Link to="/assignments" className="text-gray-700 hover:text-blue-600">
                  Assignments
                </Link>
              </>
            )}
          </nav>

          {/* User & mobile menu */}
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline text-gray-700">
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-red-600"
              title="Log out"
            >
              <LogOut size={20} />
            </button>
            <button
              className="md:hidden text-gray-700"
              onClick={() => setMenuOpen(o => !o)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden bg-white border-t">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </Link>

            {user?.role !== 'student' && (
              <>
                <Link
                  to="/questions"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Questions
                </Link>
                <Link
                  to="/assignments"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Assignments
                </Link>
              </>
            )}

            <button
              onClick={() => { handleLogout(); setMenuOpen(false) }}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Log out
            </button>
          </nav>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 p-4">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t text-center py-3 text-sm text-gray-500">
        © {new Date().getFullYear()} Tech Society
      </footer>
    </div>
  )
}
