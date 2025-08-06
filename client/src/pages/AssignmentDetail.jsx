// src/pages/AssignmentDetail.jsx
import React, { useEffect, useState, useContext, useMemo, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import API from '../api/api.js'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { AuthContext } from '../contexts/AuthContext.jsx'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Users, 
  Globe, 
  CheckCircle2,
  AlertTriangle,
  FileText,
  Code,
  Lightbulb,
  Award,
  Star,
  RefreshCw,
  Play,
  BookOpen,
  Timer
} from 'lucide-react'

export default function AssignmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [refreshing, setRefreshing] = useState(false)

  // All hooks at top level
  const { data: assignment, isLoading, error, refetch } = useQuery(
    ['assignment', id],
    () => API.get(`/assignments/${id}`).then(r => {
      console.debug('[AssignmentDetail] fetched assignment:', r.data.data?.title)
      return r.data.data
    }),
    { 
      staleTime: 300000,
      refetchOnWindowFocus: true,
      retry: 2 
    }
  )

  // Memoized calculations
  const assignmentStats = useMemo(() => {
    if (!assignment) return null
    
    return {
      totalQuestions: assignment.questions?.length || 0,
      mcqCount: assignment.questions?.filter(q => q.type === 'mcq').length || 0,
      msqCount: assignment.questions?.filter(q => q.type === 'msq').length || 0,
      descriptiveCount: assignment.questions?.filter(q => q.type === 'descriptive').length || 0,
      totalSubmissions: assignment.submissions?.length || 0,
      isExpired: assignment.dueDate ? new Date(assignment.dueDate) < new Date() : false,
      timeRemaining: assignment.dueDate ? Math.max(0, new Date(assignment.dueDate) - new Date()) : null
    }
  }, [assignment])

  const userSubmission = useMemo(() => {
    if (!assignment?.submissions || !user) return null
    return assignment.submissions.find(sub => sub.student._id === user._id)
  }, [assignment?.submissions, user?._id])

  // Callbacks
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }, [refetch])

  const handleBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  const getQuestionTypeColor = useCallback((type) => {
    switch(type) {
      case 'mcq': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'msq': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'descriptive': return 'bg-green-100 text-green-800 border-green-200'
      case 'image': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }, [])

  const getModeColor = useCallback((mode) => {
    switch(mode) {
      case 'quiz': return 'from-purple-500 to-pink-500'
      case 'test': return 'from-red-500 to-orange-500'
      default: return 'from-blue-500 to-indigo-500'
    }
  }, [])

  const formatDateTime = useCallback((dt) => {
    return dt ? format(new Date(dt), 'PPP p') : '—'
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Assignment</h2>
            <p className="text-gray-500">Fetching assignment details...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-xl p-12 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Assignment Not Found</h2>
          <p className="text-red-600 mb-6">Unable to load assignment details</p>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="mr-2" size={20} />
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const {
    title, description,
    questions = [],
    visibleToAll, visibleTo = [],
    startDate, dueDate,
    status, isDispatched, dispatchDate, mode,
    createdBy,
    submissions = [],
    createdAt, updatedAt
  } = assignment

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} size={20} />
            Refresh
          </button>
        </div>

        {/* Assignment Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className={`bg-gradient-to-r ${getModeColor(mode)} p-8 text-white relative`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-bold rounded-full border border-white/30">
                    {mode?.toUpperCase() || 'ASSIGNMENT'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {status?.toUpperCase()}
                  </span>
                </div>
                
                <h1 className="text-4xl font-bold mb-3">{title}</h1>
                {description && (
                  <p className="text-xl text-white/90 leading-relaxed max-w-3xl">{description}</p>
                )}
              </div>

              {assignmentStats?.totalQuestions && (
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                  <div className="text-3xl font-bold mb-2">{assignmentStats.totalQuestions}</div>
                  <div className="text-white/80">Questions</div>
                </div>
              )}
            </div>
          </div>

          {/* Assignment Metadata */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Created by</div>
                  <div className="font-semibold">{createdBy?.name || createdBy?.email || '—'}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Created</div>
                  <div className="font-semibold">{format(new Date(createdAt), 'PPP')}</div>
                </div>
              </div>

              {startDate && (
                <div className="flex items-center gap-3">
                  <Play className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Starts</div>
                    <div className="font-semibold">{formatDateTime(startDate)}</div>
                  </div>
                </div>
              )}

              {dueDate && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Due</div>
                    <div className="font-semibold">{formatDateTime(dueDate)}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                {visibleToAll ? <Globe className="w-5 h-5 text-blue-500" /> : <Users className="w-5 h-5 text-purple-500" />}
                <div>
                  <div className="text-sm text-gray-500">Visibility</div>
                  <div className="font-semibold">{visibleToAll ? 'Public' : 'Restricted'}</div>
                </div>
              </div>

              {!visibleToAll && visibleTo.length > 0 && (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Visible to</div>
                    <div className="font-semibold">{visibleTo.length} student{visibleTo.length > 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}

              {isDispatched && dispatchDate && (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-sm text-gray-500">Dispatched</div>
                    <div className="font-semibold">{format(new Date(dispatchDate), 'PPP')}</div>
                  </div>
                </div>
              )}

              {assignmentStats?.totalSubmissions > 0 && (
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Submissions</div>
                    <div className="font-semibold">{assignmentStats.totalSubmissions}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {assignmentStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{assignmentStats.mcqCount}</div>
                  <div className="text-sm text-gray-500">MCQ Questions</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{assignmentStats.msqCount}</div>
                  <div className="text-sm text-gray-500">MSQ Questions</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{assignmentStats.descriptiveCount}</div>
                  <div className="text-sm text-gray-500">Descriptive</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{assignmentStats.totalSubmissions}</div>
                  <div className="text-sm text-gray-500">Submissions</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Questions Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
            <span className="text-gray-600">{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
          </div>

          {questions.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Questions Added</h3>
              <p className="text-gray-500">This assignment doesn't have any questions yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((q, i) => (
                <div key={q._id} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                  {/* Question Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          {i + 1}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Question {i + 1}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getQuestionTypeColor(q.type)}`}>
                        {q.type.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="p-8 space-y-6">
                    <div className="prose prose-lg max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: q.content }} />
                    </div>

                    {/* MCQ/MSQ Options */}
                    {(['mcq', 'msq'].includes(q.type) && q.options) && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          Answer Options
                        </h4>
                        <div className="space-y-2">
                          {q.options.map(opt => (
                            <div key={opt.id} className={`p-4 rounded-2xl border-2 transition-all ${
                              q.correctAnswers?.includes(opt.id)
                                ? 'bg-green-50 border-green-300 shadow-lg shadow-green-100'
                                : 'bg-gray-50 border-gray-200'
                            }`}>
                              <div className="flex items-start gap-3">
                                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                  q.correctAnswers?.includes(opt.id)
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-300 text-gray-700'
                                }`}>
                                  {opt.id}
                                </span>
                                <span className="text-gray-800 font-medium">{opt.text}</span>
                                {q.correctAnswers?.includes(opt.id) && (
                                  <CheckCircle2 className="text-green-500 ml-auto flex-shrink-0" size={20} />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Test Cases */}
                    {(q.testCases && q.testCases.length > 0) && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Code className="w-5 h-5" />
                          Test Cases ({q.testCases.length})
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="text-left py-3 px-4 font-semibold text-gray-700 rounded-tl-xl border-b">Input</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700 rounded-tr-xl border-b">Expected Output</th>
                              </tr>
                            </thead>
                            <tbody>
                              {q.testCases.map((tc, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                                  <td className="py-3 px-4">
                                    <code className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg font-mono text-sm block">
                                      {tc.input}
                                    </code>
                                  </td>
                                  <td className="py-3 px-4">
                                    <code className="bg-green-50 text-green-800 px-3 py-2 rounded-lg font-mono text-sm block">
                                      {tc.expected}
                                    </code>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" />
                          Explanation
                        </h4>
                        <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
                          <div className="prose max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: q.explanation }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Submission Section */}
        {userSubmission && user?.role === 'student' && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Award className="mr-3" size={28} />
                Your Submission
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-2xl">
                  <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-sm text-blue-600 mb-1">Submitted</div>
                  <div className="font-bold text-blue-900">{formatDateTime(userSubmission.submittedAt)}</div>
                </div>
                
                <div className="text-center p-6 bg-green-50 rounded-2xl">
                  <Star className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <div className="text-sm text-green-600 mb-1">Grade</div>
                  <div className="font-bold text-green-900 text-2xl">
                    {userSubmission.grade != null ? `${userSubmission.grade}/${questions.length}` : 'Pending'}
                  </div>
                </div>
                
                {userSubmission.grade != null && (
                  <div className="text-center p-6 bg-purple-50 rounded-2xl">
                    <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                    <div className="text-sm text-purple-600 mb-1">Percentage</div>
                    <div className="font-bold text-purple-900 text-2xl">
                      {Math.round((userSubmission.grade / questions.length) * 100)}%
                    </div>
                  </div>
                )}
              </div>

              {userSubmission.feedback && (
                <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Mentor Feedback
                  </h3>
                  <p className="text-blue-800 leading-relaxed">{userSubmission.feedback}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}