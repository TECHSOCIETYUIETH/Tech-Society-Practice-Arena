import React, { useContext, useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import API from '../api/api.js'
import AuthContext from '../contexts/AuthContext.jsx'
import { formatDistanceToNowStrict, format } from 'date-fns'

export default function Dashboard() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [now, setNow] = useState(new Date())

  // tick every second for countdowns
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  const { data: assignments = [] } = useQuery(
    ['myAssignments', user?._id],
    () => API.get('/assignments/me').then(r => r.data.data),
    { enabled: !!user }
  )

  // categorize
  const upcoming      = []
  const ongoing       = []
  const pendingReview = []
  const completed     = []

  assignments.forEach(a => {
    switch (a.studentStatus) {
      case 'upcoming':      upcoming.push(a); break
      case 'pending':       ongoing.push(a); break
      case 'pendingReview': pendingReview.push(a); break
      case 'completed':     completed.push(a); break
      default:              break
    }
  })

  const renderCard = a => {
    // badge label: ASSIGNMENT, QUIZ or TEST
    const modeBadge = (a.mode || 'assignment').toUpperCase()
    const start     = a.startDate ? new Date(a.startDate) : null
    const due       = a.dueDate   ? new Date(a.dueDate)   : null

    // countdown only for quiz/test
    let timeLeft = null
    if ((a.mode === 'quiz' || a.mode === 'test') && due) {
      timeLeft = formatDistanceToNowStrict(due, { unit: 'second' })
    }

    const attempted = a.mySubmission?.answers?.length ?? 0
    const totalQs   = a.questionsCount

    return (
      <div key={a._id} className="bg-white rounded-2xl shadow-md p-5 space-y-3 relative">
        {/* Badge */}
        <span className="absolute top-3 left-3 inline-block px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          {modeBadge}
        </span>

        <h3 className="mt-2 text-lg font-semibold text-gray-800">{a.title}</h3>

        {start && <p className="text-sm text-gray-500">Starts: {format(start, 'PP p')}</p>}
        {due   && <p className="text-sm text-gray-500">Due:    {format(due,   'PP p')}</p>}

        {timeLeft && a.studentStatus === 'pending' && (
          <p className="text-sm text-red-500 font-medium">⏳ {timeLeft} left</p>
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
            {a.studentStatus === 'pendingReview'
              ? 'Pending Review'
              : a.studentStatus.charAt(0).toUpperCase() + a.studentStatus.slice(1)}
          </span>
        </p>

        {a.studentStatus === 'completed' && (
          <p className="text-sm text-green-600">
            ✓ {a.mySubmission.grade} / {totalQs} correct<br/>
            ✗ {totalQs - a.mySubmission.grade} wrong
          </p>
        )}

        {a.studentStatus === 'pending' && (
          <p className="text-sm text-gray-700">
            Attempted: {attempted} / {totalQs} questions
          </p>
        )}

        <button
          onClick={() => {
            if (a.studentStatus === 'pending') navigate(`/assignments/${a._id}/submit`)
            else if (['completed','pendingReview'].includes(a.studentStatus))
              navigate(`/assignments/${a._id}`)
          }}
          disabled={a.studentStatus === 'upcoming'}
          className={
            `mt-4 w-full py-2 rounded-lg text-white font-medium
            ${a.studentStatus === 'upcoming'    ? 'bg-gray-400'                   : ''}
            ${a.studentStatus === 'pending'     ? 'bg-blue-600 hover:bg-blue-700' : ''}
            ${a.studentStatus === 'pendingReview'? 'bg-yellow-500 hover:bg-yellow-600': ''}
            ${a.studentStatus === 'completed'   ? 'bg-green-600 hover:bg-green-700': ''}`
          }
        >
          {a.studentStatus === 'pending'
            ? 'Resume'
            : a.studentStatus === 'completed'
              ? 'View Answers'
              : a.studentStatus === 'pendingReview'
                ? 'View Submission'
                : 'Locked'
          }
        </button>
      </div>
    )
  }

  const Section = ({ title, items }) => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      {items.length
        ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{items.map(renderCard)}</div>
        : <p className="text-gray-500 italic">No assignments here</p>
      }
    </div>
  )

  return (
    <div className="p-6 space-y-12">
      <Section title="Upcoming"      items={upcoming} />
      <Section title="Ongoing"       items={ongoing} />
      <Section title="Pending Review" items={pendingReview} />
      <Section title="Completed"     items={completed} />
    </div>
  )
}
