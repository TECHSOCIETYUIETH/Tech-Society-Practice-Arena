import React, { useContext, useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import API from '../api/api.js'
import {AuthContext} from '../contexts/AuthContext.jsx'
import { formatDistanceToNowStrict, format } from 'date-fns'

export default function StudentDashboard() {
  const { user } = useContext(AuthContext)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  const { data: items = [], isLoading } = useQuery(
    ['myAssignments', user?._id],
    () => API.get('/assignments/me').then(r => r.data.data),
    { enabled: !!user, staleTime: 300000, refetchOnWindowFocus: true }
  ) 

  if (isLoading) return <p className="p-6 text-center">Loading…</p>
  if (user?.role !== 'student') return <p className="p-6 text-center text-red-600">Forbidden</p>

  // group by status
  const sections = {
    Upcoming:       items.filter(a => a.studentStatus==='upcoming'),
    Ongoing:        items.filter(a => a.studentStatus==='pending'),
    'Pending Review': items.filter(a => a.studentStatus==='pendingReview'),
    Completed:      items.filter(a => a.studentStatus==='completed'),
  }

  const renderCard = a => {
    const badge   = (a.mode || 'assignment').toUpperCase()
    const start   = a.startDate && new Date(a.startDate)
    const due     = a.dueDate   && new Date(a.dueDate)
    const totalQs = a.questionsCount
    const doneCnt = a.mySubmission?.answers.length ?? 0
    const timeLeft = (['quiz','test'].includes(a.mode) && due)
      ? formatDistanceToNowStrict(due, { unit: 'second' })
      : null

    let label, to
    if (a.studentStatus === 'pending') {
      label = 'Resume'
      to = `/assignments/${a._id}/submit`
    } else if (a.studentStatus === 'pendingReview') {
      label = 'View Submission'
      to = `/assignments/${a._id}`
    } else if (a.studentStatus === 'completed') {
      label = 'View Answers'
      to = `/assignments/${a._id}`
    } else {
      label = 'Locked'
      to = null
    }

    return (
      <div key={a._id} className="bg-white rounded-xl shadow p-5 space-y-3 relative">
        <span className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full">
          {badge}
        </span>
        <h3 className="mt-2 text-lg font-semibold">{a.title}</h3>
        {start && <p className="text-sm text-gray-500">Starts: {format(start,'PPP p')}</p>}
        {due   && <p className="text-sm text-gray-500">Due:    {format(due,'PPP p')}</p>}
        {timeLeft && a.studentStatus==='pending' && (
          <p className="text-sm text-red-500">⏳ {timeLeft} left</p>
        )}
        <p className="text-sm">
          Visibility:{' '}
          <span className={a.visibleToAll ? 'text-blue-600' : 'text-purple-600'}>
            {a.visibleToAll ? 'Public' : 'Restricted'}
          </span>
        </p>
        <p className="text-sm">
          Status:{' '}
          <span className="font-medium">
            {a.studentStatus==='pendingReview'
              ? 'Pending Review'
              : a.studentStatus.charAt(0).toUpperCase() + a.studentStatus.slice(1)
            }
          </span>
        </p>
        {a.studentStatus==='completed' && (
          <p className="text-sm text-green-600">
            ✓ {a.mySubmission.grade} / {totalQs} correct<br/>
            ✗ {totalQs - a.mySubmission.grade} wrong
          </p>
        )}
        {a.studentStatus==='pending' && (
          <p className="text-sm text-gray-700">
            Attempted: {doneCnt} / {totalQs}
          </p>
        )}

        {to ? (
          <Link
            to={to}
            className={`
              mt-4 block text-center w-full py-2 rounded-lg text-white font-medium
              ${a.studentStatus==='pending'       ? 'bg-blue-600 hover:bg-blue-700' : ''}
              ${a.studentStatus==='pendingReview' ? 'bg-yellow-500 hover:bg-yellow-600': ''}
              ${a.studentStatus==='completed'     ? 'bg-green-600 hover:bg-green-700' : ''}
            `}
          >
            {label}
          </Link>
        ) : (
          <button
            disabled
            className="mt-4 w-full py-2 rounded-lg bg-gray-400 text-white text-center"
          >
            {label}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="p-6 space-y-12 max-w-5xl mx-auto">
      {Object.entries(sections).map(([title, list]) => (
        <section key={title}>
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          {list.length === 0
            ? <p className="text-gray-500 italic">No {title.toLowerCase()}.</p>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {list.map(renderCard)}
              </div>
          }
        </section>
      ))}
    </div>
  )
}
