// src/pages/MentorProfile.jsx
import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import API from '../api/api.js';
import { format } from 'date-fns';
import { 
  User, 
  Mail, 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Award, 
  TrendingUp,
  Activity,
  Users,
  Star,
  Lightbulb,
  MessageCircle,
  Target,
  BarChart3,
  GraduationCap,
  Heart,
  Zap
} from 'lucide-react';

export default function MentorProfile() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery(
    ['mentor', id],
    () => API.get(`/users/${id}`).then(r => r.data.data),
    { staleTime: 5*60*1000 }
  );

  // Memoized calculations for performance
  const stats = useMemo(() => {
    if (!data) return null;
    
    const totalStudents = data.mentoring?.length || 0;
    const activeStudents = data.mentoring?.filter(s => s.isActive)?.length || 0;
    const totalAssignments = data.createdAssignments?.length || 0;
    const totalReviews = data.reviews?.length || 0;
    const averageRating = data.reviews?.length > 0 
      ? data.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / data.reviews.length 
      : 0;
    const totalHoursSpent = data.sessions?.reduce((sum, s) => sum + (s.duration || 0), 0) || 0;

    return {
      totalStudents,
      activeStudents,
      totalAssignments,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalHoursSpent: Math.round(totalHoursSpent)
    };
  }, [data]);

  const recentActivity = useMemo(() => {
    if (!data) return [];
    
    const activities = [];
    
    // Add recent assignments
    if (data.createdAssignments) {
      data.createdAssignments.slice(0, 3).forEach(assignment => {
        activities.push({
          type: 'assignment',
          title: `Created assignment: ${assignment.title}`,
          date: assignment.createdAt,
          icon: FileText,
          color: 'blue'
        });
      });
    }
    
    // Add recent sessions
    if (data.sessions) {
      data.sessions.slice(0, 3).forEach(session => {
        activities.push({
          type: 'session',
          title: `Mentoring session with ${session.studentName}`,
          date: session.date,
          icon: MessageCircle,
          color: 'green'
        });
      });
    }
    
    // Sort by date and return latest 5
    return activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mentor profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-semibold">Error loading profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-12 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/30">
                  <span className="text-3xl font-bold">
                    {data.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">{data.name}</h1>
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap size={20} />
                    <span className="text-xl font-medium">Mentor</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <Mail size={18} />
                      <span>{data.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={18} />
                      <span>{data.expertise || data.branch}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={18} />
                      <span>Since {format(new Date(data.createdAt), 'yyyy')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Rating Display */}
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-2">
                  <Star className="w-6 h-6 fill-yellow-300 text-yellow-300" />
                  <span className="text-2xl font-bold">{stats?.averageRating || 0}</span>
                </div>
                <p className="text-white/80">Average Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.totalStudents}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.activeStudents}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Active Students</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Assignments Created</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.totalReviews}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Reviews Given</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.averageRating}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-indigo-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.totalHoursSpent}h</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Hours Mentored</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Current Students */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Users className="mr-3" size={24} />
                Current Students ({data.mentoring?.length || 0})
              </h2>
            </div>
            <div className="p-6">
              {data.mentoring?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.mentoring.slice(0, 8).map(student => (
                    <div key={student._id} className="group p-4 bg-gray-50 hover:bg-blue-50 rounded-2xl transition-all duration-200 border border-gray-100 hover:border-blue-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {student.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{student.branch}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              student.isActive 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {student.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500 font-medium">No students assigned yet</p>
                  <p className="text-gray-400 text-sm mt-1">Students will appear here when assigned</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Activity className="mr-3" size={24} />
                Recent Activity
              </h2>
            </div>
            <div className="p-6">
              {recentActivity.length ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon
                    return (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activity.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          activity.color === 'green' ? 'bg-green-100 text-green-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(activity.date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="mx-auto text-gray-300 mb-3" size={32} />
                  <p className="text-gray-500 text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Created Assignments */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Lightbulb className="mr-3" size={24} />
              Created Assignments ({data.createdAssignments?.length || 0})
            </h2>
          </div>
          <div className="p-6">
            {data.createdAssignments?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.createdAssignments.slice(0, 6).map(assignment => (
                  <div key={assignment._id} className="group p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-all duration-200 border border-gray-100 hover:border-purple-200">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2">
                        {assignment.title}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        assignment.mode === 'quiz' ? 'bg-purple-100 text-purple-700' :
                        assignment.mode === 'test' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {assignment.mode?.toUpperCase() || 'ASSIGNMENT'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{format(new Date(assignment.createdAt), 'MMM dd')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span>{assignment.submissions?.length || 0} submissions</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Lightbulb className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500 font-medium">No assignments created yet</p>
                <p className="text-gray-400 text-sm mt-1">Create assignments to help students learn</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <BarChart3 className="mr-3" size={24} />
              Performance Insights
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-blue-900 mb-2">
                  {Math.round((stats?.activeStudents / stats?.totalStudents * 100) || 0)}%
                </div>
                <p className="text-blue-700 font-medium">Student Engagement</p>
                <p className="text-blue-600 text-sm mt-1">Active vs Total Students</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                <Heart className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-green-900 mb-2">
                  {stats?.averageRating || 0}/5
                </div>
                <p className="text-green-700 font-medium">Student Satisfaction</p>
                <p className="text-green-600 text-sm mt-1">Average Rating</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <div className="text-2xl font-bold text-purple-900 mb-2">
                  {Math.round((stats?.totalHoursSpent / stats?.totalStudents) || 0)}h
                </div>
                <p className="text-purple-700 font-medium">Hours per Student</p>
                <p className="text-purple-600 text-sm mt-1">Average mentoring time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}