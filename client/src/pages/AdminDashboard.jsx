// src/pages/AdminDashboard.jsx
import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Users,
  UserCheck,
  BookOpen,
  Edit3,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Search,
  Eye,
  Trash2,
  Activity,
  Settings,
  UserCog,
  FileText,
  TrendingUp
} from 'lucide-react'
import API from '../api/api.js'
import StatCard from '../components/StatCard.jsx'
import TopStudentsChart from '../components/TopStudentsChart.jsx'

export default function AdminDashboard() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('analytics')
  const [stuFilter, setStuFilter] = useState('')
  const [menFilter, setMenFilter] = useState('')

  // ─── Site stats ─────────────────────────────────────────────────────────
  const { data: stats } = useQuery(
    'siteStats',
    () => API.get('/stats').then(r => r.data.data),
    { staleTime: 300_000 }
  )

  // ─── All assignments ────────────────────────────────────────────────────
  const { data: allA = [] } = useQuery(
    'allAssignments',
    () =>
      API.get('/assignments').then(r => {
        console.debug('[Admin] fetched assignments:', r.data.data)
        return r.data.data
      }),
    { staleTime: 300_000 }
  )
  const dispatchMut = useMutation(
    ({ id, action }) => API.put(`/assignments/${id}/${action}`),
    { onSuccess: () => qc.invalidateQueries('allAssignments') }
  )

  // ─── Students by role ───────────────────────────────────────────────────
  const { data: students = [] } = useQuery(
    'studentsByRole',
    () =>
      API.get('/users/by-role?role=student').then(r => {
        console.debug('[Admin] fetched students:', r.data.data)
        return r.data.data
      }),
    { staleTime: 300_000 }
  )

  // ─── Mentors by role ────────────────────────────────────────────────────
  const { data: mentors = [] } = useQuery(
    'mentorsByRole',
    () =>
      API.get('/users/by-role?role=mentor').then(r => {
        console.debug('[Admin] fetched mentors:', r.data.data)
        return r.data.data
      }),
    { staleTime: 300_000 }
  )

  // ─── User ban/delete mutations ───────────────────────────────────────────
  const userMut = useMutation(
    ({ id, action }) => API.put(`/users/${id}/${action}`),
    {
      onSuccess: (_, vars) => {
        toast.success(`${vars.action} succeeded`)
        qc.invalidateQueries(['studentsByRole', 'mentorsByRole'])
      },
      onError: () => toast.error('Operation failed')
    }
  )

  // ─── Compute top 5 students ─────────────────────────────────────────────
  const topStudents = useMemo(() => {
    return [...students]
      .filter(s => typeof s.completedAssignments === 'number')
      .sort((a, b) => b.completedAssignments - a.completedAssignments)
      .slice(0, 5)
      .map(s => ({ name: s.name, score: s.completedAssignments }))
  }, [students])

  // ─── Filters ────────────────────────────────────────────────────────────
  const filteredStudents = useMemo(
    () =>
      students.filter(u =>
        u.name.toLowerCase().includes(stuFilter.toLowerCase()) ||
        u.email.toLowerCase().includes(stuFilter.toLowerCase())
      ),
    [students, stuFilter]
  )

  const filteredMentors = useMemo(
    () =>
      mentors.filter(u =>
        u.name.toLowerCase().includes(menFilter.toLowerCase()) ||
        u.email.toLowerCase().includes(menFilter.toLowerCase())
      ),
    [mentors, menFilter]
  )

  // ─── Partition assignments ───────────────────────────────────────────────
  const assignmentPartitions = useMemo(() => {
    const drafts = allA.filter(a => !a.isDispatched)
    const dispatched = allA.filter(a => a.isDispatched)
    return {
      drafts,
      assignments: dispatched.filter(a => a.mode === 'assignment'),
      quizzes:     dispatched.filter(a => a.mode === 'quiz'),
      tests:       dispatched.filter(a => a.mode === 'test'),
    }
  }, [allA])

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'content',   label: 'Content',   icon: FileText },
    { id: 'students',  label: 'Students',  icon: Users },
    { id: 'mentors',   label: 'Mentors',   icon: UserCog }
  ]

  // ─── Assignment Card ────────────────────────────────────────────────────
  const AssignmentCard = ({ assignment, isDraft = false }) => (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                assignment.mode === 'quiz' ? 'bg-purple-100 text-purple-700' :
                assignment.mode === 'test' ? 'bg-orange-100 text-orange-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {assignment.mode?.toUpperCase() || 'ASSIGNMENT'}
              </span>
              {isDraft && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  DRAFT
                </span>
              )}
            </div>
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
              {assignment.title}
            </h3>
          </div>
          <button
            onClick={() => isDraft 
              ? dispatchMut.mutate({ id: assignment._id, action: 'dispatch' })
              : dispatchMut.mutate({ id: assignment._id, action: 'undispatch' })
            }
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              isDraft 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200'
            }`}
          >
            {isDraft ? 'Dispatch' : 'Pull Back'}
          </button>
        </div>
        <button
          onClick={() => navigate(`/assignments/${assignment._id}`)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors group"
        >
          <Eye className="mr-2 group-hover:scale-110 transition-transform" size={16} />
          Preview Assignment
        </button>
      </div>
    </div>
  )

  // ─── User Card ──────────────────────────────────────────────────────────
  const UserCard = ({ user }) => (
    <div 
      onClick={() => navigate(`/users/${user._id}`)}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {user.name}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            {user.isBanned && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                Banned
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <button
              onClick={ev => {
                ev.stopPropagation()
                const act = user.isBanned ? 'unban' : 'ban'
                if (!confirm(`${act} ${user.name}?`)) return
                userMut.mutate({ id: user._id, action: act })
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                user.isBanned 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200'
              }`}
            >
              {user.isBanned ? 'Unban' : 'Ban'}
            </button>
            <button
              onClick={ev => {
                ev.stopPropagation()
                if (!confirm(`Delete ${user.name}?`)) return
                userMut.mutate({ id: user._id, action: 'delete' })
              }}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-red-600 rounded-lg transition-all duration-200 flex items-center justify-center"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ─── Render Tab Content ─────────────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return (
          <div className="space-y-8">
            {/* Site Analytics */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="mr-3 text-blue-600" size={24} />
                Site Analytics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <StatCard label="Students"       value={stats?.totalStudents}      icon={Users} />
                <StatCard label="Mentors"        value={stats?.totalMentors}       icon={UserCheck} />
                <StatCard label="Assignments Live" value={stats?.totalAssignments} icon={BookOpen} />
                <StatCard label="Quizzes Live"     value={stats?.totalQuizzes}     icon={Edit3} />
                <StatCard label="Tests Live"       value={stats?.totalTests}       icon={Clock} />
                <StatCard label="Assignments Open" value={stats?.ongoingAssignments} icon={BookOpen} />
                <StatCard label="Quizzes Open"     value={stats?.ongoingQuizzes}     icon={Edit3} />
                <StatCard label="Tests Open"       value={stats?.ongoingTests}       icon={Clock} />
                <StatCard label="Total Submissions" value={stats?.totalSubs}        icon={CheckCircle2} />
                <StatCard label="Pending Review"    value={stats?.pendingReview}    icon={AlertCircle} />
              </div>
            </div>

            {/* Top Students Chart */}
            {/* <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <BarChart2 className="mr-3 text-purple-600" size={24} />
                Top 5 Students
              </h3>
              <TopStudentsChart data={topStudents} />
            </div> */}
          </div>
        )

      case 'content':
        return (
          <div className="space-y-8">
            {/* Drafts */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Draft Content</h3>
              {assignmentPartitions.drafts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500">No drafts available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assignmentPartitions.drafts.map(a => (
                    <AssignmentCard key={a._id} assignment={a} isDraft />
                  ))}
                </div>
              )}
            </div>

            {/* Dispatched Content */}
            {['assignments','quizzes','tests'].map(mode => (
              <div key={mode} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 capitalize">
                  Live {mode}
                </h3>
                {assignmentPartitions[mode].length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">No {mode} published yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignmentPartitions[mode].map(a => (
                      <AssignmentCard key={a._id} assignment={a} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )

      case 'students':
        return (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Manage Students</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={stuFilter}
                  onChange={e => setStuFilter(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-80"
                />
              </div>
            </div>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500">No students found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map(u => (
                  <UserCard key={u._id} user={u} />
                ))}
              </div>
            )}
          </div>
        )

      case 'mentors':
        return (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Manage Mentors</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search mentors..."
                  value={menFilter}
                  onChange={e => setMenFilter(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-80"
                />
              </div>
            </div>
            {filteredMentors.length === 0 ? (
              <div className="text-center py-12">
                <UserCog className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500">No mentors found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMentors.map(u => (
                  <UserCard key={u._id} user={u} />
                ))}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Console</h1>
          <p className="text-gray-600">Manage your platform efficiently</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-8">
          <nav className="flex space-x-2">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="mr-2" size={20} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}
