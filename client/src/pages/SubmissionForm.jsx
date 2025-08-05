import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import API from '../api/api.js'
import { toast } from 'react-hot-toast'
import AuthContext from '../contexts/AuthContext.jsx'
import { formatDistanceToNowStrict } from 'date-fns'

export default function SubmissionForm() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

  const [answers, setAnswers]                 = useState([])
  const [testCaseResults, setTestCaseResults] = useState([])
  const [saving, setSaving]                   = useState(false)
  const [submitting, setSubmitting]           = useState(false)

  // 1) load assignment
  const { data: assignment, isLoading: aLoading } = useQuery(
    ['assignment', id],
    () => API.get(`/assignments/${id}`).then(r => r.data.data)
  )

  // 2) derive mode & due timestamp
  const mode = assignment?.mode
  const dueDateMs = assignment?.dueDate
    ? new Date(assignment.dueDate).getTime()
    : (mode !== 'assignment' && assignment?.timeLimitMinutes
        ? Date.now() + assignment.timeLimitMinutes * 60_000
        : null)

  // 3) live clock
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if ((mode === 'quiz' || mode === 'test') && dueDateMs) {
      const iv = setInterval(() => setNow(Date.now()), 1000)
      return () => clearInterval(iv)
    }
  }, [mode, dueDateMs])

  const remainingMs = dueDateMs ? Math.max(dueDateMs - now, 0) : 0
  const hrs = String(Math.floor(remainingMs / 3600000)).padStart(2,'0')
  const mins = String(Math.floor((remainingMs % 3600000)/60000)).padStart(2,'0')
  const secs = String(Math.floor((remainingMs % 60000)/1000)).padStart(2,'0')
  const timerDisplay = `${hrs}:${mins}:${secs}`

  // 4) auto-submit when done
  useEffect(() => {
    if (remainingMs === 0 && (mode === 'quiz' || mode === 'test')) {
      handleFinal(new Event('auto'))
    }
  }, [remainingMs])

  // 5) load existing submission
  const userId = user?._id
  const { data: existing, isLoading: sLoading } = useQuery(
    ['submission', id, userId],
    () => API.get(`/assignments/${id}/submission`).then(r => r.data.data),
    {
      enabled: !!assignment && !!userId,
      retry: false,
      onError: () => {}
    }
  )

  // 6) populate answers
  useEffect(() => {
    if (existing) {
      setAnswers(existing.answers)
      setTestCaseResults(existing.testCaseResults || [])
    }
  }, [existing])

  // 7) handle loading & missing assignment
  if (aLoading || sLoading) {
    return <p className="p-6 text-center">Loading…</p>
  }
  if (!assignment) {
    return <p className="p-6 text-center text-red-600">Assignment not found</p>
  }

  const updateAnswer = (qid, resp) => {
    setAnswers(curr => {
      const idx = curr.findIndex(a => a.question === qid)
      if (idx >= 0) {
        const copy = [...curr]
        copy[idx].response = resp
        return copy
      }
      return [...curr, { question: qid, response: resp }]
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await API.post(`/assignments/${id}/submit`, { answers, testCaseResults, saveDraft: true })
      toast.success('Draft saved')
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleFinal(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await API.post(`/assignments/${id}/submit`, { answers, testCaseResults, saveDraft: false })
      toast.success('Submitted!')
      navigate('/')
    } catch {
      toast.error('Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow space-y-6">
      <h2 className="text-xl font-semibold">{assignment.title}</h2>

      {/* Live timer banner */}
      {(mode === 'quiz' || mode === 'test') && (
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 text-red-700 font-mono text-lg px-4 py-2 rounded-lg shadow-inner">
            ⏱ {timerDisplay}
          </div>
        </div>
      )}

      <form className="space-y-6">
        {assignment.questions.map(q => {
          const ans = answers.find(a => a.question === q._id)
          const resp = ans?.response
          return (
            <div key={q._id} className="space-y-2">
              <div className="prose" dangerouslySetInnerHTML={{ __html: q.content }} />

              {(q.type === 'mcq' || q.type === 'msq') &&
                q.options.map(o => (
                  <label key={o.id} className="flex items-center space-x-2">
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
                          let arr = Array.isArray(resp) ? [...resp] : []
                          arr = arr.includes(o.id) ? arr.filter(x => x !== o.id) : [...arr, o.id]
                          updateAnswer(q._id, arr)
                        }
                      }}
                    />
                    <span>{o.id}. {o.text}</span>
                  </label>
                ))}

              {q.type === 'descriptive' && (
                <textarea
                  rows={4}
                  value={resp || ''}
                  onChange={e => updateAnswer(q._id, e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              )}
            </div>
          )
        })}

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            onClick={handleFinal}
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit Assignment'}
          </button>
        </div>
      </form>
    </div>
  )
}
