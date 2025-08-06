// src/pages/SubmissionForm.jsx
import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import API from '../api/api.js'
import { toast } from 'react-hot-toast'
import { AuthContext } from '../contexts/AuthContext.jsx'

import { formatDistanceToNowStrict } from 'date-fns'

export default function SubmissionForm() {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const qc = useQueryClient()

  // State
  const [answers, setAnswers]                 = useState([])
  const [testCaseResults, setTestCaseResults] = useState([])
  const [saving, setSaving]                   = useState(false)
  const [submitting, setSubmitting]           = useState(false)
  const [now, setNow]                         = useState(Date.now())
  const [startTime]                           = useState(Date.now()) // record when opened

  // 1) Load assignment
  const { data: assignment, isLoading: aLoading } = useQuery(
    ['assignment', id],
    () => API.get(`/assignments/${id}`).then(r => r.data.data),
    { staleTime: 300000, refetchOnWindowFocus: false, retry: false }
  )

  // 2) Compute due timestamp
  const mode     = assignment?.mode
  const dueDateMs = assignment?.dueDate
    ? new Date(assignment.dueDate).getTime()
    : (mode !== 'assignment' && assignment?.timeLimitMinutes
       ? startTime + assignment.timeLimitMinutes * 60000
       : null)

  // 3) Tick every second for countdown
  useEffect(() => {
    if ((mode === 'quiz' || mode === 'test') && dueDateMs) {
      const iv = setInterval(() => setNow(Date.now()), 1000)
      return () => clearInterval(iv)
    }
  }, [mode, dueDateMs])

  // Build HH:MM:SS display
  const remainingMs = dueDateMs ? Math.max(dueDateMs - now, 0) : 0
  const hrs   = String(Math.floor(remainingMs/3600000)).padStart(2,'0')
  const mins  = String(Math.floor((remainingMs%3600000)/60000)).padStart(2,'0')
  const secs  = String(Math.floor((remainingMs%60000)/1000)).padStart(2,'0')
  const timerDisplay = `${hrs}:${mins}:${secs}`

  // 4) Load existing submission (draft or final)
  const userId = user?._id
  const { data: existing, isLoading: sLoading } = useQuery(
    ['submission', id, userId],
    () => API.get(`/assignments/${id}/submission`).then(r => r.data.data),
    {
      enabled: !!assignment && !!userId,
      staleTime: 300000,
      refetchOnWindowFocus: false,
      retry: false,
      onError: () => {}
    }
  )

  // 5) Populate answers when existing arrives
  useEffect(() => {
    if (existing) {
      setAnswers(existing.answers)
      setTestCaseResults(existing.testCaseResults || [])
    }
  }, [existing])

  // 6) Mutations for save & final, include timeTakenMs on final
  const submitMut = useMutation(
    ({ answers, testCaseResults, saveDraft, timeTakenMs }) =>
      API.post(`/assignments/${id}/submit`, { answers, testCaseResults, saveDraft, timeTakenMs }),
    {
      onSuccess: () => {
        qc.invalidateQueries(['myAssignments', user._id])
        navigate('/')
      }
    }
  )

  const handleSave = e => {
    e.preventDefault()
    setSaving(true)
    submitMut.mutate(
      { answers, testCaseResults, saveDraft: true, timeTakenMs: null },
      {
        onSettled: () => setSaving(false),
        onError:  () => toast.error('Save failed'),
        onSuccess:() => toast.success('Draft saved')
      }
    )
  }

  const handleFinal = e => {
    e.preventDefault()
    setSubmitting(true)
    const timeTakenMs = Date.now() - startTime
    submitMut.mutate(
      { answers, testCaseResults, saveDraft: false, timeTakenMs },
      {
        onSettled: () => setSubmitting(false),
        onError:  () => toast.error('Submit failed'),
        onSuccess:() => toast.success('Submitted!')
      }
    )
  }

  // 7) Auto-submit when timer hits zero
  useEffect(() => {
    if (remainingMs === 0 && (mode === 'quiz' || mode === 'test')) {
      handleFinal(new Event('auto'))
    }
  }, [remainingMs])

  // Guards
  if (aLoading || sLoading) {
    return <p className="p-6 text-center">Loading…</p>
  }
  if (!assignment) {
    return <p className="p-6 text-center text-red-600">Assignment not found</p>
  }

  // Helper to update one answer
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

  return (
    <div className="relative p-6 max-w-3xl mx-auto bg-white rounded shadow space-y-6">
      {/* Sticky timer at top-right */}
      {(mode === 'quiz' || mode === 'test') && dueDateMs && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-600 text-white font-mono text-sm px-3 py-1 rounded shadow-lg">
            ⏱ {timerDisplay}
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold">{assignment.title}</h2>

      <form className="space-y-6">
        {assignment.questions.map(q => {
          const ans  = answers.find(a => a.question === q._id)
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
                        if (q.type === 'mcq') {
                          updateAnswer(q._id, o.id)
                        } else {
                          let arr = Array.isArray(resp) ? [...resp] : []
                          arr = arr.includes(o.id)
                            ? arr.filter(x => x !== o.id)
                            : [...arr, o.id]
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

        <div className="flex gap-4 pt-6">
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
