// src/pages/Dashboard.jsx
import React, { useContext } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import API from '../api/api.js'
import AuthContext from '../contexts/AuthContext.jsx'
import { toast } from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  // Only fetch once per 5 minutes, and never on window focus
  const { data: assignments, error, isLoading } = useQuery(
    ['myAssignments', user?._id],
    () => {
      console.log('[Dashboard] fetching assignments for', user._id)
      return API.get('/assignments/me').then(r => r.data.data)
    },
    {
      enabled: !!user,                       // wait for user context
      staleTime: 5 * 60 * 1000,             // 5 minutes
      refetchOnWindowFocus: false,          // no auto-refetch on focus
      retry: false,                         // don’t retry automatically
      onError: err => {
        console.error('[Dashboard] error:', err)
        toast.error('Failed to load assignments')
      }
    }
  )

  if (!user) {
    return <p className="p-6 text-center">Please log in to see your dashboard.</p>
  }

  if (isLoading) {
    return <p className="p-6 text-center">Loading assignments…</p>
  }

  if (error) {
    return <p className="p-6 text-center text-red-600">Error loading assignments.</p>
  }

  console.log('[Dashboard] assignments data:', assignments)

  // Group by status
  const upcoming = assignments.filter(a => a.studentStatus === 'upcoming')
  const pending  = assignments.filter(a => a.studentStatus === 'pending')
  const review   = assignments.filter(a => a.studentStatus === 'pendingReview')
  const done     = assignments.filter(a => a.studentStatus === 'completed')

  const renderSection = (title, list) => (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {list.length === 0
        ? <p className="text-gray-500">No {title.toLowerCase()}.</p>
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map(a => (
              <div key={a._id} className="border rounded p-4 shadow-sm">
                <h3 className="font-medium">{a.title}</h3>
                <p className="text-sm text-gray-600">
                  {a.questionsCount} questions
                </p>
                {title === 'Pending' && (
                  <p className="text-sm text-blue-600">
                    Attempted: {a.mySubmission?.answers.length ?? 0} / {a.questionsCount}
                  </p>
                )}
                <button
                  onClick={() => {
                    if (title === 'Pending') {
                      navigate(`/assignments/${a._id}/submit`)
                    } else if (title === 'Completed') {
                      navigate(`/assignments/${a._id}`)
                    }
                    // Upcoming stays locked
                  }}
                  className={`
                    mt-2 w-full py-2 rounded text-white
                    ${title === 'Upcoming'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : title === 'Pending'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-green-600 hover:bg-green-700'}
                  `}
                  disabled={title === 'Upcoming'}
                >
                  {title === 'Pending'
                    ? 'Resume'
                    : title === 'Completed'
                      ? 'View Answers'
                      : 'Locked'}
                </button>
              </div>
            ))}
          </div>
        )
      }
    </section>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {renderSection('Upcoming', upcoming)}
      {renderSection('Pending', pending)}
      {renderSection('Pending Review', review)}
      {renderSection('Completed', done)}
    </div>
  )
}
