// src/pages/StudentProfile.jsx
import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useParams, Link } from 'react-router-dom';
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
  Target,
  ArrowLeft,
  GraduationCap,
  MapPin,
  Star
} from 'lucide-react';

export default function StudentProfile() {
  const { id } = useParams();
  
  const { data, isLoading, error } = useQuery(
    ['student', id],
    () => API.get(`/users/${id}`)
                .then(r => {
                  console.debug('[StudentProfile] fetched student data:', r.data.data)
                  return r.data.data
                }),
    { staleTime: 5*60*1000 }
  );

  // Memoized calculations for performance optimization
  const profileStats = useMemo(() => {
    if (!data) return null;
    
    const ongoingCount = data.ongoing?.length || 0;
    const submissionsCount = data.submissions?.length || 0;
    const totalAssignments = ongoingCount + submissionsCount;
    const completionRate = totalAssignments > 0 ? (submissionsCount / totalAssignments * 100) : 0;
    
    const averageGrade = submissionsCount > 0 
      ? data.submissions.reduce((sum, s) => sum + (s.grade || 0), 0) / submissionsCount
      : 0;

    // Calculate recent activity
    const recentSubmissions = data.submissions?.filter(s => {
      const submissionDate = new Date(s.submittedAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return submissionDate > thirtyDaysAgo;
    }).length || 0;

    return {
      totalAssignments,
      ongoingCount,
      submissionsCount,
      completionRate: Math.round(completionRate * 10) / 10,
      averageGrade: Math.round(averageGrade * 10) / 10,
      recentActivity: recentSubmissions
    };
  }, [data]);

  const getGradeColor = (grade) => {
    if (grade >= 90) return 'text-green-600 bg-green-100';
    if (grade >= 80) return 'text-emerald-600 bg-emerald-100';
    if (grade >= 70) return 'text-yellow-600 bg-yellow-100';
    if (grade >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceLevel = (average) => {
    if (average >= 90) return { level: 'Excellent', color: 'text-green-600', icon: Star };
    if (average >= 80) return { level: 'Good', color: 'text-blue-600', icon: TrendingUp };
    if (average >= 70) return { level: 'Average', color: 'text-yellow-600', icon: Target };
    return { level: 'Needs Improvement', color: 'text-red-600', icon: Activity };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Student Profile</h2>
            <p className="text-gray-500">Please wait while we fetch the details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white rounded-3xl shadow-xl p-12 max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-red-600 mb-6">Unable to load student profile</p>
            <Link
              to="/admin"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const performance = getPerformanceLevel(profileStats?.averageGrade || 0);
  const PerformanceIcon = performance.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin"
            className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 font-medium"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Dashboard
          </Link>
        </div>

        {/* Header Section */}
        <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-36 -translate-x-36"></div>
          </div>
          
          <div className="relative z-10 p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border-2 border-white/30 shadow-xl">
                  <span className="text-4xl font-bold">
                    {data.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-3">{data.name}</h1>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <Mail size={18} />
                      <span className="text-sm">{data.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap size={18} />
                      <span className="text-sm">{data.branch}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={18} />
                      <span className="text-sm">{data.year}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Performance Badge */}
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <PerformanceIcon className="w-6 h-6" />
                  <span className="text-lg font-semibold">Performance</span>
                </div>
                <p className="text-2xl font-bold">{performance.level}</p>
                <p className="text-white/80 text-sm">Average: {profileStats?.averageGrade || 0}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {profileStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{profileStats.totalAssignments}</span>
              </div>
              <h3 className="font-semibold text-gray-700 text-sm">Total Assignments</h3>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{profileStats.submissionsCount}</span>
              </div>
              <h3 className="font-semibold text-gray-700 text-sm">Completed</h3>
              <p className="text-xs text-gray-500 mt-1">Submitted work</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{profileStats.ongoingCount}</span>
              </div>
              <h3 className="font-semibold text-gray-700 text-sm">In Progress</h3>
              <p className="text-xs text-gray-500 mt-1">Active tasks</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{profileStats.completionRate}%</span>
              </div>
              <h3 className="font-semibold text-gray-700 text-sm">Success Rate</h3>
              <p className="text-xs text-gray-500 mt-1">Completion ratio</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                  <Activity className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{profileStats.recentActivity}</span>
              </div>
              <h3 className="font-semibold text-gray-700 text-sm">Recent Activity</h3>
              <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Ongoing Assignments - Takes 2 columns */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden h-full">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Clock className="mr-3" size={28} />
                  Ongoing Assignments
                  <span className="ml-3 bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    {data.ongoing?.length || 0}
                  </span>
                </h2>
              </div>
              <div className="p-8">
                {data.ongoing?.length ? (
                  <div className="space-y-4">
                    {data.ongoing.map(assignment => (
                      <div key={assignment._id} className="group p-6 bg-gradient-to-r from-gray-50 to-orange-50 hover:from-orange-50 hover:to-red-50 rounded-2xl transition-all duration-300 border border-gray-100 hover:border-orange-200 hover:shadow-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-700 transition-colors mb-2">
                              {assignment.title}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600 mb-3">
                              <Calendar className="mr-2" size={16} />
                              Due {format(new Date(assignment.dueDate), 'PPP')}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mb-2">
                              ACTIVE
                            </span>
                            <span className="text-sm text-gray-500">
                              {format(new Date(assignment.dueDate), 'p')}
                            </span>
                          </div>
                        </div>
                        
                        {/* Progress indicator */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText className="text-gray-400" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">All Caught Up!</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">No ongoing assignments at the moment. Great work staying on top of your tasks!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Completed Submissions Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden h-full">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Award className="mr-3" size={24} />
                  Recent Work
                  <span className="ml-3 bg-white/20 px-2 py-1 rounded-full text-sm font-medium">
                    {data.submissions?.length || 0}
                  </span>
                </h2>
              </div>
              <div className="p-6">
                {data.submissions?.length ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {data.submissions.slice(0, 8).map(submission => (
                      <div key={submission._id} className="group p-4 bg-gradient-to-r from-gray-50 to-green-50 hover:from-green-50 hover:to-emerald-50 rounded-xl transition-all duration-300 border border-gray-100 hover:border-green-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-gray-900 group-hover:text-green-700 transition-colors truncate">
                              {submission.assignmentTitle}
                            </h4>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <CheckCircle2 className="mr-1" size={12} />
                              {format(new Date(submission.submittedAt), 'MMM dd, yyyy')}
                            </div>
                          </div>
                          <div className="ml-3 flex-shrink-0">
                            <span className={`px-2 py-1 text-xs font-bold rounded-lg ${getGradeColor(submission.grade)}`}>
                              {submission.grade}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {data.submissions.length > 8 && (
                      <div className="text-center pt-4">
                        <p className="text-sm text-gray-500">
                          +{data.submissions.length - 8} more submissions
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="text-gray-400" size={28} />
                    </div>
                    <h4 className="font-semibold text-gray-700 mb-1">No Submissions Yet</h4>
                    <p className="text-sm text-gray-500">Complete assignments to see progress here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}