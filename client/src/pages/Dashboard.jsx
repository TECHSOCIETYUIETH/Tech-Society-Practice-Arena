// src/pages/Dashboard.jsx
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import AuthContext from '../contexts/AuthContext.jsx'

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Tech Society Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Hello, {user?.name}</span>
            <button
              onClick={logout}
              className="text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
        <nav className="mb-6 space-x-4">
          <Link
            to="/questions"
            className="text-blue-600 hover:underline"
          >
            Questions
          </Link>
          <Link
            to="/assignments"
            className="text-blue-600 hover:underline"
          >
            Assignments
          </Link>
        </nav>
        <p className="text-gray-600">
          Select a section above to manage questions or view assignments.
        </p>
      </main>
    </div>
)
}
