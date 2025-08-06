// src/pages/AssignmentForm.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import API from '../api/api.js'
import { toast } from 'react-hot-toast'
import { 
  X, 
  Eye, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  Users, 
  Globe, 
  Plus,
  CheckCircle2,
  AlertTriangle,
  Save,
  ArrowLeft,
  BookOpen,
  Code,
  FileText,
  Lightbulb,
  GraduationCap,
  Building
} from 'lucide-react'

export default function AssignmentForm() {
  const { id } = useParams()
  const editMode = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // All state hooks at top level
  const [form, setForm] = useState({
    title: '',
    description: '',
    mode: 'assignment',
    startDate: null,
    dueDate: null,
    timeLimitMinutes: null,
    questions: [],
    visibleToAll: true,
    visibleTo: []
  })
  const [submitting, setSubmitting] = useState(false)
  const [modalQ, setModalQ] = useState(null)
  const [qSearch, setQSearch] = useState('')
  const [qTypeFilter, setQTypeFilter] = useState('')
  const [qDiffFilter, setQDiffFilter] = useState('')
  const [qSortKey, setQSortKey] = useState('createdAt')
  const [qSortAsc, setQSortAsc] = useState(false)
  const [sSearch, setSSearch] = useState('')
  const [sBranchFilter, setSBranchFilter] = useState('')
  const [sYearFilter, setSYearFilter] = useState('')
  const [showQuestionFilters, setShowQuestionFilters] = useState(false)
  const [showStudentFilters, setShowStudentFilters] = useState(false)

  // All useQuery hooks at top level
  const { data: allQuestions = [], isLoading: questionsLoading } = useQuery(
    'questions', 
    () => API.get('/questions').then(r => {
      console.debug('[AssignmentForm] fetched questions:', r.data.data?.length, 'questions')
      return r.data.data
    }),
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2
    }
  )

  const { data: allStudents = [], isLoading: studentsLoading } = useQuery(
    'studentsByRole',
    () => API.get('/users/by-role?role=student').then(r => {
      console.debug('[AssignmentForm] fetched students:', r.data.data?.length, 'students')
      return r.data.data
    }),
    {
      staleTime: 300_000,
      refetchOnWindowFocus: false,
      retry: 2
    }
  )

  // All useEffect hooks at top level
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

  // All useMemo hooks at top level
  const filteredQuestions = useMemo(() => {
    return allQuestions
      .filter(q => {
        const text = q.content.replace(/<[^>]+>/g, '').toLowerCase()
        return text.includes(qSearch.toLowerCase())
      })
      .filter(q => !qTypeFilter || q.type === qTypeFilter)
      .filter(q => !qDiffFilter || q.tags?.difficulty === qDiffFilter)
      .sort((a, b) => {
        let va = a[qSortKey], vb = b[qSortKey]
        if (qSortKey === 'createdAt') {
          va = new Date(va); vb = new Date(vb)
        }
        if (va < vb) return qSortAsc ? -1 : 1
        if (va > vb) return qSortAsc ? 1 : -1
        return 0
      })
  }, [allQuestions, qSearch, qTypeFilter, qDiffFilter, qSortKey, qSortAsc])

  const filteredStudents = useMemo(() => {
    return allStudents.filter(u => {
      // Text search
      const matchesSearch = u.name.toLowerCase().includes(sSearch.toLowerCase()) ||
                           u.email.toLowerCase().includes(sSearch.toLowerCase())
      
      // Branch filter
      const matchesBranch = !sBranchFilter || u.branch === sBranchFilter
      
      // Year filter
      const matchesYear = !sYearFilter || u.year === sYearFilter
      
      return matchesSearch && matchesBranch && matchesYear
    })
  }, [allStudents, sSearch, sBranchFilter, sYearFilter])

  const selectedQuestions = useMemo(() => {
    return allQuestions.filter(q => form.questions.includes(q._id))
  }, [allQuestions, form.questions])

  const selectedStudents = useMemo(() => {
    return allStudents.filter(u => form.visibleTo.includes(u._id))
  }, [allStudents, form.visibleTo])

  // Get unique branches and years for filters
  const availableBranches = useMemo(() => {
    const branches = [...new Set(allStudents.map(s => s.branch).filter(Boolean))]
    return branches.sort()
  }, [allStudents])

  const availableYears = useMemo(() => {
    const years = [...new Set(allStudents.map(s => s.year).filter(Boolean))]
    return years.sort()
  }, [allStudents])

  // All useCallback hooks at top level
  const toggleQuestion = useCallback((qid) => {
    setForm(f => ({
      ...f,
      questions: f.questions.includes(qid)
        ? f.questions.filter(x => x !== qid)
        : [...f.questions, qid]
    }))
  }, [])

  const toggleStudent = useCallback((sid) => {
    setForm(f => ({
      ...f,
      visibleTo: f.visibleTo.includes(sid)
        ? f.visibleTo.filter(x => x !== sid)
        : [...f.visibleTo, sid]
    }))
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (form.questions.length === 0) {
      toast.error('Please add at least one question')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...form,
        visibleTo: form.visibleToAll ? [] : form.visibleTo
      }
      
      if (editMode) {
        await API.put(`/assignments/${id}`, payload)
        toast.success('Assignment updated successfully!')
        queryClient.invalidateQueries(['assignment', id])
      } else {
        await API.post('/assignments', payload)
        toast.success('Assignment created successfully!')
      }
      
      queryClient.invalidateQueries('assignments')
      navigate('/assignments')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }, [form, editMode, id, navigate, queryClient])

  const toLocalString = useCallback((d) => {
    return d ? d.toISOString().slice(0, 16) : ''
  }, [])

  const getQuestionTypeIcon = useCallback((type) => {
    switch(type) {
      case 'mcq': return BookOpen
      case 'msq': return CheckCircle2
      case 'descriptive': return FileText
      case 'image': return Eye
      default: return BookOpen
    }
  }, [])

  const getQuestionTypeColor = useCallback((type) => {
    switch(type) {
      case 'mcq': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'msq': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'descriptive': return 'bg-green-100 text-green-800 border-green-200'
      case 'image': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }, [])

  // Loading state
  if (questionsLoading || studentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Form</h2>
            <p className="text-gray-500">Preparing questions and students...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/assignments')}
              className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 font-medium"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Assignments
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {editMode ? 'Edit Assignment' : 'Create Assignment'}
              </h1>
              <p className="text-gray-600 mt-1">
                {editMode ? 'Update assignment details and questions' : 'Build a new assignment for your students'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Information */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">Basic Information</h2>
            </div>
            <div className="p-8 space-y-6">
              
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assignment Title *
                </label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Enter assignment title..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  placeholder="Describe the assignment objectives..."
                />
              </div>

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assignment Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'assignment', label: 'Assignment', desc: 'Regular assignment with flexible timing', icon: FileText },
                    { value: 'quiz', label: 'Quiz', desc: 'Quick assessment with time limit', icon: Clock },
                    { value: 'test', label: 'Test', desc: 'Formal examination with strict timing', icon: AlertTriangle }
                  ].map(type => {
                    const Icon = type.icon
                    return (
                      <label key={type.value} className={`relative flex items-start p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                        form.mode === type.value 
                          ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-200' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="mode"
                          value={type.value}
                          checked={form.mode === type.value}
                          onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}
                          className="sr-only"
                        />
                        <div className="flex items-start gap-3">
                          <Icon className={`w-6 h-6 mt-1 ${form.mode === type.value ? 'text-blue-600' : 'text-gray-400'}`} />
                          <div>
                            <div className="font-semibold text-gray-900">{type.label}</div>
                            <div className="text-sm text-gray-600">{type.desc}</div>
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Timing Configuration */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {form.mode === 'assignment' ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        Start Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={toLocalString(form.startDate)}
                        onChange={e => {
                          const v = e.target.value
                          setForm(f => ({ ...f, startDate: v ? new Date(v) : null }))
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Clock className="inline w-4 h-4 mr-1" />
                        Due Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={toLocalString(form.dueDate)}
                        onChange={e => {
                          const v = e.target.value
                          setForm(f => ({ ...f, dueDate: v ? new Date(v) : null }))
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </>
                ) : (
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Clock className="inline w-4 h-4 mr-1" />
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 30"
                      value={form.timeLimitMinutes || ''}
                      onChange={e => setForm(f => ({
                        ...f,
                        timeLimitMinutes: e.target.value ? parseInt(e.target.value, 10) : null
                      }))}
                      className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Question Selection */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Questions</h2>
                <div className="flex items-center gap-4">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    {form.questions.length} selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQuestionFilters(!showQuestionFilters)}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Filter size={16} />
                    Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Question Filters */}
            {showQuestionFilters && (
              <div className="bg-purple-50 border-b border-purple-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      placeholder="Search questions..."
                      value={qSearch}
                      onChange={e => setQSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={qTypeFilter}
                    onChange={e => setQTypeFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    Sort by Date {qSortAsc ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            )}

            <div className="p-8">
              {/* Selected Questions Summary */}
              {selectedQuestions.length > 0 && (
                <div className="mb-8 p-6 bg-purple-50 rounded-2xl border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 size={20} />
                    Selected Questions ({selectedQuestions.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedQuestions.map(q => {
                      const text = q.content.replace(/<[^>]+>/g, '')
                      const preview = text.length > 60 ? text.slice(0, 60) + '…' : text
                      return (
                        <div key={q._id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-purple-200">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getQuestionTypeColor(q.type)}`}>
                            {q.type.toUpperCase()}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{preview}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleQuestion(q._id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Question Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredQuestions.map(q => {
                  const text = q.content.replace(/<[^>]+>/g, '')
                  const preview = text.length > 100 ? text.slice(0, 100) + '…' : text
                  const selected = form.questions.includes(q._id)
                  const Icon = getQuestionTypeIcon(q.type)
                  
                  return (
                    <div
                      key={q._id}
                      onClick={() => toggleQuestion(q._id)}
                      className={`relative p-4 border-2 rounded-2xl cursor-pointer transition-all group ${
                        selected 
                          ? 'border-purple-400 bg-purple-50 shadow-lg shadow-purple-200' 
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getQuestionTypeColor(q.type)}`}>
                          <Icon className="inline w-3 h-3 mr-1" />
                          {q.type.toUpperCase()}
                        </span>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation()
                            setModalQ(q)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white rounded-lg"
                          title="Preview Question"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{preview}</p>
                      
                      {q.tags?.difficulty && (
                        <span className={`inline-block mt-3 px-2 py-1 rounded-full text-xs font-medium ${
                          q.tags.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                          q.tags.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {q.tags.difficulty}
                        </span>
                      )}

                      {selected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-6 h-6 text-purple-600 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {filteredQuestions.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Questions Found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria or filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Visibility Settings */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Visibility Settings</h2>
                {!form.visibleToAll && (
                  <div className="flex items-center gap-4">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                      {form.visibleTo.length} students selected
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowStudentFilters(!showStudentFilters)}
                      className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Filter size={16} />
                      Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-8 space-y-6">
              
              {/* Visibility Toggle */}
              <div className="flex items-start space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.visibleToAll}
                    onChange={e => setForm(f => ({ ...f, visibleToAll: e.target.checked }))}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-900 flex items-center gap-2">
                    <Globe size={20} />
                    Visible to all students
                  </label>
                  <p className="text-gray-600 text-sm mt-1">
                    When enabled, all students can see and attempt this assignment
                  </p>
                </div>
              </div>

              {/* Student Selection */}
              {!form.visibleToAll && (
                <div className="space-y-4 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Select Students</h3>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      {form.visibleTo.length} selected
                    </span>
                  </div>
                  
                  {/* Student Filters */}
                  {showStudentFilters && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            placeholder="Search students..."
                            value={sSearch}
                            onChange={e => setSSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        
                        <select
                          value={sBranchFilter}
                          onChange={e => setSBranchFilter(e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">All Branches</option>
                          {availableBranches.map(branch => (
                            <option key={branch} value={branch}>{branch}</option>
                          ))}
                        </select>
                        
                        <select
                          value={sYearFilter}
                          onChange={e => setSYearFilter(e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">All Years</option>
                          {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {!showStudentFilters && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        placeholder="Search students..."
                        value={sSearch}
                        onChange={e => setSSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  )}
                  
                  {/* Selected Students Summary */}
                  {selectedStudents.length > 0 && (
                    <div className="p-4 bg-white rounded-xl border border-green-200">
                      <h4 className="font-medium text-green-900 mb-3">Selected Students:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudents.map(s => (
                          <span key={s._id} className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            {s.name}
                            <button
                              type="button"
                              onClick={() => toggleStudent(s._id)}
                              className="hover:bg-green-200 rounded-full p-0.5"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Student Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                    {filteredStudents.map(s => {
                      const selected = form.visibleTo.includes(s._id)
                      return (
                        <div
                          key={s._id}
                          onClick={() => toggleStudent(s._id)}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            selected 
                              ? 'border-green-400 bg-green-50 shadow-lg shadow-green-200' 
                              : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 truncate">{s.name}</div>
                              <div className="text-sm text-gray-600 truncate">{s.email}</div>
                              <div className="flex items-center gap-4 mt-1">
                                {s.branch && (
                                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                    <Building size={12} />
                                    {s.branch}
                                  </span>
                                )}
                                {s.year && (
                                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                    <GraduationCap size={12} />
                                    {s.year}
                                  </span>
                                )}
                              </div>
                            </div>
                            {selected && (
                              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* No students message */}
                  {filteredStudents.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-lg font-medium text-gray-700 mb-1">No Students Found</h4>
                      <p className="text-gray-500 text-sm">
                        {sSearch || sBranchFilter || sYearFilter 
                          ? 'Try adjusting your search or filter criteria' 
                          : 'No students available for selection'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/assignments')}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || form.questions.length === 0}
              className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{editMode ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>{editMode ? 'Update Assignment' : 'Create Assignment'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Question Detail Modal */}
        {modalQ && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Question Preview</h3>
                <button
                  onClick={() => setModalQ(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-6">
                  {/* Question Type Badge */}
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border ${getQuestionTypeColor(modalQ.type)}`}>
                    {React.createElement(getQuestionTypeIcon(modalQ.type), { size: 16 })}
                    {modalQ.type.toUpperCase()}
                  </span>
                  
                  {/* Question Content */}
                  <div className="prose prose-lg max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: modalQ.content }} />
                  </div>
                  
                  {/* Options */}
                  {modalQ.options?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Answer Options:</h4>
                      <div className="space-y-2">
                        {modalQ.options.map(o => (
                          <div key={o.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                            <span className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-sm">
                              {o.id}
                            </span>
                            <span className="text-gray-800">{o.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Explanation */}
                  {modalQ.explanation && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Lightbulb size={20} />
                        Explanation:
                      </h4>
                      <div className="prose max-w-none bg-yellow-50 p-4 rounded-xl">
                        <div dangerouslySetInnerHTML={{ __html: modalQ.explanation }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}