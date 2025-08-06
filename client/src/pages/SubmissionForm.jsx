// src/pages/SubmissionForm.jsx
import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import API from '../api/api.js'
import { toast } from 'react-hot-toast'
import { AuthContext } from '../contexts/AuthContext.jsx'
import { parseISO, formatDistanceToNowStrict } from 'date-fns'
import {
  ArrowLeft,
  RefreshCw,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'

export default function SubmissionForm() {
  const { id }        = useParams()
  const { user }      = useContext(AuthContext)
  const navigate      = useNavigate()
  const qc            = useQueryClient()

  // form state
  const [answers, setAnswers]                 = useState([])
  const [saving, setSaving]                   = useState(false)
  const [submitting, setSubmitting]           = useState(false)
  const [now, setNow]                         = useState(Date.now())
  const [startTime]                           = useState(Date.now())

  // 1) load assignment
  const { data: assignment, isLoading: aLoading } = useQuery(
    ['assignment', id],
    () => API.get(`/assignments/${id}`).then(r => r.data.data),
    { staleTime: 300_000, refetchOnWindowFocus: false }
  )

  // 2) compute due‐time
  const mode      = assignment?.mode
  const dueDateMs = assignment?.dueDate
    ? new Date(assignment.dueDate).getTime()
    : (['quiz','test'].includes(mode) && assignment?.timeLimitMinutes)
      ? startTime + assignment.timeLimitMinutes * 60_000
      : null

  // 3) tick for countdown
  useEffect(() => {
    if (dueDateMs && ['quiz','test'].includes(mode)) {
      const iv = setInterval(() => setNow(Date.now()), 1000)
      return () => clearInterval(iv)
    }
  }, [dueDateMs, mode])

  const remainingMs = dueDateMs ? Math.max(dueDateMs - now, 0) : 0
  const hrs   = String(Math.floor(remainingMs/3600000)).padStart(2,'0')
  const mins  = String(Math.floor((remainingMs%3600000)/60000)).padStart(2,'0')
  const secs  = String(Math.floor((remainingMs%60000)/1000)).padStart(2,'0')
  const timerDisplay = `${hrs}:${mins}:${secs}`

  // 4) load existing submission
  const studentId = user?._id
  const { data: existing, isLoading: sLoading } = useQuery(
    ['submission', id, studentId],
    () => API.get(`/assignments/${id}/submission`).then(r => r.data.data),
    {
      enabled: !!assignment && !!studentId,
      staleTime: 0,
      refetchOnMount: true, 
      refetchOnWindowFocus: true,
      retry: false,
      onError: () => {}
    }
  )

  // 5) seed form
  useEffect(() => {
    if (existing) {
      setAnswers(existing.answers || [])
    }
  }, [existing])

  // 6) mutation
  const submitMut = useMutation(
    ({ isFinal, timeTakenMs }) =>
      API.post(`/assignments/${id}/submit`, {
        answers,
        isFinal,
        timeTakenMs
      }),
    {
      onSuccess: () => {
        qc.invalidateQueries(['myAssignments', studentId])
        navigate('/')
      },
      onError: () => toast.error('Submission failed')
    }
  )

  const handleSave = e => {
    e.preventDefault()
    setSaving(true)
    submitMut.mutate(
      { isFinal: false, timeTakenMs: null },
      { onSettled: () => setSaving(false), onSuccess: () => toast.success('Draft saved') }
    )
  }

  const handleFinal = e => {
    e?.preventDefault()
    setSubmitting(true)
    const timeTakenMs = Date.now() - startTime
    submitMut.mutate(
      { isFinal: true, timeTakenMs },
      { onSettled: () => setSubmitting(false), onSuccess: () => toast.success('Submitted!') }
    )
  }

  // 7) auto‐submit
  useEffect(() => {
    if (remainingMs === 0 && ['quiz','test'].includes(mode)) {
      handleFinal()
    }
  }, [remainingMs, mode])

  // 8) guards
  if (aLoading || sLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <RefreshCw className="animate-spin text-gray-400" size={32} />
      </div>
    )
  }
  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <AlertTriangle className="text-red-600 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Assignment not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            <ArrowLeft className="mr-2" size={20} /> Go Back
          </button>
        </div>
      </div>
    )
  }

  // 9) update answer
  const updateAnswer = (qid, resp) => {
    setAnswers(curr => {
      const idx = curr.findIndex(a => a.question === qid)
      if (idx >= 0) {
        const copy = [...curr]; copy[idx].response = resp; return copy
      }
      return [...curr, { question: qid, response: resp }]
    })
  }

  return (
    <div className="min-h-screen  bg-gradient-to-br from-gray-50 to-blue-50 py-8">
         <div className="sticky  top-12 z-50 bg-white">
  <div className="max-w-4xl flex items-center justify-between mx-auto ">
    <button
      onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 font-medium"
    >
      <ArrowLeft size={18} /> Back
    </button>
    {dueDateMs && ['quiz','test'].includes(mode) && (
      <div className="bg-red-600 px-3 py-1 rounded-lg font-mono text-sm text-white shadow-lg">
        ⏱ {timerDisplay}
      </div>
    )}
  </div>
</div>

      <div className="max-w-4xl relative   mx-auto bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
         
        <div className="bg-gradient-to-r  from-indigo-600 to-cyan-600 p-8 text-white ">
          <h1 className="text-3xl font-bold">{assignment.title}</h1>
          {assignment.description && (
            <p className="mt-2 text-indigo-100">{assignment.description}</p>
          )}
        </div>

        {/* Form */}
        <form className="p-8 space-y-6">
          {assignment.questions.map((q, idx) => {
            const ans  = answers.find(a => a.question === q._id)
            const resp = ans?.response
            return (
              <div key={q._id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: q.content }} />
                </div>
                {/* MCQ / MSQ */}
                {['mcq','msq'].includes(q.type) && q.options.map(o => (
                  <label key={o.id} className="flex items-center gap-3 ml-11">
                    <input
                      type={q.type === 'mcq' ? 'radio' : 'checkbox'}
                      name={q._id}
                      checked={
                        q.type === 'mcq'
                          ? resp === o.id
                          : Array.isArray(resp) && resp.includes(o.id)
                      }
                      onChange={() => {
                        if (q.type === 'mcq') updateAnswer(q._id, o.id)
                        else {
                          const arr = Array.isArray(resp) ? [...resp] : []
                          updateAnswer(
                            q._id,
                            arr.includes(o.id)
                              ? arr.filter(x => x !== o.id)
                              : [...arr, o.id]
                          )
                        }
                      }}
                      className="form-radio text-indigo-600"
                    />
                    <span>{o.id}. {o.text}</span>
                  </label>
                ))}

                {/* Descriptive */}
                {q.type === 'descriptive' && (
                  <textarea
                    rows={4}
                    value={resp || ''}
                    onChange={e => updateAnswer(q._id, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>
            )
          })}

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl font-semibold transition disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Draft'}
            </button>
            <button
              onClick={handleFinal}
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-2xl font-semibold transition disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit Assignment'}
            </button>
          </div>

          <div className="text-center text-gray-500 text-sm">
            <Link to="/assignments" className="underline hover:text-indigo-600">
              Back to assignments
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
