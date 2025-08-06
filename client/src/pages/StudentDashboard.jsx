// src/pages/StudentDashboard.jsx
import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import API from '../api/api.js'
import { AuthContext } from '../contexts/AuthContext.jsx'
import { formatDistanceToNowStrict, format } from 'date-fns'
import {
  Clock,
  Calendar,
  Play,
  CheckCircle2,
  AlertCircle,
  Eye,
  Lock,
  BookOpen,
  Award,
  Timer,
  Globe,
  Users,
  Zap,
  Target,
  TrendingUp,
  Activity,
  User,
  Mail,
  GraduationCap,
  Star,
  RefreshCw
} from 'lucide-react'

export default function StudentDashboard() {
  const { user } = useContext(AuthContext)
  const [now, setNow] = useState(new Date())
  const [activeTab, setActiveTab] = useState('ongoing')
  const [refreshing, setRefreshing] = useState(false)

  // ⚡ ALL HOOKS MUST BE AT TOP LEVEL - NO CONDITIONAL HOOKS
  
  // Timer effect
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  // Query hook
  const { data: items = [], isLoading, refetch } = useQuery(
    ['myAssignments', user?._id],
    () => API.get('/assignments/me').then(r => {
      console.debug('[StudentDashboard] fetched assignments:', r.data.data?.length, 'items')
      return r.data.data
    }),
    { 
      enabled: !!user, 
      staleTime: 300000, 
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      retry: 2
    }
  )

  // All useCallback hooks at top level
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }, [refetch])

  const getModeIcon = useCallback((mode) => {
    return mode === 'quiz' ? BookOpen : mode === 'test' ? Award : BookOpen
  }, [])

  const getModeColor = useCallback((mode) => {
    return mode === 'quiz' ? 'from-purple-500 to-pink-500' :
           mode === 'test' ? 'from-red-500 to-orange-500' :
           'from-indigo-500 to-purple-500'
  }, [])

  const getTabConfig = useCallback((tabId) => {
    const configs = {
      ongoing: { 
        icon: Zap, 
        label: 'Ongoing', 
        bgColor: 'bg-orange-50',
        iconColor: 'text-orange-600',
        gradientColor: 'from-orange-500 to-red-500'
      },
      upcoming: { 
        icon: Calendar, 
        label: 'Upcoming', 
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        gradientColor: 'from-blue-500 to-cyan-500'
      },
      completed: { 
        icon: CheckCircle2, 
        label: 'Completed', 
        bgColor: 'bg-green-50',
        iconColor: 'text-green-600',
        gradientColor: 'from-green-500 to-emerald-500'
      },
      'pending-review': { 
        icon: AlertCircle, 
        label: 'Pending Review', 
        bgColor: 'bg-yellow-50',
        iconColor: 'text-yellow-600',
        gradientColor: 'from-yellow-500 to-amber-500'
      }
    }
    return configs[tabId] || configs['ongoing']
  }, [])

  const getPerformanceLevel = useCallback((average) => {
    if (average >= 90) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100', icon: Star }
    if (average >= 80) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: TrendingUp }
    if (average >= 70) return { level: 'Average', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Target }
    return { level: 'Needs Improvement', color: 'text-red-600', bgColor: 'bg-red-100', icon: Activity }
  }, [])

  // All useMemo hooks at top level
  const enrichedData = useMemo(() => {
    return items.map(a => {
      const totalQs = a.questionsCount || 0
      const doneCnt = a.mySubmission?.answers.length ?? 0
      const isFinal = a.mySubmission?.isFinal === true
      const due = a.dueDate ? new Date(a.dueDate) : null
      const isClosedUnattempted = !isFinal && doneCnt === 0 && due && due < now
      return { ...a, totalQs, doneCnt, isFinal, isClosedUnattempted, due }
    })
  }, [items, now])

  const sections = useMemo(() => ({
    ongoing: enrichedData.filter(a =>
      !a.isClosedUnattempted &&
      !a.isFinal &&
      a.studentStatus !== 'upcoming'
    ),
    upcoming: enrichedData.filter(a => 
      a.studentStatus === 'upcoming' && !a.isClosedUnattempted
    ),
    completed: enrichedData.filter(a => 
      a.isFinal || a.isClosedUnattempted
    ),
    'pending-review': enrichedData.filter(a => 
      a.studentStatus === 'pendingReview'
    ),
  }), [enrichedData])

  const profileStats = useMemo(() => {
    if (!enrichedData.length) return {
      totalAssignments: 0,
      completedCount: 0,
      ongoingCount: 0,
      completionRate: 0,
      averageGrade: 0,
      recentActivity: 0
    }
    
    const totalAssignments = enrichedData.length
    const completedCount = sections.completed.length
    const ongoingCount = sections.ongoing.length
    const completionRate = totalAssignments > 0 ? (completedCount / totalAssignments * 100) : 0
    
    const completedWithGrades = sections.completed.filter(a => a.mySubmission?.grade !== undefined)
    const averageGrade = completedWithGrades.length > 0 
      ? completedWithGrades.reduce((sum, a) => sum + (a.mySubmission.grade || 0), 0) / completedWithGrades.length
      : 0

    const recentActivity = sections.completed.filter(a => {
      if (!a.mySubmission?.submittedAt) return false
      const submissionDate = new Date(a.mySubmission.submittedAt)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return submissionDate > sevenDaysAgo
    }).length

    return {
      totalAssignments,
      completedCount,
      ongoingCount,
      completionRate: Math.round(completionRate * 10) / 10,
      averageGrade: Math.round(averageGrade * 10) / 10,
      recentActivity
    }
  }, [enrichedData, sections])

  const renderCard = useCallback((a) => {
    const badge = (a.mode || 'assignment').toUpperCase()
    const start = a.startDate && new Date(a.startDate)
    const timeLeft = ['quiz', 'test'].includes(a.mode) && a.due
      ? formatDistanceToNowStrict(a.due, { unit: 'second' })
      : null

    let label, to, ButtonIcon, buttonStyle
    if ((!a.isFinal && !a.isClosedUnattempted) && a.studentStatus !== 'upcoming') {
      label = a.doneCnt > 0 ? 'Continue' : 'Start'
      to = `/assignments/${a._id}/submit`
      ButtonIcon = Play
      buttonStyle = 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-200'
    } else if (a.studentStatus === 'pendingReview') {
      label = 'View Submission'
      to = `/assignments/${a._id}`
      ButtonIcon = Eye
      buttonStyle = 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-yellow-200'
    } else if (a.isFinal) {
      label = 'View Results'
      to = `/assignments/${a._id}`
      ButtonIcon = Eye
      buttonStyle = 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-green-200'
    } else {
      label = 'Locked'
      to = null
      ButtonIcon = Lock
      buttonStyle = 'bg-gray-300 cursor-not-allowed'
    }

    const ModeIcon = getModeIcon(a.mode)

    return (
      <div key={a._id} className="group bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getModeColor(a.mode)} p-6 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <ModeIcon className="w-5 h-5" />
              </div>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/30">
                {badge}
              </span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              a.isClosedUnattempted ? 'bg-red-100 text-red-700' :
              a.isFinal ? 'bg-green-100 text-green-700' :
              a.studentStatus === 'pending' ? 'bg-blue-100 text-blue-700' :
              a.studentStatus === 'upcoming' ? 'bg-gray-100 text-gray-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {a.isClosedUnattempted ? 'Missed' :
               a.isFinal ? 'Completed' :
               a.studentStatus.charAt(0).toUpperCase() + a.studentStatus.slice(1)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {a.title}
          </h3>

          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between">
              <span>Progress</span>
              <span className="font-semibold">{a.doneCnt} / {a.totalQs}</span>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {start && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Starts: {format(start, 'PPP p')}</span>
              </div>
            )}
            {a.due && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Due: {format(a.due, 'PPP p')}</span>
              </div>
            )}

            {(a.timeLimitMinutes && a.mode !="assignment") && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Duration: {a.timeLimitMinutes} Min</span>
              </div>
            )}
            {timeLeft && a.studentStatus === 'pending' && (
              <div className="flex items-center gap-2 text-red-600 font-medium">
                <Timer className="w-4 h-4" />
                <span>{timeLeft} left</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            {a.visibleToAll ? <Globe className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            <span className={a.visibleToAll ? 'text-blue-600' : 'text-purple-600'}>
              {a.visibleToAll ? 'Public' : 'Restricted'}
            </span>
          </div>

          {/* Progress bar for ongoing */}
          {(!a.isFinal && !a.isClosedUnattempted && a.studentStatus !== 'upcoming') && (
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="text-blue-700">
                  <div className="text-sm font-semibold mb-1">Completion</div>
                  <div className="text-blue-600 text-sm">{a.doneCnt} / {a.totalQs} questions</div>
                </div>
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray={`${(a.doneCnt / a.totalQs) * 100}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-700">
                      {Math.round((a.doneCnt / a.totalQs) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Completed summary */}
          {a.isFinal && a.mySubmission && (
            <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div className="text-green-700">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-semibold">Completed</span>
                  </div>
                  <div className="text-green-600 text-sm">
                    ✓ {a.mySubmission.grade} correct • ✗ {a.totalQs - a.mySubmission.grade} wrong
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-700">
                    {Math.round((a.mySubmission.grade / a.totalQs) * 100)}%
                  </div>
                  <div className="text-xs text-green-600">Score</div>
                </div>
              </div>
            </div>
          )}

          {/* Action button */}
          {to ? (
            <Link
              to={to}
              className={`flex items-center justify-center space-x-2 w-full py-3 rounded-2xl text-white font-semibold transition-all duration-200 shadow-lg ${buttonStyle}`}
            >
              <ButtonIcon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ) : (
            <button
              disabled
              className="flex items-center justify-center space-x-2 w-full py-3 rounded-2xl bg-gray-200 text-gray-500 font-semibold cursor-not-allowed"
            >
              <ButtonIcon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          )}
        </div>
      </div>
    )
  }, [getModeIcon, getModeColor])

  // Calculate performance after hooks
  const performance = getPerformanceLevel(profileStats.averageGrade)
  const PerformanceIcon = performance.icon

  // EARLY RETURNS AFTER ALL HOOKS
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Your Dashboard</h2>
            <p className="text-gray-500">Fetching your latest assignments...</p>
          </div>
        </div>
      </div>
    )
  }

  if (user?.role !== 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-xl p-12 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-red-600">Student dashboard access required</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Enhanced Profile Header */}
        <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-36 -translate-x-36"></div>
          </div>
          
          <div className="relative z-10 p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border-2 border-white/30 shadow-xl">
                  <span className="text-3xl font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-3">Welcome back, {user?.name}!</h1>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span className="text-sm">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap size={16} />
                      <span className="text-sm">{user?.branch || 'Computer Science'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span className="text-sm">{user?.year || 'Final Year'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Performance Badge & Refresh */}
              <div className="flex items-center gap-4">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <PerformanceIcon className="w-5 h-5" />
                    <span className="font-semibold">Performance</span>
                  </div>
                  <p className="text-lg font-bold">{performance.level}</p>
                  <p className="text-white/80 text-sm">Avg: {profileStats.averageGrade}%</p>
                </div>
                
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
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{profileStats.totalAssignments}</span>
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">Total Assignments</h3>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{profileStats.completedCount}</span>
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">Completed</h3>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{profileStats.ongoingCount}</span>
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">In Progress</h3>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{profileStats.completionRate}%</span>
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">Success Rate</h3>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{profileStats.recentActivity}</span>
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">This Week</h3>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
          <nav className="flex space-x-2 overflow-x-auto">
            {Object.keys(sections).map(tabId => {
              const config = getTabConfig(tabId)
              const TabIcon = config.icon
              const count = sections[tabId].length
              
              return (
                <button
                  key={tabId}
                  onClick={() => setActiveTab(tabId)}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tabId
                      ? `bg-gradient-to-r ${config.gradientColor} text-white shadow-lg`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <TabIcon className="mr-2" size={20} />
                  <span>{config.label}</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === tabId 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {(() => {
            const currentSection = sections[activeTab]
            const config = getTabConfig(activeTab)
            const SectionIcon = config.icon

            if (currentSection.length === 0) {
              return (
                <div className="text-center py-20">
                  <div className={`w-24 h-24 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <SectionIcon className={`w-12 h-12 ${config.iconColor} opacity-50`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">No {config.label} Assignments</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {activeTab === 'ongoing' && "You're all caught up! New assignments will appear here."}
                    {activeTab === 'upcoming' && "No upcoming assignments scheduled at the moment."}
                    {activeTab === 'completed' && "Complete assignments to see your achievements here."}
                    {activeTab === 'pending-review' && "No assignments pending review right now."}
                  </p>
                </div>
              )
            }

            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${config.bgColor} rounded-xl flex items-center justify-center`}>
                      <SectionIcon className={`w-5 h-5 ${config.iconColor}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{config.label}</h2>
                      <p className="text-gray-600">{currentSection.length} assignment{currentSection.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {currentSection.map(renderCard)}
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}