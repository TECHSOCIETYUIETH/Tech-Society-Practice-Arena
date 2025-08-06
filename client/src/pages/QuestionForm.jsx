// src/pages/QuestionForm.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from 'react-query'
import API from '../api/api.js'
import { toast } from 'react-hot-toast'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import {
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
  X,
  Plus,
  CheckCircle,
  AlertCircle,
  FileText,
  Code,
  Hash,
  Tag,
  Lightbulb,
  Eye,
  Settings,
  Sparkles
} from 'lucide-react'

const initial = {
  type: 'mcq',
  content: '',
  options: [{ id: 'A', text: '' }, { id: 'B', text: '' }],
  correctAnswers: [],
  testCases: [],
  explanation: '',
  tags: { topics: [], difficulty: 'beginner' },
  images: []
}

export default function QuestionForm() {
  const { id } = useParams()
  const editMode = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [q, setQ] = useState(initial)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState('content')
  const [topicsInput, setTopicsInput] = useState('') // Separate state for topics input

  // 📝 Memoized Quill configuration for performance
  const quillConfig = useMemo(() => ({
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['code-block', 'link'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ header: [1, 2, 3, false] }],
        ['clean']
      ]
    },
    formats: [
      'bold', 'italic', 'underline', 'strike',
      'code-block', 'link',
      'list', 'bullet', 'header'
    ]
  }), [])

  // 🔄 Load existing question with proper error handling
  useEffect(() => {
    if (!editMode) return
    
    const loadQuestion = async () => {
      setLoading(true)
      try {
        const response = await API.get(`/questions/${id}`)
        console.debug('[QuestionForm] loaded question:', response.data.data)
        const questionData = response.data.data
        setQ(questionData)
        
        // Set the topics input string
        if (questionData.tags && questionData.tags.topics) {
          setTopicsInput(questionData.tags.topics.join(', '))
        }
        
        toast.success('Question loaded successfully!')
      } catch (error) {
        console.error('[QuestionForm] load error:', error)
        toast.error('Failed to load question')
        navigate('/questions')
      } finally {
        setLoading(false)
      }
    }
    
    loadQuestion()
  }, [editMode, id, navigate])

  // Handle topics input changes
  const handleTopicsChange = useCallback((value) => {
    setTopicsInput(value)
    
    // Parse topics from the input string
    const topics = value
      .split(/[,;]+/) // Split by comma or semicolon
      .map(topic => topic.trim()) // Trim whitespace
      .filter(topic => topic.length > 0) // Remove empty strings
      .filter((topic, index, arr) => arr.indexOf(topic) === index) // Remove duplicates
    
    setQ(prev => ({
      ...prev,
      tags: {
        ...prev.tags,
        topics: topics
      }
    }))
  }, [])

  // Remove individual topic
  const removeTopic = useCallback((topicToRemove) => {
    const updatedTopics = q.tags.topics.filter(topic => topic !== topicToRemove)
    setQ(prev => ({
      ...prev,
      tags: {
        ...prev.tags,
        topics: updatedTopics
      }
    }))
    setTopicsInput(updatedTopics.join(', '))
  }, [q.tags.topics])

  // 🎨 Style helpers
  const getTypeConfig = useCallback((type) => ({
    mcq: { 
      label: 'Multiple Choice (Single)', 
      icon: CheckCircle, 
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    },
    msq: { 
      label: 'Multiple Choice (Multiple)', 
      icon: CheckCircle, 
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200'
    },
    descriptive: { 
      label: 'Descriptive Answer', 
      icon: FileText, 
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200'
    },
    image: { 
      label: 'Image Based', 
      icon: ImageIcon, 
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200'
    }
  }[type]), [])

  const getDifficultyConfig = useCallback((difficulty) => ({
    beginner: { label: 'Beginner', color: 'bg-green-100 text-green-800' },
    intermediate: { label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
    advanced: { label: 'Advanced', color: 'bg-red-100 text-red-800' }
  }[difficulty]), [])

  // 📸 Optimized file upload handler
  const handleFile = useCallback(async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    
    try {
      const { data } = await API.post('/upload/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setQ(prev => ({
        ...prev,
        images: [...prev.images, { url: data.url, caption: '' }]
      }))
      
      toast.success('Image uploaded successfully!')
      // Clear the input
      e.target.value = ''
    } catch (error) {
      console.error('[QuestionForm] upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }, [])

  // 💾 Optimized submit handler with validation
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    // Validation
    if (!q.content.trim()) {
      toast.error('Question content is required')
      return
    }

    if ((q.type === 'mcq' || q.type === 'msq') && q.correctAnswers.length === 0) {
      toast.error('Please select at least one correct answer')
      return
    }

    setSubmitting(true)
    try {
      const payload = { ...q }
      
      if (editMode) {
        await API.put(`/questions/${id}`, payload)
        toast.success('Question updated successfully!')
      } else {
        await API.post('/questions', payload)
        toast.success('Question created successfully!')
      }
      
      // 🔄 Invalidate relevant queries for fresh data
      queryClient.invalidateQueries('questions')
      queryClient.invalidateQueries('allQuestions')
      queryClient.invalidateQueries('dashboardStats')
      
      // Navigate back with a slight delay to show the success message
      setTimeout(() => navigate('/questions'), 1000)
      
    } catch (error) {
      console.error('[QuestionForm] save error:', error)
      toast.error(error.response?.data?.message || 'Failed to save question')
    } finally {
      setSubmitting(false)
    }
  }, [q, editMode, id, navigate, queryClient])

  // 🏗️ Dynamic option handlers
  const addOption = useCallback(() => {
    const nextId = String.fromCharCode(65 + q.options.length) // A, B, C, D...
    setQ(prev => ({
      ...prev,
      options: [...prev.options, { id: nextId, text: '' }]
    }))
  }, [q.options.length])

  const removeOption = useCallback((index) => {
    setQ(prev => {
      const newOptions = prev.options.filter((_, i) => i !== index)
      const removedOptionId = prev.options[index].id
      return {
        ...prev,
        options: newOptions,
        correctAnswers: prev.correctAnswers.filter(id => id !== removedOptionId)
      }
    })
  }, [])

  // 🔬 Test case handlers
  const addTestCase = useCallback(() => {
    setQ(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expected: '' }]
    }))
  }, [])

  const removeTestCase = useCallback((index) => {
    setQ(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index)
    }))
  }, [])

  // 🎯 Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Question</h2>
            <p className="text-gray-500">Please wait while we fetch the question details...</p>
          </div>
        </div>
      </div>
    )
  }

  const currentTypeConfig = getTypeConfig(q.type)
  const currentDifficultyConfig = getDifficultyConfig(q.tags.difficulty)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/questions')}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Questions
          </button>
          
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl font-semibold ${currentDifficultyConfig.color}`}>
              {currentDifficultyConfig.label}
            </div>
            <div className={`px-4 py-2 rounded-xl font-semibold ${currentTypeConfig.textColor} ${currentTypeConfig.bgColor} ${currentTypeConfig.borderColor} border`}>
              <currentTypeConfig.icon className="inline w-4 h-4 mr-2" />
              {currentTypeConfig.label}
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {editMode ? 'Edit Question' : 'Create New Question'}
                </h1>
                <p className="text-blue-100">
                  {editMode ? 'Update your question with the latest information' : 'Build an engaging question for your students'}
                </p>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Question Type & Basic Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Settings size={16} />
                  Question Type
                </label>
                <select
                  value={q.type}
                  onChange={e => setQ({ ...q, type: e.target.value, correctAnswers: [] })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white text-gray-900 font-medium"
                >
                  <option value="mcq">Multiple Choice (Single Answer)</option>
                  <option value="msq">Multiple Choice (Multiple Answers)</option>
                  <option value="descriptive">Descriptive Answer</option>
                  <option value="image">Image Based Question</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Tag size={16} />
                  Difficulty Level
                </label>
                <select
                  value={q.tags.difficulty}
                  onChange={e => setQ({
                    ...q,
                    tags: { ...q.tags, difficulty: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white text-gray-900 font-medium"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Question Content */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <FileText size={20} />
                Question Content
              </label>
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <ReactQuill
                  theme="snow"
                  value={q.content}
                  modules={quillConfig.modules}
                  formats={quillConfig.formats}
                  onChange={value => setQ({ ...q, content: value })}
                  className="min-h-[200px]"
                  placeholder="Write your question here... You can use rich formatting, code blocks, and links."
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <ImageIcon size={20} />
                  Images
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                      uploading 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
                    }`}
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>Upload Image</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {q.images.length > 0 && (
                <div className="space-y-4">
                  {q.images.map((img, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-start gap-4">
                        <img
                          src={img.url}
                          alt=""
                          className="w-32 h-24 object-cover rounded-xl border border-gray-200"
                        />
                        <div className="flex-1 space-y-3">
                          <input
                            placeholder="Add a caption for this image..."
                            value={img.caption}
                            onChange={e => {
                              const copy = [...q.images]
                              copy[idx].caption = e.target.value
                              setQ({ ...q, images: copy })
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setQ({
                              ...q,
                              images: q.images.filter((_, i) => i !== idx)
                            })}
                            className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium transition-colors"
                          >
                            <X size={16} />
                            Remove Image
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Options for MCQ/MSQ */}
            {(q.type === 'mcq' || q.type === 'msq') && (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <label className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    <Hash size={20} />
                    Answer Options
                  </label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-green-200"
                  >
                    <Plus size={16} />
                    Add Option
                  </button>
                </div>
                
                <div className="space-y-4">
                  {q.options.map((opt, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-full">
                          {opt.id}
                        </div>
                        <input
                          placeholder={`Enter option ${opt.id}...`}
                          value={opt.text}
                          onChange={e => {
                            const o = [...q.options]
                            o[i].text = e.target.value
                            setQ({ ...q, options: o })
                          }}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type={q.type === 'mcq' ? 'radio' : 'checkbox'}
                            name="correct"
                            checked={q.correctAnswers.includes(opt.id)}
                            onChange={() => {
                              let ca = [...q.correctAnswers]
                              if (q.type === 'mcq') {
                                ca = [opt.id]
                              } else if (ca.includes(opt.id)) {
                                ca = ca.filter(x => x !== opt.id)
                              } else {
                                ca.push(opt.id)
                              }
                              setQ({ ...q, correctAnswers: ca })
                            }}
                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Correct</span>
                        </label>
                        {q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(i)}
                            className="p-2 text-red-600 hover:text-red-800 transition-colors"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Test Cases */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Code size={20} />
                  Test Cases
                </label>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-purple-200"
                >
                  <Plus size={16} />
                  Add Test Case
                </button>
              </div>
              
              {q.testCases.length === 0 ? (
                <div className="text-center py-8">
                  <Code className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No test cases added yet</p>
                  <p className="text-gray-400 text-sm mt-1">Add test cases for coding questions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {q.testCases.map((tc, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-sm font-semibold text-gray-700">Test Case {i + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeTestCase(i)}
                          className="ml-auto p-1 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Input</label>
                          <input
                            placeholder="Expected input..."
                            value={tc.input}
                            onChange={e => {
                              const t = [...q.testCases]
                              t[i].input = e.target.value
                              setQ({ ...q, testCases: t })
                            }}
                            className="w-full px-3 py-2 font-mono text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-blue-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Expected Output</label>
                          <input
                            placeholder="Expected output..."
                            value={tc.expected}
                            onChange={e => {
                              const t = [...q.testCases]
                              t[i].expected = e.target.value
                              setQ({ ...q, testCases: t })
                            }}
                            className="w-full px-3 py-2 font-mono text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-green-50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Explanation */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Lightbulb size={20} />
                Explanation (Optional)
              </label>
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <ReactQuill
                  theme="snow"
                  value={q.explanation}
                  modules={quillConfig.modules}
                  formats={quillConfig.formats}
                  onChange={value => setQ({ ...q, explanation: value })}
                  className="min-h-[150px]"
                  placeholder="Provide an explanation for the correct answer..."
                />
              </div>
            </div>

            {/* Topics */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Tag size={20} />
                Topics
              </label>
              <div className="space-y-3">
                <input
                  placeholder="Enter topics separated by commas (e.g., JavaScript, Arrays, Algorithms)"
                  value={topicsInput}
                  onChange={e => handleTopicsChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                  onKeyDown={e => {
                    // Handle Enter key to add topic
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      e.preventDefault()
                      const newTopic = e.target.value.trim().split(',').pop().trim()
                      if (newTopic && !q.tags.topics.includes(newTopic)) {
                        const updatedTopics = [...q.tags.topics, newTopic]
                        setQ(prev => ({
                          ...prev,
                          tags: { ...prev.tags, topics: updatedTopics }
                        }))
                        setTopicsInput(updatedTopics.join(', '))
                      }
                    }
                  }}
                />
                <p className="text-sm text-gray-500">
                  Type topics separated by commas or semicolons. Press Enter to add the current topic.
                </p>
                
                {/* Display topic tags */}
                {q.tags.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {q.tags.topics.map((topic, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {topic}
                        <button
                          type="button"
                          onClick={() => removeTopic(topic)}
                          className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/questions')}
                className="flex-1 px-6 py-4 border border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>{editMode ? 'Update Question' : 'Create Question'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}