// src/pages/MentorDashboard.jsx
import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import API from '../api/api.js'
import { AuthContext } from '../contexts/AuthContext.jsx'
import { formatDistanceToNowStrict, format,parseISO, isBefore, isAfter, isWithinInterval  } from 'date-fns'
import { toast } from 'react-hot-toast'
import {
  Users,
  BookOpen,
  Award,
  Clock,
  Eye,
  Send,
  RotateCcw,
  Calendar,
  TrendingUp,
  Activity,
  FileText,
  Zap,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Star,
  Crown,
  RefreshCw,
  GraduationCap,
  Target,
  BarChart3,
  Sparkles,
  Lock,
  Mail
} from 'lucide-react'

export default function MentorDashboard() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [now, setNow] = useState(new Date())
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)



//   compute status
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





  // ⚡ Optimized timer with cleanup
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  // 📊 Dashboard stats query with optimization
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery(
    'dashboardStats', 
    () => API.get('/stats/dashboard').then(r => {
      console.debug('[MentorDashboard] fetched stats:', Object.keys(r.data.data || {}))
      return r.data.data
    }),
    { 
      staleTime: 300_000, 
      enabled: !!(user && (user.role === 'mentor' || user.role === 'admin')),
      refetchOnWindowFocus: true,
      refetchOnMount: false,
      retry: 2
    }
  )

  // 📚 Assignments query with optimization
  const { data: items = [], isLoading: itemsLoading, refetch: refetchAssignments } = useQuery(
    'allAssignments',
    () => API.get('/assignments').then(r => {
      console.debug('[MentorDashboard] fetched assignments:', r.data.data?.length, 'items')
      return r.data.data
    }),
    { 
      staleTime: 300000, 
      refetchOnWindowFocus: true,
      refetchOnMount: false,
      retry: 2
    }
  )

   // status counter:

  // 🔄 Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all([refetchStats(), refetchAssignments()])
      toast.success('Dashboard refreshed!')
    } catch (error) {
      toast.error('Failed to refresh dashboard')
    } finally {
      setRefreshing(false)
    }
  }, [refetchStats, refetchAssignments])

  // 🚀 Optimized dispatch mutation
  const dispatchMut = useMutation(
    ({ id, action }) => API.put(`/assignments/${id}/${action}`),
    {
      onSuccess: (_, { action }) => {
        const actionText = action === 'dispatch' ? 'dispatched' : 'pulled back'
        toast.success(`Assignment ${actionText} successfully!`)
        qc.invalidateQueries('allAssignments')
        qc.invalidateQueries('dashboardStats')
      },
      onError: (error) => {
        toast.error(`Failed to update assignment: ${error.message}`)
      }
    }
  )

  // 🎯 Memoized data processing for performance
  const processedData = useMemo(() => {
    const drafts = items.filter(a => !a.isDispatched)
    const dispatched = items.filter(a => a.isDispatched)
    
    return {
      drafts,
      dispatched,
      assignments: dispatched.filter(a => a.mode === 'assignment'),
      quizzes: dispatched.filter(a => a.mode === 'quiz'),
      tests: dispatched.filter(a => a.mode === 'test')
    }
  }, [items])

  // 📈 Memoized dashboard metrics
  const dashboardMetrics = useMemo(() => {
    if (!stats) return null

    return {
      totalContent: (stats.totalAssignments || 0) + (stats.totalQuizzes || 0) + (stats.totalTests || 0),
      recentActivity: processedData.dispatched.filter(a => {
        const createdDate = new Date(a.createdAt)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return createdDate > sevenDaysAgo
      }).length,
      draftsPending: processedData.drafts.length,
      liveContent: processedData.dispatched.length
    }
  }, [stats, processedData])

  // 🎨 Style helpers
  const getModeIcon = useCallback((mode) => ({
    assignment: BookOpen,
    quiz: Award,
    test: Clock
  }[mode] || BookOpen), [])

  const getModeColor = useCallback((mode) => ({
    assignment: 'from-blue-500 to-cyan-500',
    quiz: 'from-purple-500 to-pink-500',  
    test: 'from-red-500 to-orange-500'
  }[mode] || 'from-blue-500 to-cyan-500'), [])

  const getTabConfig = useCallback((tabId) => ({
    overview: { 
      icon: BarChart3, 
      label: 'Overview', 
      color: 'blue',
      gradient: 'from-blue-600 to-cyan-600' 
    },
    drafts: { 
      icon: FileText, 
      label: 'Drafts', 
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500' 
    },
    live: { 
      icon: Zap, 
      label: 'Live Content', 
      color: 'green',
      gradient: 'from-green-500 to-emerald-500' 
    },
    leaderboard: { 
      icon: Trophy, 
      label: 'Leaderboard', 
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500' 
    }
  }[tabId]), [])

 // inside MentorDashboard.jsx, replace your existing renderCard with:

