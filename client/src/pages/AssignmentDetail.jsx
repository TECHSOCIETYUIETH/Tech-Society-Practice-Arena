// src/pages/AssignmentDetail.jsx
import React, { useEffect, useState, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import API from '../api/api.js'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import {AuthContext} from '../contexts/AuthContext.jsx'
import { ArrowLeft } from 'lucide-react'

export default function AssignmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [assignment, setAssignment] = useState(null)

  useEffect(() => {
    API.get(`/assignments/${id}`)
      .then(r => setAssignment(r.data.data))
      .catch(() => toast.error('Failed to load assignment'))
  }, [id])

  if (!assignment) return <p className="p-6">Loading…</p>

  const {
    title, description,
    questions,
    visibleToAll, visibleTo,
    startDate, dueDate,
    status, isDispatched, dispatchDate, mode,
    createdBy,
    submissions,
    createdAt, updatedAt
  } = assignment

  const fmt = dt => dt ? format(new Date(dt), 'PPP p') : '—'

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:underline"
      >
        <ArrowLeft size={16} className="mr-1"/> Back
      </button>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="text-gray-700">{description}</p>}
        <div className="text-sm text-gray-500 flex flex-wrap gap-2">
          <span>Type: <strong>{mode?.toUpperCase()}</strong></span>
          <span>Status: <strong>{status}</strong></span>
          <span>Dispatch: <strong>{isDispatched ? fmt(dispatchDate) : 'Not yet'}</strong></span>
          <span>Visible: <strong>{visibleToAll ? 'Public' : 'Restricted'}</strong></span>
          {!visibleToAll && visibleTo.length > 0 && (
            <span>To: {visibleTo.map(u => u.name).join(', ')}</span>
          )}
          <span>By: {createdBy.name} ({createdBy.email})</span>
          <span>Created: {fmt(createdAt)}</span>
          <span>Updated: {fmt(updatedAt)}</span>
          <span>Starts: {fmt(startDate)}</span>
          <span>Due: {fmt(dueDate)}</span>
        </div>
      </header>

      <section className="space-y-8">
        {questions.map((q, i) => (
          <article key={q._id} className="border rounded-lg p-4 space-y-4">
            <h2 className="font-semibold text-lg">
              Q{i+1}. <span dangerouslySetInnerHTML={{ __html: q.content }} />
            </h2>

            {/* Options */}
            {['mcq','msq'].includes(q.type) && (
              <ul className="list-disc pl-5 space-y-1">
                {q.options.map(opt => (
                  <li key={opt.id}
                      className={q.correctAnswers.includes(opt.id)
                        ? 'font-bold text-green-600'
                        : ''}
                  >
                    {opt.id}. {opt.text}
                  </li>
                ))}
              </ul>
            )}

            {/* Test Cases */}
            {q.testCases.length > 0 && (
              <div>
                <h3 className="font-medium">Test Cases</h3>
                <table className="w-full mt-2 border">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 border">Input</th>
                      <th className="px-2 py-1 border">Expected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {q.testCases.map((tc, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-1 border font-mono">{tc.input}</td>
                        <td className="px-2 py-1 border font-mono">{tc.expected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Explanation */}
            {q.explanation && (
              <div>
                <h3 className="font-medium">Explanation</h3>
                <div className="prose mt-1"
                     dangerouslySetInnerHTML={{ __html: q.explanation }} />
              </div>
            )}
          </article>
        ))}
      </section>

      {/* If the student already submitted, show their submission & grading */}
      {submissions.length > 0 && user?.role === 'student' && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Your Submission</h2>
          {submissions.map(sub => (
            <div key={sub._id} className="bg-gray-50 p-4 rounded">
              <p>Submitted: {fmt(sub.submittedAt)}</p>
              <p>Grade: {sub.grade != null ? sub.grade : 'Pending'}</p>
              {sub.feedback && (
                <div>
                  <h3 className="font-medium">Mentor Feedback</h3>
                  <p>{sub.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
