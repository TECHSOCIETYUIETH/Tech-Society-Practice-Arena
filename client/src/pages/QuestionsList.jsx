import React, { useState, useMemo, useEffect } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import API from '../api/api.js'
import { Edit2, Trash2, Eye } from 'lucide-react'
import { format } from 'date-fns'

export default function QuestionsList() {
  // 1. Data fetch
  const { data: questions = [], error, isLoading, refetch } = useQuery(
    'questions',
    () => API.get('/questions').then(r => r.data.data),
    {
      staleTime: 300000,
      refetchOnWindowFocus: false,
      retry: false
    }
  )

  // 2. Filters & sort state
  const [filterType, setFilterType] = useState('')
  const [filterDiff, setFilterDiff] = useState('')
  const [filterTag, setFilterTag]   = useState('')
  const [sortAsc, setSortAsc]       = useState(false)
  const [page, setPage]             = useState(1)
  const perPage = 8

  // 3. Processed list
  const processed = useMemo(() => {
    let arr = [...questions]
    if (filterType)  arr = arr.filter(q => q.type === filterType)
    if (filterDiff)  arr = arr.filter(q => q.tags.difficulty === filterDiff)
    if (filterTag) {
      const ft = filterTag.toLowerCase()
      arr = arr.filter(q =>
        q.tags.topics?.some(t => t.toLowerCase().includes(ft))
      )
    }
    arr.sort((a,b) => {
      const va = new Date(a.createdAt)
      const vb = new Date(b.createdAt)
      if (va < vb) return sortAsc ? -1 : 1
      if (va > vb) return sortAsc ? 1  : -1
      return 0
    })
    return arr
  }, [questions, filterType, filterDiff, filterTag, sortAsc])

  const totalPages = Math.max(1, Math.ceil(processed.length / perPage))
  const pageData   = processed.slice((page-1)*perPage, page*perPage)

  // 4. Error toast
  useEffect(() => { if (error) toast.error('Failed to load questions') }, [error])

  // 5. Loading guard
  if (isLoading) return <p className="p-6 text-center">Loading…</p>

  // Difficulty color map
  const diffClasses = {
    beginner:     'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced:     'bg-red-100 text-red-800'
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-semibold">Question Bank</h2>
        <Link to="/questions/new" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
          + New Question
        </Link>
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-wrap gap-4">
        <select value={filterType} onChange={e=>setFilterType(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">All Types</option>
          {['mcq','msq','descriptive','image'].map(t=><option key={t} value={t}>{t.toUpperCase()}</option>)}
        </select>
        <select value={filterDiff} onChange={e=>setFilterDiff(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">All Difficulties</option>
          {['beginner','intermediate','advanced'].map(d=><option key={d} value={d}>{d}</option>)}
        </select>
        <input
          type="text"
          placeholder="Filter by topic"
          value={filterTag}
          onChange={e=>setFilterTag(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button onClick={()=>setSortAsc(sa=>!sa)} className="border px-3 py-2 rounded">
          Sort by Date {sortAsc ? '↑' : '↓'}
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {pageData.map(q => (
          <div key={q._id} className="relative bg-white rounded-lg shadow p-4 flex flex-col justify-between">
            {/* Difficulty badge */}
            <span className={`absolute bottom-4 left-4 px-2 py-1 text-xs font-semibold rounded-full ${diffClasses[q.tags.difficulty] || diffClasses.beginner}`}>
              {q.tags.difficulty}
            </span>

            <div className="space-y-2">
              <p className="font-medium line-clamp-2 overflow-hidden" dangerouslySetInnerHTML={{ __html: q.content }} />
              <div className="text-sm text-gray-500 flex flex-wrap gap-2">
                <span className="uppercase">{q.type}</span>
                <span>By {q.tags.creator?.name || '—'}</span>
                <span>Created: {format(new Date(q.createdAt), 'PP p')}</span>
              </div>
              {q.type==='image' && q.images[0] && (
                <img src={q.images[0].url} alt={q.images[0].caption} className="mt-2 w-full h-32 object-contain rounded" />
              )}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Link to={`/questions/${q._id}`} title="View" className="p-2 hover:bg-gray-100 rounded"><Eye size={16}/></Link>
              <Link to={`/questions/${q._id}/edit`} title="Edit" className="p-2 hover:bg-gray-100 rounded"><Edit2 size={16}/></Link>
              <button onClick={async()=>{
                    if(!confirm('Delete this question?')) return
                    try{ await API.delete(`/questions/${q._id}`); toast.success('Deleted'); refetch() }
                    catch{ toast.error('Delete failed') }
                  }} title="Delete" className="p-2 hover:bg-gray-100 rounded">
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 py-4">
        <button onClick={()=>setPage(p=>Math.max(p-1,1))} disabled={page===1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
        {[...Array(totalPages)].map((_,i)=>(
          <button key={i} onClick={()=>setPage(i+1)} className={`px-3 py-1 border rounded ${page===i+1?'bg-blue-600 text-white':'hover:bg-gray-100'}`}>{i+1}</button>
        ))}
        <button onClick={()=>setPage(p=>Math.min(p+1,totalPages))} disabled={page===totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  )
}
