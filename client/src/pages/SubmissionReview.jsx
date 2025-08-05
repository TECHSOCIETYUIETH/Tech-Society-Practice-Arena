// src/pages/SubmissionReview.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'react-query'
import API from '../api/api.js'
import { toast } from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

export default function SubmissionReview() {
  const { id, studentId } = useParams()
  const navigate = useNavigate()

  // Fetch assignment + questions
  const { data: assignment, isLoading: aLoading } = useQuery(
    ['assignment', id],
    () => API.get(`/assignments/${id}`).then(r => r.data.data)
  )

  // Fetch the specific submission
  const { data: submission, isLoading: sLoading } = useQuery(
    ['submission', id, studentId],
    () => API.get(`/assignments/${id}/submissions/${studentId}`).then(r => r.data.data)
  )

  // Local state for grade, feedback, and per-answer correctness
  const [grade, setGrade] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [answers, setAnswers] = useState([])

  // Initialize form once data loads
  useEffect(() => {
    if (submission && assignment) {
      setGrade(submission.grade ?? 0)
      setFeedback(submission.feedback || '')
      // Merge assignment.questions with submission.answers
      const map = assignment.questions.map(q => {
        const subAns = submission.answers.find(a => a.question === q._id)
        return {
          question: q,
          response: subAns?.response,
          isCorrect: subAns?.isCorrect || false
        }
      })
      setAnswers(map)
    }
  }, [submission, assignment])

  // Mutation to send grading
  const mutation = useMutation(
    data =>
      API.put(`/assignments/${id}/submissions/${studentId}`, data),
    {
      onSuccess: () => {
        toast.success('Graded successfully')
        navigate(-1)
      },
      onError: () => toast.error('Failed to save grade')
    }
  )

  if (aLoading || sLoading || !assignment || !submission) {
    return <p className="p-6 text-center">Loading…</p>
  }

  const handleAnswerToggle = idx => {
    setAnswers(a => {
      const copy = [...a]
      copy[idx].isCorrect = !copy[idx].isCorrect
      return copy
    })
  }

  const handleSubmit = e => {
    e.preventDefault()
    mutation.mutate({
      grade,
      feedback,
      answers: answers.map(a => ({
        question: a.question._id,
        isCorrect: a.isCorrect
      }))
    })
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:underline"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back
      </button>

      <h2 className="text-xl font-semibold">
        Review: {submission.student.name}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {answers.map((a, idx) => (
          <div key={a.question._id} className="space-y-2">
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: a.question.content }}
            />
            <p className="italic">Response: {String(a.response)}</p>
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={a.isCorrect}
                onChange={() => handleAnswerToggle(idx)}
              />
              <span>Mark Correct</span>
            </label>
          </div>
        ))}

        <div className="space-y-2">
          <label className="block">
            <span>Overall Grade</span>
            <input
              type="number"
              value={grade}
              onChange={e => setGrade(Number(e.target.value))}
              className="mt-1 w-32 border px-2 py-1 rounded"
            />
          </label>

          <label className="block">
            <span>Feedback</span>
            <textarea
              rows={4}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              className="mt-1 w-full border px-2 py-1 rounded"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={mutation.isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded disabled:opacity-50"
        >
          {mutation.isLoading ? 'Saving…' : 'Save Grade'}
        </button>
      </form>
    </div>
  )
}