const renderCard = useCallback((a, isDraft = false) => {
  const ModeIcon = getModeIcon(a.mode)
  const badge = (a.mode || 'assignment').toUpperCase()
  const created = new Date(a.createdAt)
  const dueDate = a.dueDate && new Date(a.dueDate)
  const timeLeft = (['quiz', 'test'].includes(a.mode) && dueDate)
    ? formatDistanceToNowStrict(dueDate, { unit: 'second' })
    : null

  const action = isDraft ? 'dispatch' : 'undispatch'
  const btnText = isDraft ? 'Dispatch' : 'Pull Back'
  const btnColor = isDraft ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'

  return (
    <div key={a._id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ModeIcon className="w-5 h-5 text-gray-500" />
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                a.mode === 'quiz' ? 'bg-purple-100 text-purple-700' :
                a.mode === 'test' ? 'bg-orange-100 text-orange-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {badge}
              </span>
              {isDraft && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  DRAFT
                </span>
              )}
            </div>
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
              {a.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">Created {formatDistanceToNowStrict(created)} ago</p>
            {timeLeft && <p className="text-xs text-gray-400">Due in {timeLeft}</p>}
          </div>
          <button
            onClick={() => dispatchMut.mutate({ id: a._id, action })}
            disabled={dispatchMut.isLoading}
            className={`px-4 py-2 rounded-lg font-medium text-sm text-white shadow-lg shadow-gray-200 transition-all duration-200 ${btnColor}`}
          >
            {btnText}
          </button>
        </div>
        <button
          onClick={() => navigate(`/assignments/${a._id}`)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors group"
        >
          <Eye className="mr-2 group-hover:scale-110 transition-transform" size={16} />
          Preview
        </button>
      </div>
    </div>
  )
}, [dispatchMut, getModeIcon, navigate])


  // 🔒 Loading state
  if (statsLoading || itemsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Mentor Dashboard</h2>
            <p className="text-gray-500">Fetching your latest statistics and assignments...</p>
          </div>
        </div>
      </div>
    )
  }

  // 🚫 Access control
  if (!(user?.role === 'mentor' || user?.role === 'admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-xl p-12 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-red-600">Mentor or Admin access required</p>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Enhanced Header */}
        <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-36 -translate-x-36"></div>
          </div>
          
          <div className="relative z-10 p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border-2 border-white/30 shadow-xl">
                  <span className="text-3xl font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'M'}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-3">Welcome, {user?.name}!</h1>
                  <div className="flex flex-wrap items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span className="text-sm">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown size={16} />
                      <span className="text-sm font-medium">Mentor Dashboard</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/15 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/25 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && dashboardMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{stats.totalStudents || 0}</span>
              </div>
              <h3 className="font-semibold text-gray-700 text-sm">Total Students</h3>
              <p className="text-xs text-gray-500 mt-1">Active learners</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{dashboardMetrics.totalContent}</span>
              </div>
              <h3 className="font-semibold text-gray-700 text-sm">Total Content</h3>
              <p className="text-xs text-gray-500 mt-1">Assignments & Tests</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{dashboardMetrics.liveContent}</span>
              </div>
              <h3 className="font-semibold text-gray-700 text-sm">Live Content</h3>
              <p className="text-xs text-gray-500 mt-1">Currently active</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{dashboardMetrics.recentActivity}</span>
              </div>
              <h3 className="font-semibold text-gray-700 text-sm">This Week</h3>
              <p className="text-xs text-gray-500 mt-1">Recent activity</p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
          <nav className="flex space-x-2 overflow-x-auto">
            {['overview', 'drafts', 'live', 'leaderboard'].map(tabId => {
              const config = getTabConfig(tabId)
              const TabIcon = config.icon
              
              return (
                <button
                  key={tabId}
                  onClick={() => setActiveTab(tabId)}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tabId
                      ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <TabIcon className="mr-2" size={20} />
                  <span>{config.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Dispatch Status Overview */}
              {stats?.dispatched && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stats.dispatched.map(d => (
                    <div key={d._id} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          d._id === 'assignment' ? 'bg-blue-100' :
                          d._id === 'quiz' ? 'bg-purple-100' : 'bg-red-100'
                        }`}>
                          {d._id === 'assignment' && <BookOpen className="w-6 h-6 text-blue-600" />}
                          {d._id === 'quiz' && <Award className="w-6 h-6 text-purple-600" />}
                          {d._id === 'test' && <Clock className="w-6 h-6 text-red-600" />}
                        </div>
                        <Sparkles className="w-5 h-5 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4 capitalize">{d._id}s</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Live:</span>
                          <span className="font-bold text-green-600">{d.dispatched}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Drafts:</span>
                          <span className="font-bold text-yellow-600">{d.drafts}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

         {activeTab === 'drafts' && (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-900">Draft Content</h2>
      <span className="text-gray-600">{processedData.drafts.length} draft{processedData.drafts.length !== 1 ? 's' : ''}</span>
    </div>
    {processedData.drafts.length === 0 ? (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-12 h-12 text-yellow-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">No Drafts</h3>
        <p className="text-gray-500 max-w-md mx-auto">All your content is live! Create new assignments to see drafts here.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedData.drafts.map(a => renderCard(a, true))}
      </div>
    )}
  </div>
)}


{activeTab === 'live' && (
  <div className="space-y-8">
    {['assignments', 'quizzes', 'tests'].map(modePlural => {
      const items = processedData[modePlural] || []
      const singular = modePlural.replace(/s$/, '')         // "assignments" → "assignment"
      const ModeIcon = getModeIcon(singular)                // now a valid component
      const label = modePlural.charAt(0).toUpperCase() + modePlural.slice(1)

      return (
        <div key={modePlural} className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50">
              <ModeIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Live {label}</h3>
              <p className="text-gray-600">
                {items.length} active {label.toLowerCase()}
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">No live {label.toLowerCase()} at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(a => renderCard(a, false))}
            </div>
          )}
        </div>
      )
    })}
  </div>
)}


          {activeTab === 'leaderboard' && (
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Top Performers</h2>
                  <p className="text-gray-600">Student leaderboards for quizzes and tests</p>
                </div>
              </div>
              
              {stats?.leaderboard?.length ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {stats.leaderboard.map(lb => (
                    <div key={lb._id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                        <h3 className="text-xl font-bold mb-2">{lb.title}</h3>
                        <div className="flex items-center gap-2 text-purple-100">
                          <Trophy className="w-4 h-4" />
                          <span className="text-sm">Top {lb.leaderboard.length} students</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="space-y-3">
                          {lb.leaderboard.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-purple-50 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                  index === 1 ? 'bg-gray-100 text-gray-700' :
                                  index === 2 ? 'bg-orange-100 text-orange-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {index === 0 && <Crown className="w-5 h-5" />}
                                  {index === 1 && <Star className="w-4 h-4" />}
                                  {index === 2 && <Target className="w-4 h-4" />}
                                  {index > 2 && (index + 1)}
                                </div>
                                <span className="font-semibold text-gray-900">{entry.student.name}</span>
                                
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-bold text-gray-900">{entry.grade}</span>
                                <div className="text-xs text-gray-500">Score</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">No Leaderboards Yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto">Student leaderboards will appear here once quizzes and tests are completed.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}