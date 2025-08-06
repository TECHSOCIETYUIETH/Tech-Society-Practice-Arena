// src/pages/MentorDashboard.jsx
import React, { useContext, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import API from '../api/api.js'
import { AuthContext } from '../contexts/AuthContext.jsx'
import { formatDistanceToNowStrict, format } from 'date-fns'

export default function MentorDashboard() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  const { data: items = [], isLoading } = useQuery(
    'allAssignments',
    () => API.get('/assignments').then(r => r.data.data),
    { staleTime: 300000, refetchOnWindowFocus: true }
  )

  const dispatchMut = useMutation(
    ({ id, action }) => API.put(`/assignments/${id}/${action}`),
    { onSuccess: () => qc.invalidateQueries('allAssignments') }
  )

  if (isLoading) return <p className="p-6 text-center">Loading…</p>
  if (user?.role !== 'mentor') return <p className="p-6 text-center text-red-600">Forbidden</p>

  const drafts     = items.filter(a => !a.isDispatched)
  const dispatched = items.filter(a => a.isDispatched)
  const byMode = mode => dispatched.filter(a => a.mode === mode)

  const renderCard = a => {
    const badge   = (a.mode || 'assignment').toUpperCase()
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
        {/* Mode badge, title, metadata… */}

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
          {/* ←── HERE: add a Preview button on every card */}
          <button
            onClick={() => navigate(`/assignments/${a._id}`)}
            className="flex-1 bg-blue-600 text-white py-1 rounded hover:bg-blue-700"
          >
            Preview
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-12 max-w-5xl mx-auto">
      <section>
        <h2 className="text-2xl font-bold mb-4">Drafts</h2>
        {drafts.length === 0
          ? <p className="text-gray-500">No drafts.</p>
          : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {drafts.map(renderCard)}
            </div>
        }
      </section>
      {['assignment','quiz','test'].map(mode => (
        <section key={mode}>
          <h2 className="text-2xl font-bold mb-4">
            Dispatched {mode.charAt(0).toUpperCase() + mode.slice(1)}s
          </h2>
          {byMode(mode).length === 0
            ? <p className="text-gray-500">None yet.</p>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {byMode(mode).map(renderCard)}
              </div>
          }
        </section>
      ))}
    </div>
  )
}
