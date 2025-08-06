import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import API from '../api/api.js'
import { toast } from 'react-hot-toast'
import { X, Eye } from 'lucide-react'

export default function AssignmentForm() {
  const { id } = useParams()
  const editMode = Boolean(id)
  const navigate = useNavigate()

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    mode: 'assignment',       // 'assignment' | 'quiz' | 'test'
    startDate: null,
    dueDate: null,
    timeLimitMinutes: null,
    questions: [],
    visibleToAll: true,
    visibleTo: []
  })
  const [submitting, setSubmitting] = useState(false)
  const [modalQ, setModalQ]         = useState(null)

  // Filters for question picker
  const [qSearch, setQSearch]       = useState('')
  const [qTypeFilter, setQTypeFilter] = useState('')
  const [qDiffFilter, setQDiffFilter] = useState('')
  const [qSortKey, setQSortKey]     = useState('createdAt')
  const [qSortAsc, setQSortAsc]     = useState(false)

  // Filters for student picker
  const [sSearch, setSSearch]       = useState('')

  // Fetch all questions & students
  const { data: allQuestions = [] } = useQuery('questions', () =>
    API.get('/questions').then(r => r.data.data),{
     staleTime: 5 * 60 * 1000,       // cache for 5 min
     refetchOnWindowFocus: false,    // no auto-refetch on focus
     retry: false                     // don’t retry on errors
   },
  )
  const { data: allStudents = [] }  = useQuery('students', () =>
    API.get('/users').then(r => r.data.data),{
     staleTime: 5 * 60 * 1000,       // cache for 5 min
     refetchOnWindowFocus: false,    // no auto-refetch on focus
     retry: false                     // don’t retry on errors
   },
  )

  // Load existing assignment in edit mode
  useEffect(() => {
    if (!editMode) return
    API.get(`/assignments/${id}`)
      .then(res => {
        const a = res.data.data
        setForm({
          title: a.title,
          description: a.description || '',
          mode: a.mode,
          startDate: a.startDate ? new Date(a.startDate) : null,
          dueDate: a.dueDate ? new Date(a.dueDate) : null,
          timeLimitMinutes: a.timeLimitMinutes || null,
          questions: a.questions.map(q => q._id),
          visibleToAll: a.visibleToAll,
          visibleTo: a.visibleTo.map(u => u._id)
        })
      })
      .catch(() => toast.error('Failed to load assignment'))
  }, [editMode, id])

  // Question list after filters & sorting
  const questions = allQuestions
    .filter(q => {
      const text = q.content.replace(/<[^>]+>/g, '').toLowerCase()
      return text.includes(qSearch.toLowerCase())
    })
    .filter(q => !qTypeFilter   || q.type === qTypeFilter)
    .filter(q => !qDiffFilter   || q.tags.difficulty === qDiffFilter)
    .sort((a, b) => {
      let va = a[qSortKey], vb = b[qSortKey]
      if (qSortKey === 'createdAt') {
        va = new Date(va); vb = new Date(vb)
      }
      if (va < vb) return qSortAsc ? -1 : 1
      if (va > vb) return qSortAsc ? 1 : -1
      return 0
    })

  // Student list after search
  const students = allStudents.filter(u =>
    u.name.toLowerCase().includes(sSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(sSearch.toLowerCase())
  )

  // Toggle question selection
  const toggleQuestion = qid =>
    setForm(f => ({
      ...f,
      questions: f.questions.includes(qid)
        ? f.questions.filter(x => x !== qid)
        : [...f.questions, qid]
    }))

  // Toggle student selection
  const toggleStudent = sid =>
    setForm(f => ({
      ...f,
      visibleTo: f.visibleTo.includes(sid)
        ? f.visibleTo.filter(x => x !== sid)
        : [...f.visibleTo, sid]
    }))

  // Form submit
  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        visibleTo: form.visibleToAll ? [] : form.visibleTo
      }
      if (editMode) {
        await API.put(`/assignments/${id}`, payload)
        toast.success('Assignment updated')
      } else {
        await API.post('/assignments', payload)
        toast.success('Assignment created')
      }
      navigate('/assignments')
    } catch {
      toast.error('Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  // Helpers
  const toLocalString = d => d ? d.toISOString().slice(0, 16) : ''

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow space-y-6">
      <h2 className="text-xl font-semibold">
        {editMode ? 'Edit Assignment' : 'New Assignment'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Title & Description */}
        <label className="block">
          <span>Title</span>
          <input
            required
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="mt-1 w-full border px-3 py-2 rounded"
          />
        </label>
        <label className="block">
          <span>Description</span>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="mt-1 w-full border px-3 py-2 rounded"
          />
        </label>

        {/* Mode Selector */}
        <label className="block">
          <span>Type</span>
          <select
            value={form.mode}
            onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}
            className="mt-1 w-full border px-3 py-2 rounded"
          >
            <option value="assignment">Assignment</option>
            <option value="quiz">Quiz</option>
            <option value="test">Test</option>
          </select>
        </label>

        {/* Date vs Timer */}
        {form.mode === 'assignment' ? (
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span>Start Date</span>
              <input
                type="datetime-local"
                value={toLocalString(form.startDate)}
                onChange={e => {
                  const v = e.target.value
                  setForm(f => ({ ...f, startDate: v ? new Date(v) : null }))
                }}
                className="mt-1 w-full border px-3 py-2 rounded"
              />
            </label>

            <label className="block">
              <span>Due Date</span>
              <input
                type="datetime-local"
                value={toLocalString(form.dueDate)}
                onChange={e => {
                  const v = e.target.value
                  setForm(f => ({ ...f, dueDate: v ? new Date(v) : null }))
                }}
                className="mt-1 w-full border px-3 py-2 rounded"
              />
            </label>
          </div>
        ) : (
          <label className="block">
            <span>Time Limit (minutes)</span>
            <input
              type="number"
              min="1"
              placeholder="e.g. 30"
              value={form.timeLimitMinutes || ''}
              onChange={e => setForm(f => ({
                ...f,
                timeLimitMinutes: e.target.value ? parseInt(e.target.value, 10) : null
              }))}
              className="mt-1 w-32 border px-3 py-2 rounded"
            />
          </label>
        )}

        {/* Question Picker Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <input
            placeholder="Search questions…"
            value={qSearch}
            onChange={e => setQSearch(e.target.value)}
            className="border px-2 py-1 rounded flex-1"
          />
          <select
            value={qTypeFilter}
            onChange={e => setQTypeFilter(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">All Types</option>
            <option value="mcq">MCQ</option>
            <option value="msq">MSQ</option>
            <option value="descriptive">Descriptive</option>
            <option value="image">Image</option>
          </select>
          <select
            value={qDiffFilter}
            onChange={e => setQDiffFilter(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">All Difficulty</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setQSortKey('createdAt')
              setQSortAsc(sa => !sa)
            }}
            className="border px-2 py-1 rounded"
          >
            Sort by Date {qSortAsc ? '↑' : '↓'}
          </button>
        </div>

        {/* Question Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-auto border p-2 rounded">
          {questions.map(q => {
            const text = q.content.replace(/<[^>]+>/g, '')
            const preview = text.length > 100 ? text.slice(0, 100) + '…' : text
            const selected = form.questions.includes(q._id)
            return (
              <div
                key={q._id}
                onClick={() => toggleQuestion(q._id)}
                className={`relative p-3 border rounded hover:shadow cursor-pointer
                  ${selected ? 'bg-blue-50 border-blue-400' : ''}`}
              >
                <p className="line-clamp-2 text-sm">{preview}</p>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    setModalQ(q)
                  }}
                  className="absolute top-1 right-1 text-gray-500 hover:text-gray-800"
                  title="View"
                >
                  <Eye size={16} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Question Detail Modal */}
        {modalQ && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded shadow-lg max-w-xl w-full p-6 relative">
              <button
                onClick={() => setModalQ(null)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              >
                <X size={20} />
              </button>
              <h3 className="text-lg font-semibold mb-2">Question Detail</h3>
              <div
                className="prose mb-4"
                dangerouslySetInnerHTML={{ __html: modalQ.content }}
              />
              {modalQ.options?.length > 0 && (
                <ul className="list-disc pl-5 space-y-1">
                  {modalQ.options.map(o => (
                    <li key={o.id}>{o.id}. {o.text}</li>
                  ))}
                </ul>
              )}
              {modalQ.explanation && (
                <div className="mt-4">
                  <h4 className="font-medium">Explanation</h4>
                  <div
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: modalQ.explanation }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Visibility & Student Picker */}
        <div>
          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.visibleToAll}
              onChange={e => setForm(f => ({ ...f, visibleToAll: e.target.checked }))}
            />
            <span>Visible to all students</span>
          </label>
        </div>
        {!form.visibleToAll && (
          <div className="space-y-2">
            <input
              placeholder="Search students…"
              value={sSearch}
              onChange={e => setSSearch(e.target.value)}
              className="border px-2 py-1 rounded w-full"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-64 overflow-auto border p-2 rounded">
              {students.map(s => {
                const sel = form.visibleTo.includes(s._id)
                return (
                  <div
                    key={s._id}
                    onClick={() => toggleStudent(s._id)}
                    className={`p-3 border rounded hover:shadow cursor-pointer
                      ${sel ? 'bg-green-50 border-green-400' : ''}`}
                  >
                    <div className="font-medium">{s.name}</div>
                    <div className="text-sm text-gray-600">{s.email}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
        >
          {submitting
            ? editMode ? 'Updating…' : 'Creating…'
            : editMode ? 'Update Assignment' : 'Create Assignment'}
        </button>
      </form>
    </div>
  )
}
