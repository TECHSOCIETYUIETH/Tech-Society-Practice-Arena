import React, { useState, useMemo, useEffect } from 'react'
import { useQuery } from 'react-query'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import API from '../api/api.js'
import { Edit2, Trash2, Eye } from 'lucide-react'
import { format } from 'date-fns'

export default function AssignmentList() {
  const navigate = useNavigate()

  // 1) Data fetch
  const { data: assignments = [], error, isLoading, refetch } = useQuery(
    'assignments',
    () => API.get('/assignments').then(r => r.data.data),
    { staleTime: 300000, refetchOnWindowFocus: false, retry: false }
  )

  // 2) Filters, sort & pagination state
  const [statusFilter, setStatusFilter]   = useState('')
  const [visibleFilter, setVisibleFilter] = useState('')
  const [sortKey, setSortKey]             = useState('createdAt')
  const [sortAsc, setSortAsc]             = useState(false)
  const [page, setPage]                   = useState(1)
  const perPage = 9

  // 3) Processed list
  const processed = useMemo(() => {
    let arr = [...assignments]
    if (statusFilter)   arr = arr.filter(a => a.status === statusFilter)
    if (visibleFilter === 'all')      arr = arr.filter(a => a.visibleToAll)
    if (visibleFilter === 'selected') arr = arr.filter(a => !a.visibleToAll)
    arr.sort((a,b) => {
      const va = new Date(a[sortKey] || a.createdAt)
      const vb = new Date(b[sortKey] || b.createdAt)
      if (va < vb) return sortAsc ? -1 : 1
      if (va > vb) return sortAsc ? 1  : -1
      return 0
    })
    return arr
  }, [assignments, statusFilter, visibleFilter, sortKey, sortAsc])

  const totalPages = Math.max(1, Math.ceil(processed.length / perPage))
  const pageData   = processed.slice((page - 1) * perPage, page * perPage)

  // 4) Errors & loading
  useEffect(() => { if (error) toast.error('Failed to load assignments') }, [error])
  if (isLoading) return <p className="p-6 text-center">Loading…</p>

  // 5) Badge styles
  const badgeClasses = {
    assignment: 'bg-gradient-to-r from-green-400 to-teal-500',
    quiz:       'bg-gradient-to-r from-yellow-400 to-orange-500',
    test:       'bg-gradient-to-r from-red-400 to-pink-500'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-3xl font-bold">Assignments</h2>
        <Link to="/assignments/new" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg">
          + New Assignment
        </Link>
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={visibleFilter}
          onChange={e => { setVisibleFilter(e.target.value); setPage(1) }}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">All Visibility</option>
          <option value="all">All Students</option>
          <option value="selected">Selected Only</option>
        </select>

        {['startDate','dueDate','createdAt'].map(key => (
          <button
            key={key}
            onClick={() => { setSortKey(key); setSortAsc(sa => !sa) }}
            className="border px-3 py-2 rounded-lg"
          >
            Sort by {key.replace('At',' At').replace(/([A-Z])/g,' $1')} {sortAsc ? '↑' : '↓'}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {pageData.map(a => (
          <div key={a._id} className="relative bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition">
            <h3 className="mt-2 text-xl font-semibold text-gray-800 truncate">{a.title}</h3>

            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <div>Created by: {a.createdBy?.name || a.createdBy?.email || '—'}</div>
              <div>Created: {format(new Date(a.createdAt), 'PPP p')}</div>
              {a.updatedAt && <div>Updated: {format(new Date(a.updatedAt), 'PPP p')}</div>}
              {a.startDate && <div>Starts: {format(new Date(a.startDate), 'PPP p')}</div>}
              {a.dueDate   && <div>Due:    {format(new Date(a.dueDate),   'PPP p')}</div>}
              {(['quiz','test'].includes(a.mode) && a.timeLimitMinutes) && (
                <div>Duration: {a.timeLimitMinutes} min</div>
              )}
              <div>Status: <span className={a.status==='open'?'text-green-600':'text-red-600 font-semibold'}>{a.status}</span></div>
              <div>Visibility: {a.visibleToAll?'All':'Selected'}</div>
              <div>Questions: {a.questions.length}</div>
            </div>

            {/* Badge bottom-left */}
            <span className={`absolute bottom-4 left-4 text-white px-3 py-1 text-xs font-semibold rounded-full ${badgeClasses[a.mode] || badgeClasses.assignment}`}>              
              {a.mode?.toUpperCase()}
            </span>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => navigate(`/assignments/${a._id}`)}
                title="View"
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Eye size={20} />
              </button>
              <Link to={`/assignments/${a._id}/edit`} title="Edit" className="p-2 hover:bg-gray-100 rounded-lg">
                <Edit2 size={20} />
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
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 py-4">
        <button onClick={() => setPage(p => Math.max(p-1,1))} disabled={page===1} className="px-4 py-2 border rounded-lg disabled:opacity-50">Prev</button>
        {[...Array(totalPages)].map((_,i)=>(
          <button key={i} onClick={()=>setPage(i+1)} className={`px-4 py-2 border rounded-lg ${page===i+1?'bg-blue-600 text-white':'hover:bg-gray-100'}`}>{i+1}</button>
        ))}
        <button onClick={()=>setPage(p => Math.min(p+1,totalPages))} disabled={page===totalPages} className="px-4 py-2 border rounded-lg disabled:opacity-50">Next</button>
      </div>
    </div>
  )
}
