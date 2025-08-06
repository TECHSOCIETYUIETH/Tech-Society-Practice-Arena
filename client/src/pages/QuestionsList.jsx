// src/pages/QuestionsList.jsx
import React, { useState, useMemo, useEffect } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import API from '../api/api.js'
import {
  Edit2,
  Trash2,
  Eye,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'

export default function QuestionsList() {
  // ─── Data Fetch ─────────────────────────────────────────
  const { data: questions = [], error, isLoading, refetch } = useQuery(
    'questions',
    () => API.get('/questions').then(r => r.data.data),
    { staleTime: 300_000, refetchOnWindowFocus: false, retry: false }
  )

  useEffect(() => {
    if (error) toast.error('Failed to load questions')
  }, [error])

  // ─── Filters & Sort ─────────────────────────────────────
  const [filterType, setFilterType] = useState('')
  const [filterDiff, setFilterDiff] = useState('')
  const [filterTag, setFilterTag]   = useState('')
  const [sortAsc, setSortAsc]       = useState(false)
  const [page, setPage]             = useState(1)
  const perPage = 8

  // ─── Processed List ─────────────────────────────────────
  const processed = useMemo(() => {
    let arr = [...questions]
    if (filterType)  arr = arr.filter(q => q.type === filterType)
    if (filterDiff)  arr = arr.filter(q => q.tags.difficulty === filterDiff)
    if (filterTag) {
      const t = filterTag.toLowerCase()
      arr = arr.filter(q =>
        q.tags.topics?.some(topic => topic.toLowerCase().includes(t))
      )
    }
    arr.sort((a, b) => {
      const da = new Date(a.createdAt)
      const db = new Date(b.createdAt)
      if (da < db) return sortAsc ? -1 : 1
      if (da > db) return sortAsc ? 1  : -1
      return 0
    })
    return arr
  }, [questions, filterType, filterDiff, filterTag, sortAsc])

  const totalPages = Math.max(1, Math.ceil(processed.length / perPage))
  const pageData   = processed.slice((page - 1) * perPage, page * perPage)

  // ─── Difficulty Color Map ──────────────────────────────
  const diffClasses = {
    beginner:     'from-green-500 to-green-600 text-white',
    intermediate: 'from-yellow-500 to-yellow-600 text-white',
    advanced:     'from-red-500 to-red-600 text-white'
  }

  // ─── Loading State ─────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="animate-pulse text-gray-400">Loading questions…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
          <Link
            to="/questions/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg"
          >
            <Plus size={20} /> New Question
          </Link>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
              <input
                type="text"
                placeholder="Filter by topic…"
                value={filterTag}
                onChange={e => { setFilterTag(e.target.value); setPage(1) }}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Type / Difficulty */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filterType}
                onChange={e => { setFilterType(e.target.value); setPage(1) }}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {['mcq','msq','descriptive','image'].map(t => (
                  <option key={t} value={t}>{t.toUpperCase()}</option>
                ))}
              </select>
              <select
                value={filterDiff}
                onChange={e => { setFilterDiff(e.target.value); setPage(1) }}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Difficulties</option>
                {['beginner','intermediate','advanced'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <button
                onClick={() => setSortAsc(sa => !sa)}
                className="inline-flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Sort by Date {sortAsc ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {pageData.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No questions match your filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageData.map(q => (
              <div
                key={q._id}
                className="group relative bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-1"
              >
                {/* Card Header (difficulty gradient) */}
                <div className={`bg-gradient-to-r ${diffClasses[q.tags.difficulty] || diffClasses.beginner} p-5`}>
                  <span className="text-sm font-semibold uppercase">
                    {q.tags.difficulty}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col justify-between space-y-4">
                  <p
                    className="font-medium text-gray-800 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: q.content }}
                  />

                  <div className="text-sm text-gray-500 flex flex-wrap gap-2">
                    <span className="uppercase">{q.type}</span>
                    <span>By {q.tags.creator?.name || '—'}</span>
                    <span>Created {format(new Date(q.createdAt), 'PP')}</span>
                  </div>

                  {q.type === 'image' && q.images?.[0] && (
                    <img
                      src={q.images[0].url}
                      alt={q.images[0].caption}
                      className="mt-2 w-full h-32 object-contain rounded-lg"
                    />
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                    <Link
                      to={`/questions/${q._id}`}
                      title="View"
                      className="p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      <Eye size={16} />
                    </Link>
                    <Link
                      to={`/questions/${q._id}/edit`}
                      title="Edit"
                      className="p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      <Edit2 size={16} />
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
                      className="p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex justify-center items-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition"
            >
              <ChevronLeft size={18} /> Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded-xl font-semibold transition ${
                  page === i + 1
                    ? 'bg-blue-600 text-white shadow'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
