// src/pages/AssignmentList.jsx
import React, { useState, useMemo, useEffect } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import API from '../api/api.js'
import { Edit2, Trash2, Eye } from 'lucide-react'

export default function AssignmentList() {
  // 1) hooks in fixed order
  const { data: assignments = [], error, isLoading, refetch } = useQuery(
    'assignments',
    () => API.get('/assignments').then(r => r.data.data)
  )
  const [statusFilter, setStatusFilter]   = useState('')
  const [visibleFilter, setVisibleFilter] = useState('')
  const [sortKey, setSortKey]             = useState('startDate')
  const [sortAsc, setSortAsc]             = useState(true)
  const [page, setPage]                   = useState(1)
  const perPage = 8

  // 2) derive filtered/sorted list
  const processed = useMemo(() => {
    let arr = [...assignments]
    if (statusFilter)   arr = arr.filter(a => a.status === statusFilter)
    if (visibleFilter === 'all')      arr = arr.filter(a => a.visibleToAll)
    if (visibleFilter === 'selected') arr = arr.filter(a => !a.visibleToAll)
    arr.sort((a, b) => {
      const va = a[sortKey] ?? ''
      const vb = b[sortKey] ?? ''
      if (va < vb) return sortAsc ? -1 : 1
      if (va > vb) return sortAsc ? 1  : -1
      return 0
    })
    return arr
  }, [assignments, statusFilter, visibleFilter, sortKey, sortAsc])

  // 3) side‐effect for error toast
  useEffect(() => {
    if (error) toast.error('Failed to load assignments')
  }, [error])

  // 4) now you can early-return for loading
  if (isLoading) {
    return <p className="p-6 text-center">Loading…</p>
  }

  // 5) pagination
  const totalPages = Math.ceil(processed.length / perPage)
  const pageData   = processed.slice((page - 1) * perPage, page * perPage)

  // 6) render
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-semibold">Assignments</h2>
        <Link to="/assignments/new" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
          + New Assignment
        </Link>
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={visibleFilter}
          onChange={e => setVisibleFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Visibility</option>
          <option value="all">All Students</option>
          <option value="selected">Selected Only</option>
        </select>
        <button
          onClick={() => {
            setSortKey('startDate')
            setSortAsc(sa => !sa)
          }}
          className="border px-3 py-2 rounded"
        >
          Sort by Start {sortAsc ? '↑' : '↓'}
        </button>
        <button
          onClick={() => {
            setSortKey('dueDate')
            setSortAsc(sa => !sa)
          }}
          className="border px-3 py-2 rounded"
        >
          Sort by Due {sortAsc ? '↑' : '↓'}
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {pageData.map(a => (
          <div key={a._id} className="bg-white rounded-lg shadow p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="font-medium text-lg">{a.title}</h3>
              {a.startDate && (
                <div className="text-sm text-gray-500">
                  Starts: {new Date(a.startDate).toLocaleDateString()}
                </div>
              )}
              {a.dueDate && (
                <div className="text-sm text-gray-500">
                  Due: {new Date(a.dueDate).toLocaleDateString()}
                </div>
              )}
              <div className="text-sm">
                Status:
                <span className={`ml-1 font-semibold ${a.status === 'open' ? 'text-green-600' : 'text-red-600'}`}>
                  {a.status}
                </span>
              </div>
              <div className="text-sm">
                Visibility: {a.visibleToAll ? 'All Students' : 'Selected Only'}
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Link to={`/assignments/${a._id}`} title="View" className="p-2 hover:bg-gray-100 rounded">
                <Eye size={16} />
              </Link>
              <Link to={`/assignments/${a._id}/edit`} title="Edit" className="p-2 hover:bg-gray-100 rounded">
                <Edit2 size={16} />
              </Link>
              <button
                onClick={async () => {
                  if (!confirm('Delete this assignment?')) return
                  try {
                    await API.delete(`/assignments/${a._id}`)
                    toast.success('Deleted')
                    refetch()
                  } catch {
                    toast.error('Delete failed')
                  }
                }}
                title="Delete"
                className="p-2 hover:bg-gray-100 rounded"
              >
                <Trash2 size={16} />
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
            className={`px-3 py-1 border rounded ${page === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
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
