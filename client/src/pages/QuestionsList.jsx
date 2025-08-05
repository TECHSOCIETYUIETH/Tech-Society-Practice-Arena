// src/pages/QuestionsList.jsx
import React, { useState, useMemo, useEffect } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import API from '../api/api.js'
import { Edit2, Trash2, Eye } from 'lucide-react'

export default function QuestionsList() {
  // 1. Hooks — always run in the same order
  const { data: questions = [], error, isLoading, refetch } = useQuery(
    'questions',
    () => API.get('/questions').then(r => r.data.data)
  )
  const [filterType, setFilterType] = useState('')
  const [filterDiff, setFilterDiff] = useState('')
  const [sortKey, setSortKey]       = useState('createdAt')
  const [sortAsc, setSortAsc]       = useState(false)
  const [page, setPage]             = useState(1)
  const perPage = 8

  // 2. Compute filtered/sorted → always call useMemo
  const processed = useMemo(() => {
    let arr = questions
    if (filterType)  arr = arr.filter(q => q.type === filterType)
    if (filterDiff)  arr = arr.filter(q => q.tags.difficulty === filterDiff)
    arr = arr.sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey]
      if (va < vb) return sortAsc ? -1 : 1
      if (va > vb) return sortAsc ? 1  : -1
      return 0
    })
    return arr
  }, [questions, filterType, filterDiff, sortKey, sortAsc])

  const totalPages = Math.max(1, Math.ceil(processed.length / perPage))
  const pageData   = processed.slice((page - 1) * perPage, page * perPage)

  // 3. Side-effects (error toast)
  useEffect(() => {
    if (error) toast.error('Failed to load questions')
  }, [error])

  // 4. Loading guard
  if (isLoading) {
    return <p className="p-6 text-center">Loading…</p>
  }

  // 5. Main UI
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-semibold">Question Bank</h2>
        <Link
          to="/questions/new"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          + New Question
        </Link>
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Types</option>
          {['mcq','msq','descriptive','image'].map(t => (
            <option key={t} value={t}>{t.toUpperCase()}</option>
          ))}
        </select>
        <select
          value={filterDiff}
          onChange={e => setFilterDiff(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Difficulties</option>
          {['beginner','intermediate','advanced'].map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <button
          onClick={() => { setSortKey('createdAt'); setSortAsc(!sortAsc) }}
          className="border px-3 py-2 rounded"
        >
          Sort by Date {sortAsc ? '↑' : '↓'}
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {pageData.map(q => (
          <div
            key={q._id}
            className="bg-white rounded-lg shadow p-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <p className="font-medium" dangerouslySetInnerHTML={{ __html: q.content }} />
              <div className="text-sm text-gray-500 flex flex-wrap gap-2">
                <span className="uppercase">{q.type}</span>
                <span>{q.tags.difficulty}</span>
                <span>By {q.tags.creator?.name}</span>
              </div>
              {q.type === 'image' && (
                <img
                  src={q.imageUrl}
                  alt={q.imageCaption}
                  className="mt-2 w-full h-32 object-contain rounded"
                />
              )}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Link to={`/questions/${q._id}`} title="View" className="p-2 hover:bg-gray-100 rounded">
                <Eye size={16}/>
              </Link>
              <Link to={`/questions/${q._id}/edit`} title="Edit" className="p-2 hover:bg-gray-100 rounded">
                <Edit2 size={16}/>
              </Link>
              <button
                onClick={async () => {
                  if (!confirm('Delete this question?')) return
                  try {
                    await API.delete(`/questions/${q._id}`)
                    toast.success('Deleted')
                    refetch()
                  } catch {
                    toast.error('Delete failed')
                  }
                }}
                title="Delete"
                className="p-2 hover:bg-gray-100 rounded"
              >
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 py-4">
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 border rounded ${
              page === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
