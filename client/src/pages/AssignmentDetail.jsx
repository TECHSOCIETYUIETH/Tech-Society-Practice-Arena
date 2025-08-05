import React, { useEffect, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import API from '../api/api.js'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import AuthContext from '../contexts/AuthContext.jsx'
import { ArrowLeft } from 'lucide-react'

export default function AssignmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  // Load assignment
  const { data: assignment, isLoading: aLoading } = useQuery(
    ['assignment', id],
    () => API.get(`/assignments/${id}`).then(r => r.data.data),
    { onError: () => toast.error('Failed to load') }
  )

  // Load submission
  const { data: submission } = useQuery(
    ['submission', id],
    () => API.get(`/assignments/${id}/submission`)
             .then(r => r.data.data),
    { enabled: user.role === 'student', retry: false }
  )
    console.log('📝 AssignmentDetail render', {
    assignment,
    submission
  })

  if (aLoading) return <p className="p-6 text-center">Loading…</p>
  if (!assignment) return <p className="p-6 text-center text-red-600">Not Found</p>

  const isStudent = user.role === 'student'
  const isDraft   = isStudent && submission && !submission.isFinal
  const isFinal   = isStudent && submission && submission.isFinal
  

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:underline"
      >
        <ArrowLeft size={16} className="mr-1" /> Back
      </button>

      <h1 className="text-2xl font-semibold">{assignment.title}</h1>
      {assignment.description && (
        <p className="text-gray-700">{assignment.description}</p>
      )}
      <div className="text-sm text-gray-500 flex flex-wrap gap-4">
        <span>
          {assignment.mode === 'assignment'
            ? `Due: ${assignment.dueDate ? format(new Date(assignment.dueDate), 'PPP p') : '—'}`
            : `Time Limit: ${assignment.timeLimitMinutes} min`}
        </span>
        <span>
          Visibility:{' '}
          <span className={assignment.visibleToAll ? 'text-blue-600' : 'text-purple-600'}>
            {assignment.visibleToAll ? 'Public' : 'Restricted'}
          </span>
        </span>
        <span>Questions: {assignment.questions.length}</span>
      </div>

      {/* Resume draft */}
      {isDraft && (
        <div className="text-center">
          <Link
            to={`/assignments/${id}/submit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Resume Assignment
          </Link>
        </div>
      )}

      {/* Show solutions on final submit */}
      {isFinal && (
        <div className="space-y-8">
          <h2 className="text-xl font-semibold">Your Results</h2>
          <p className="text-lg">
            Correct:{' '}
            <span className="text-green-600 font-bold">{submission.grade}</span> /{' '}
            {assignment.questions.length}
          </p>
          {assignment.questions.map(q => {
            const ans = submission.answers.find(a => a.question === q._id)
            const resp = ans?.response
            const correctSet = new Set(q.correctAnswers)
            const yourSet    = Array.isArray(resp) ? new Set(resp) : new Set([resp])

            return (
              <div key={q._id} className="p-4 border rounded">
                <div
                  className="prose mb-2"
                  dangerouslySetInnerHTML={{ __html: q.content }}
                />

                {(q.type === 'mcq' || q.type === 'msq') && (
                  <ul className="list-disc pl-5 space-y-1">
                    {q.options.map(o => {
                      const isYour    = yourSet.has(o.id)
                      const isCorrect = correctSet.has(o.id)
                      return (
                        <li
                          key={o.id}
                          className={`
                            ${isCorrect ? 'text-green-700 font-semibold' : ''}
                            ${isYour && !isCorrect ? 'line-through text-red-600' : ''}
                          `}
                        >
                          {o.id}. {o.text}
                          {isCorrect && ' ✓'}
                          {isYour && !isCorrect && ' ✗'}
                        </li>
                      )
                    })}
                  </ul>
                )}

                {q.type === 'descriptive' && (
                  <div className="mt-2">
                    <p className="italic">Your answer:</p>
                    <pre className="bg-gray-100 p-2 rounded">{resp}</pre>
                  </div>
                )}

                <div className="mt-4">
                  <h4 className="font-medium">Explanation</h4>
                  <div
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: q.explanation }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
