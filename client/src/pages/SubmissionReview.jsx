// src/pages/SubmissionReview.jsx
import React, { useState, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import API from '../api/api.js'
import { AuthContext } from '../contexts/AuthContext.jsx'

import { toast } from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

export default function SubmissionReview() {
  const { id: assignmentId, studentId } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user } = useContext(AuthContext)

  // 1) Fetch assignment + that student’s submission
  const { data, isLoading, error } = useQuery(
    ['submission', assignmentId, studentId],
    () => API.get(`/assignments/${assignmentId}/submissions/${studentId}`)
              .then(r => r.data.data),
    { enabled: !!assignmentId && !!studentId }
  )

  const [feedback, setFeedback] = useState('')
  const [grade, setGrade] = useState(0)
  const [answerMap, setAnswerMap] = useState({}) // { questionId: { isCorrect } }

  // prepare mutation
  const mutation = useMutation(
    updates => API.put(
      `/assignments/${assignmentId}/submissions/${studentId}`,
       updates
    ),
    {
      onSuccess: () => {
        qc.invalidateQueries(['submission', assignmentId, studentId])
        qc.invalidateQueries(['allAssignments'])
        toast.success('Submission graded')
        navigate(`/assignments/${assignmentId}/submissions`)
      },
      onError: () => toast.error('Failed to save grades')
    }
  )

  if (isLoading) return <p className="p-6">Loading…</p>
  if (error)     return <p className="p-6 text-red-600">Error loading submission.</p>

  const { answers, totalQuestions } = data
  // fetch parent assignment?
  // you can also show data.assignment.questions if you populated them

  const handleSubmit = e => {
    e.preventDefault()
    // build payload
    const answerUpdates = answers.map(a => ({
      question: a.question._id || a.question,
      isCorrect: !!answerMap[a.question._id || a.question]?.isCorrect
    }))
    mutation.mutate({ grade, feedback, answers: answerUpdates })
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Link to={`/assignments/${assignmentId}/submissions`}
            className="flex items-center text-blue-600 hover:underline">
        <ArrowLeft size={16} className="mr-1"/> Back to submissions
      </Link>

      <h1 className="text-2xl font-semibold">Grade Submission</h1>
      <form onSubmit={handleSubmit} className="space-y-8">

        {answers.map((ans, idx) => {
          const q = ans.question
          const qId = q._id || q
          return (
            <div key={qId} className="border-b pb-4">
              <div
                className="prose mb-2"
                dangerouslySetInnerHTML={{ __html: q.content }}
              />

              <p><strong>Student’s answer:</strong></p>
              <div className="bg-gray-50 p-3 rounded mb-2">
                {typeof ans.response === 'string'
                  ? <span>{ans.response}</span>
                  : ans.response.map(r => <div key={r}>{r}</div>)
                }
              </div>

              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={!!answerMap[qId]?.isCorrect}
                  onChange={e =>
                    setAnswerMap({
                      ...answerMap,
                      [qId]: { isCorrect: e.target.checked }
                    })
                  }
                  className="mr-2"
                />
                Mark correct
              </label>
            </div>
          )
        })}

        <div className="space-y-2">
          <label className="block">
            <span className="text-gray-700">Overall grade</span>
            <input
              type="number"
              min={0}
              max={answers.length}
              value={grade}
              onChange={e => setGrade(Number(e.target.value))}
              className="mt-1 block w-24 border px-2 py-1 rounded"
            />
            <small className="text-gray-500 ml-2">/ {answers.length}</small>
          </label>
          <label className="block">
            <span className="text-gray-700">Feedback</span>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              className="mt-1 block w-full border px-2 py-1 rounded"
              rows={4}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={mutation.isLoading}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {mutation.isLoading ? 'Saving…' : 'Save Grades'}
        </button>
      </form>
    </div>
  )
}
