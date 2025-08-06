// src/pages/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api/api.js'
import {AuthContext} from '../contexts/AuthContext.jsx'
import { formatDistanceToNowStrict, format } from 'date-fns'

export default function Dashboard() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [now, setNow] = useState(new Date())

  // live clock for countdowns
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  // ─── MENTOR/ADMIN ───────────────────────────────────────────────────────────
  if (user?.role === 'mentor' || user?.role === 'admin') {
    const { data: items = [], isLoading } = useQuery(
      'allAssignments',
      () => API.get('/assignments').then(r => r.data.data),
      { staleTime: 300000, refetchOnWindowFocus: true, retry: true } 
    )
    const dispatchMut = useMutation(
      ({ id, action }) => API.put(`/assignments/${id}/${action}`),
      { onSuccess: () => qc.invalidateQueries('allAssignments') }
    )

    const drafts     = items.filter(a => !a.isDispatched)
    const dispatched = items.filter(a => a.isDispatched)

    // subgroup by mode
    const dispAssign = dispatched.filter(a => a.mode === 'assignment')
    const dispQuiz   = dispatched.filter(a => a.mode === 'quiz')
    const dispTest   = dispatched.filter(a => a.mode === 'test')

    const renderMentorCard = a => {
      const badge = (a.mode || 'assignment').toUpperCase()
      const created = new Date(a.createdAt)
      const dueDate = a.dueDate && new Date(a.dueDate)
      const timeLeft = (['quiz','test'].includes(a.mode) && dueDate)
        ? formatDistanceToNowStrict(dueDate, { unit: 'second' })
        : null

      return (
        <div key={a._id} className="bg-white rounded-xl shadow p-4 space-y-2 relative">
          <span className="absolute top-3 left-3 px-2 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full">
            {badge}
          </span>

          <h3 className="font-semibold">{a.title}</h3>
          <p className="text-xs text-gray-500">
            By {a.createdBy.name} • {format(created, 'PPP p')}
          </p>
          <p className="text-sm text-gray-700">Questions: {a.questions.length}</p>
          <p className="text-sm">
            Visibility:{' '}
            <span className={a.visibleToAll ? 'text-blue-600' : 'text-purple-600'}>
              {a.visibleToAll ? 'Public' : 'Restricted'}
            </span>
          </p>
          {timeLeft && (
            <p className="text-sm text-red-500 font-medium">
              ⏳ {timeLeft} left
            </p>
          )}

          <div className="flex space-x-2">
            {!a.isDispatched ? (
              <button
                onClick={() => dispatchMut.mutate({ id: a._id, action: 'dispatch' })}
                disabled={dispatchMut.isLoading}
                className="flex-1 bg-green-600 text-white py-1 rounded hover:bg-green-700"
              >
                {dispatchMut.isLoading ? 'Dispatching…' : 'Dispatch'}
              </button>
            ) : (
              <button
                onClick={() => dispatchMut.mutate({ id: a._id, action: 'undispatch' })}
                disabled={dispatchMut.isLoading}
                className="flex-1 bg-red-600 text-white py-1 rounded hover:bg-red-700"
              >
                {dispatchMut.isLoading ? 'Updating…' : 'Pull Back'}
              </button>
            )}
            <button
              onClick={() => navigate(`/assignments/${a._id}`)}
              className="flex-1 bg-blue-600 text-white py-1 rounded hover:bg-blue-700"
            >
              View Detail
            </button>
          </div>
        </div>
      )
    }

    if (isLoading) return <p className="p-6 text-center">Loading…</p>

    return (
      <div className="p-6 space-y-12 max-w-5xl mx-auto">
        {/* Drafts */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Drafts</h2>
          {drafts.length === 0
            ? <p className="text-gray-500">No drafts.</p>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {drafts.map(renderMentorCard)}
              </div>
          }
        </section>

        {/* Dispatched Assignments */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Dispatched Assignments</h2>
          {dispAssign.length === 0
            ? <p className="text-gray-500">None yet.</p>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dispAssign.map(renderMentorCard)}
              </div>
          }
        </section>

        {/* Dispatched Quizzes */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Dispatched Quizzes</h2>
          {dispQuiz.length === 0
            ? <p className="text-gray-500">None yet.</p>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dispQuiz.map(renderMentorCard)}
              </div>
          }
        </section>

        {/* Dispatched Tests */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Dispatched Tests</h2>
          {dispTest.length === 0
            ? <p className="text-gray-500">None yet.</p>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dispTest.map(renderMentorCard)}
              </div>
          }
        </section>
      </div>
    )
  }

  // ─── STUDENT ────────────────────────────────────────────────────────────────
  if (user?.role === 'student') {
    const { data: myItems = [], isLoading: loadingMy } = useQuery(
      'myAssignments',
      () => API.get('/assignments/me').then(r => r.data.data),
      { staleTime: 300000, refetchOnWindowFocus: true, retry: true }
    )

    if (loadingMy) return <p className="p-6 text-center">Loading…</p>

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Your Assignments</h2>
        {myItems.length === 0 ? (
          <p className="text-gray-500">You have no assignments.</p>
        ) : (
          <div className="space-y-4">
            {myItems.map(item => (
              <Link
                key={item._id}
                to={`/assignments/${item._id}`}
                className="block bg-white rounded-xl shadow p-4 hover:shadow-md transition"
              >
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-xs text-gray-500">
                  Due: {item.dueDate ? format(new Date(item.dueDate), 'PPP p') : 'N/A'}
                </p>
                <p className="text-sm">Status: {item.status}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return <p className="p-6 text-center">Unauthorized</p>
}
