// src/pages/QuestionDetail.jsx
import React, { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import API from '../api/api.js'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  FileImage, 
  Code, 
  Lightbulb,
  Hash,
  BookOpen,
  Clock,
  Award
} from 'lucide-react'

export default function QuestionDetail() {
  const { id } = useParams()
  const [q, setQ] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    API.get(`/questions/${id}`)
      .then(r => {
        setQ(r.data.data)
        setIsLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load question')
        setIsLoading(false)
      })
  }, [id])

  // Memoized calculations for performance
  const questionStats = useMemo(() => {
    if (!q) return null;
    
    return {
      hasImages: q.images && q.images.length > 0,
      hasTestCases: q.testCases && q.testCases.length > 0,
      hasExplanation: q.explanation && q.explanation.trim().length > 0,
      optionsCount: q.options ? q.options.length : 0,
      correctAnswersCount: q.correctAnswers ? q.correctAnswers.length : 0
    };
  }, [q]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'mcq': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'msq': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'coding': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  if (!q) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-semibold">Question not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <Link
            to="/questions"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-all duration-200 group"
          >
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Questions
          </Link>
        </div>

        {/* Question Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-4 py-2 rounded-xl font-semibold text-sm border ${getTypeColor(q.type)} bg-white/90`}>
                  {q.type?.toUpperCase() || 'QUESTION'}
                </span>
                <span className={`px-4 py-2 rounded-xl font-semibold text-sm border ${getDifficultyColor(q.tags?.difficulty)} bg-white/90`}>
                  {q.tags?.difficulty || 'Unknown'}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>By {q.tags?.creator?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{format(new Date(q.createdAt), 'PPP')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: q.content }} 
              />
            </div>
          </div>
        </div>

        {/* Images Section */}
        {questionStats?.hasImages && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <FileImage className="mr-3" size={20} />
                Images ({q.images.length})
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {q.images.map((img, i) => (
                  <figure key={i} className="group">
                    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                      <img
                        src={img.url}
                        alt={img.caption}
                        className="w-full h-auto max-h-64 object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {img.caption && (
                      <figcaption className="text-center text-sm text-gray-600 mt-3 font-medium">
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MCQ/MSQ Options */}
        {(q.type === 'mcq' || q.type === 'msq') && q.options && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Hash className="mr-3" size={20} />
                Answer Options
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {q.options.map(o => (
                  <div
                    key={o.id}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                      q.correctAnswers?.includes(o.id)
                        ? 'bg-green-50 border-green-300 shadow-lg shadow-green-100'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        q.correctAnswers?.includes(o.id)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-700'
                      }`}>
                        {o.id}
                      </span>
                      <span className="text-gray-800 font-medium">{o.text}</span>
                      {q.correctAnswers?.includes(o.id) && (
                        <CheckCircle2 className="text-green-500 ml-auto flex-shrink-0" size={20} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Test Cases */}
        {questionStats?.hasTestCases && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Code className="mr-3" size={20} />
                Test Cases ({q.testCases.length})
              </h3>
            </div>
            <div className="p-6 overflow-x-auto">
              <div className="min-w-full">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 px-4 font-bold text-gray-800 bg-gray-50 rounded-tl-xl">
                        Input
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-gray-800 bg-gray-50 rounded-tr-xl">
                        Expected Output
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {q.testCases.map((tc, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <code className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg font-mono text-sm block">
                            {tc.input}
                          </code>
                        </td>
                        <td className="py-4 px-4">
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
          </div>
        )}

        {/* Explanation */}
        {questionStats?.hasExplanation && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Lightbulb className="mr-3" size={20} />
                Explanation
              </h3>
            </div>
            <div className="p-8">
              <div className="prose prose-lg max-w-none">
                <div
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: q.explanation }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Question Stats Footer */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-xl">
              <Award className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">Type</p>
              <p className="font-bold text-gray-900">{q.type?.toUpperCase()}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <Tag className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">Difficulty</p>
              <p className="font-bold text-gray-900">{q.tags?.difficulty || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <Hash className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">Options</p>
              <p className="font-bold text-gray-900">{questionStats?.optionsCount || 0}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">Created</p>
              <p className="font-bold text-gray-900">{format(new Date(q.createdAt), 'MMM dd')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}