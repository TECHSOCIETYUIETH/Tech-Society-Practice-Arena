// src/pages/AssignmentList.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import API from '../api/api.js'
import { parseISO, isBefore, isAfter, isWithinInterval } from 'date-fns'

import { 
  Edit2, Trash2, Eye, Plus, Search, Filter, Calendar, Clock,
  Users, Globe, AlertTriangle, FileText, RefreshCw, ChevronLeft,
  ChevronRight, BookOpen, Award
} from 'lucide-react'
import { format } from 'date-fns'

export default function AssignmentList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // ─── State Hooks ─────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [visibleFilter, setVisibleFilter] = useState('')
  const [modeFilter, setModeFilter] = useState('')
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const perPage = 12

  // ─── Data Fetch ─────────────────────────────────────────
  const { data: assignments = [], error, isLoading, refetch } = useQuery(
    'assignments',
    () => API.get('/assignments').then(r => r.data.data),
    { staleTime: 300_000, refetchOnWindowFocus: true, retry: 2 }
  )


//   calculate status 
  const getComputedStatus = useCallback((startStr, endStr) => {
  const now = new Date()
  const start = startStr ? parseISO(startStr) : null
  const end   = endStr   ? parseISO(endStr)   : null

  if (start && isBefore(now, start))                return 'upcoming'
  if (end   && isAfter(now, end))                    return 'expired'
  if (start && end && isWithinInterval(now, { start, end })) return 'active'

  // fallback: if only end exists and we’re before it, active
  if (!start && end && isBefore(now, end))           return 'active'
  // otherwise
  return 'upcoming'
}, [])


  useEffect(() => {
    if (error) toast.error('Failed to load assignments')
  }, [error])

  // ─── Callbacks ──────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try { await refetch() } finally { setRefreshing(false) }
  }, [refetch])

  const handleDelete = useCallback(async (a) => {
    if (!confirm(`Delete "${a.title}"? This action cannot be undone.`)) return
    setDeletingId(a._id)
    try {
      await API.delete(`/assignments/${a._id}`)
      toast.success('Assignment deleted successfully')
      queryClient.invalidateQueries('assignments')
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeletingId(null)
    }
  }, [queryClient])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setStatusFilter('')
    setVisibleFilter('')
    setModeFilter('')
    setSortKey('createdAt')
    setSortAsc(false)
    setPage(1)
  }, [])

  const getAssignmentIcon = useCallback(m => m === 'quiz' ? BookOpen : m === 'test' ? Award : FileText, [])
  const getModeColor      = useCallback(m => m === 'quiz' ? 'from-purple-500 to-pink-500' : m === 'test' ? 'from-red-500 to-orange-500' : 'from-blue-500 to-indigo-500', [])
  const getStatusColor    = useCallback(s => s === 'open' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200', [])

  // ─── Filtering & Sorting ─────────────────────────────────
  const filteredAndSorted = useMemo(() => {
    let arr = [...assignments]

    if (searchTerm) {
      const t = searchTerm.toLowerCase()
      arr = arr.filter(a =>
        a.title.toLowerCase().includes(t) ||
        a.description?.toLowerCase().includes(t) ||
        a.createdBy?.name?.toLowerCase().includes(t) ||
        a.createdBy?.email?.toLowerCase().includes(t)
      )
    }
    if (statusFilter)    arr = arr.filter(a => a.status === statusFilter)
    if (visibleFilter === 'all')      arr = arr.filter(a => a.visibleToAll)
    else if (visibleFilter === 'selected') arr = arr.filter(a => !a.visibleToAll)
    if (modeFilter)      arr = arr.filter(a => a.mode === modeFilter)

    arr.sort((a,b) => {
      let va, vb
      if (sortKey === 'title') {
        va = a.title.toLowerCase(); vb = b.title.toLowerCase()
      } else if (sortKey === 'questions') {
        va = a.questions?.length||0; vb = b.questions?.length||0
      } else {
        va = new Date(a[sortKey]||a.createdAt)
        vb = new Date(b[sortKey]||b.createdAt)
      }
      if (va < vb) return sortAsc ? -1 : 1
      if (va > vb) return sortAsc ? 1 : -1
      return 0
    })

    return arr
  }, [assignments, searchTerm, statusFilter, visibleFilter, modeFilter, sortKey, sortAsc])

  // ─── Pagination Slice ────────────────────────────────────
  const paginationData = useMemo(() => {
    const totalItems = filteredAndSorted.length
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage))
    const start = (page - 1) * perPage
    return {
      totalItems,
      totalPages,
      pageData: filteredAndSorted.slice(start, start + perPage)
    }
  }, [filteredAndSorted, page])

  // ─── Active Filters Summary ──────────────────────────────
  const filterSummary = useMemo(() => {
    const fs = []
    if (searchTerm)   fs.push(`Search: "${searchTerm}"`)
    if (statusFilter) fs.push(`Status: ${statusFilter}`)
    if (visibleFilter)fs.push(`Visibility: ${visibleFilter}`)
    if (modeFilter)   fs.push(`Type: ${modeFilter}`)
    return fs
  }, [searchTerm, statusFilter, visibleFilter, modeFilter])

  // ─── Sections Data ───────────────────────────────────────
  const assignmentsData = filteredAndSorted.filter(a => a.mode === 'assignment')
  const quizzesData     = filteredAndSorted.filter(a => a.mode === 'quiz')
  const testsData       = filteredAndSorted.filter(a => a.mode === 'test')

  // ─── Loading State ───────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="p-6 max-w-7xl mx-auto">
          {/* skeleton loader omitted for brevity */}
        </div>
      </div>
    )
  }

  // ─── JSX ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="p-6 max-w-7xl mx-auto space-y-8">

        {/* Header + Actions */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Assignments</h1>
            <p className="text-gray-600">Manage your assignments, quizzes & tests</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleRefresh} disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing?'animate-spin':''}`}/>
              Refresh
            </button>
            <Link to="/assignments/new"
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-green-500/25"
            >
              <Plus size={20}/> New Assignment
            </Link>
          </div>
        </div>

        {/* Search & Filter Toggle */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
                <input
                  type="text"
                  placeholder="Search title, creator, description..."
                  value={searchTerm}
                  onChange={e=>setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <button onClick={()=>setShowFilters(f=>!f)}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-medium transition-all duration-200 ${
                  showFilters||filterSummary.length>0
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter size={20}/> Filters
                {filterSummary.length>0 && (
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
                    {filterSummary.length}
                  </span>
                )}
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                  <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value); setPage(1)}}
                    className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                  <select value={visibleFilter} onChange={e=>{setVisibleFilter(e.target.value); setPage(1)}}
                    className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Visibility</option>
                    <option value="all">Public</option>
                    <option value="selected">Restricted</option>
                  </select>
                  <select value={modeFilter} onChange={e=>{setModeFilter(e.target.value); setPage(1)}}
                    className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="test">Test</option>
                  </select>
                  <select value={sortKey} onChange={e=>{setSortKey(e.target.value); setPage(1)}}
                    className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="createdAt">Created Date</option>
                    <option value="updatedAt">Updated Date</option>
                    <option value="startDate">Start Date</option>
                    <option value="dueDate">Due Date</option>
                    <option value="title">Title</option>
                    <option value="questions">Question Count</option>
                  </select>
                  <button onClick={()=>{setSortAsc(s=>!s); setPage(1)}} 
                    className="px-4 py-3 border rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    Sort {sortAsc?'↑':'↓'}
                  </button>
                </div>
                {filterSummary.length>0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-sm font-medium text-gray-700">Active:</span>
                    {filterSummary.map((f,i)=>(
                      <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{f}</span>
                    ))}
                    <button onClick={clearFilters} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200">
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Showing {paginationData.pageData.length} of {paginationData.totalItems} total
          </p>
          {paginationData.totalPages>1 && (
            <p className="text-gray-600">Page {page} of {paginationData.totalPages}</p>
          )}
        </div>

        {/* No Results */}
        {paginationData.pageData.length === 0 ? (
            

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
            <FileText className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Results Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters.</p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Assignments Section */}
            {assignmentsData.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Assignments</h2>
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {assignmentsData.map(a => {
                      const status = getComputedStatus(a.startDate, a.dueDate)
                      {console.log("Status valu is: ", status)}
                    const Icon = getAssignmentIcon(a.mode)
                    const isDel = deletingId === a._id
                    return (
                      <div key={a._id} className="group bg-white rounded-3xl shadow-lg border overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                        <div className={`bg-gradient-to-r ${getModeColor(a.mode)} p-6 text-white relative`}>
                          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                          <div className="relative z-10 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Icon className="w-6 h-6"/>
                              </div>
                              <div>
                                <span className="block text-sm font-medium opacity-90">{a.mode.toUpperCase()}</span>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 border ${getStatusColor(a.status)} bg-white/90`}>
                                  {(status || "default").toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{a.title}</h3>
                          <div className="space-y-3 text-sm text-gray-600 flex-1">
                            <div className="flex items-center gap-2"><Users className="w-4 h-4"/> by {a.createdBy?.name||a.createdBy?.email||'Unknown'}</div>
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/> Created {format(new Date(a.createdAt),'MMM dd, yyyy')}</div>
                            {a.startDate && <div className="flex items-center gap-2"><Clock className="w-4 h-4"/> Starts {format(new Date(a.startDate),'MMM dd, yyyy')}</div>}
                            {a.dueDate   && <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Due {format(new Date(a.dueDate),'MMM dd, yyyy')}</div>}
                            <div className="flex items-center gap-2">{a.visibleToAll ? <Globe className="w-4 h-4"/> : <Users className="w-4 h-4"/>} {a.visibleToAll ? 'Public':'Restricted'}</div>
                            <div className="flex items-center gap-2"><FileText className="w-4 h-4"/> {a.questions?.length||0} question{(a.questions?.length||0)!==1?'s':''}</div>
                          </div>
                          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                            <button onClick={()=>navigate(`/assignments/${a._id}`)} className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all">
                              <Eye size={18}/> 
                            </button>
                            <div className="flex items-center gap-2">
                              <Link to={`/assignments/${a._id}/edit`} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                                <Edit2 size={18}/> 
                              </Link>
                              <button onClick={()=>handleDelete(a)} disabled={isDel} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50">
                                {isDel
                                  ? <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin"/>
                                  : <Trash2 size={18}/>
                                } 
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Quizzes Section */}
            {quizzesData.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Quizzes</h2>
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {quizzesData.map(a => {
                    //   const status = getComputedStatus(a.startDate, a.dueDate)
                    const Icon = getAssignmentIcon(a.mode)
                    const isDel = deletingId === a._id
                    return (
                      <div key={a._id} className="group bg-white rounded-3xl shadow-lg border overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                        <div className={`bg-gradient-to-r ${getModeColor(a.mode)} p-6 text-white relative`}>
                          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                          <div className="relative z-10 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Icon className="w-6 h-6"/>
                              </div>
                              <div>
                                <span className="block text-sm font-medium opacity-90">{a.mode.toUpperCase()}</span>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 border ${getStatusColor(a.status)} bg-white/90`}>
                                  {(a.isDispatched?"Live":"Upcoming").toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{a.title}</h3>
                          <div className="space-y-3 text-sm text-gray-600 flex-1">
                            <div className="flex items-center gap-2"><Users className="w-4 h-4"/> by {a.createdBy?.name||a.createdBy?.email||'Unknown'}</div>
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/> Created {format(new Date(a.createdAt),'MMM dd, yyyy')}</div>
                            {a.startDate && <div className="flex items-center gap-2"><Clock className="w-4 h-4"/> Starts {format(new Date(a.startDate),'MMM dd, yyyy')}</div>}
                            {a.dueDate   && <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Due {format(new Date(a.dueDate),'MMM dd, yyyy')}</div>}
                            <div className="flex items-center gap-2">{a.visibleToAll ? <Globe className="w-4 h-4"/> : <Users className="w-4 h-4"/>} {a.visibleToAll ? 'Public':'Restricted'}</div>
                            <div className="flex items-center gap-2"><FileText className="w-4 h-4"/> {a.questions?.length||0} question{(a.questions?.length||0)!==1?'s':''}</div>
                          </div>
                          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                            <button onClick={()=>navigate(`/assignments/${a._id}`)} className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all">
                              <Eye size={18}/> 
                            </button>
                            <div className="flex items-center gap-2">
                              <Link to={`/assignments/${a._id}/edit`} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                                <Edit2 size={18}/> 
                              </Link>
                              <button onClick={()=>handleDelete(a)} disabled={isDel} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50">
                                {isDel
                                  ? <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin"/>
                                  : <Trash2 size={18}/>
                                } 
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Tests Section */}
            {testsData.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tests</h2>
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {testsData.map(a => {
                    //   const status = getComputedStatus(a.startDate, a.dueDate)
                    const Icon = getAssignmentIcon(a.mode)
                    const isDel = deletingId === a._id
                    return (
                      <div key={a._id} className="group bg-white rounded-3xl shadow-lg border overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                        <div className={`bg-gradient-to-r ${getModeColor(a.mode)} p-6 text-white relative`}>
                          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                          <div className="relative z-10 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Icon className="w-6 h-6"/>
                              </div>
                              <div>
                                <span className="block text-sm font-medium opacity-90">{a.mode.toUpperCase()}</span>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 border ${getStatusColor(a.status)} bg-white/90`}>
                                  {(a.isDispatched?"Live":"Upcoming").toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{a.title}</h3>
                          <div className="space-y-3 text-sm text-gray-600 flex-1">
                            <div className="flex items-center gap-2"><Users className="w-4 h-4"/> by {a.createdBy?.name||a.createdBy?.email||'Unknown'}</div>
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/> Created {format(new Date(a.createdAt),'MMM dd, yyyy')}</div>
                            {a.startDate && <div className="flex items-center gap-2"><Clock className="w-4 h-4"/> Starts {format(new Date(a.startDate),'MMM dd, yyyy')}</div>}
                            {a.dueDate   && <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Due {format(new Date(a.dueDate),'MMM dd, yyyy')}</div>}
                            <div className="flex items-center gap-2">{a.visibleToAll ? <Globe className="w-4 h-4"/> : <Users className="w-4 h-4"/>} {a.visibleToAll ? 'Public':'Restricted'}</div>
                            <div className="flex items-center gap-2"><FileText className="w-4 h-4"/> {a.questions?.length||0} question{(a.questions?.length||0)!==1?'s':''}</div>
                          </div>
                          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                            <button onClick={()=>navigate(`/assignments/${a._id}`)} className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all">
                              <Eye size={18}/> 
                            </button>
                            <div className="flex items-center gap-2">
                              <Link to={`/assignments/${a._id}/edit`} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                                <Edit2 size={18}/> 
                              </Link>
                              <button onClick={()=>handleDelete(a)} disabled={isDel} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50">
                                {isDel
                                  ? <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin"/>
                                  : <Trash2 size={18}/>
                                } 
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )}

        {/* Pagination Controls */}
        {paginationData.totalPages > 1 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center justify-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(p - 1, 1))} 
                disabled={page === 1} 
                className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={20}/> Previous
              </button>
              <div className="flex gap-1 mx-4">
                {[...Array(paginationData.totalPages)].map((_, i) => {
                  const num = i + 1
                  const active = page === num
                  const show = (
                    num === 1 ||
                    num === paginationData.totalPages ||
                    (num >= page - 1 && num <= page + 1)
                  )
                  if (!show) {
                    if (num === page - 2 || num === page + 2) {
                      return <span key={i} className="px-2 py-2 text-gray-400">…</span>
                    }
                    return null
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setPage(num)}
                      className={`w-12 h-12 rounded-xl font-semibold transition-all duration-200 ${
                        active
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {num}
                    </button>
                  )
                })}
              </div>
              <button 
                onClick={() => setPage(p => Math.min(p + 1, paginationData.totalPages))} 
                disabled={page === paginationData.totalPages} 
                className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Next <ChevronRight size={20}/>
              </button>
            </div>
            <div className="text-center mt-4 text-sm text-gray-600">
              Showing page {page} of {paginationData.totalPages} • {paginationData.totalItems} total assignments
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
