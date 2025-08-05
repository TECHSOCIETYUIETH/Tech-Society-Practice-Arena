// src/pages/QuestionForm.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../api/api.js'
import { toast } from 'react-hot-toast'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

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

  const [q, setQ] = useState(initial)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 1. Quill modules & formats for code blocks + links + lists
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'code-block', 'link'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean']
    ]
  }
  const formats = [
    'bold', 'italic', 'underline',
    'code-block', 'link',
    'list', 'bullet'
  ]

  // Load existing question if editing
  useEffect(() => {
    if (!editMode) return
    API.get(`/questions/${id}`)
      .then(r => setQ(r.data.data))
      .catch(() => toast.error('Load failed'))
  }, [editMode, id])

  // Handle image file upload
  const handleFile = async e => {
    const file = e.target.files[0]
    if (!file) return
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
      toast.success('Image uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // Handle submit
  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { ...q }
      if (editMode) {
        await API.put(`/questions/${id}`, payload)
      } else {
        await API.post('/questions', payload)
      }
      toast.success(editMode ? 'Updated' : 'Created')
      navigate('/questions')
    } catch {
      toast.error('Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow space-y-6">
      <h2 className="text-xl font-semibold">
        {editMode ? 'Edit Question' : 'New Question'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Type */}
        <label className="block">
          <span>Type</span>
          <select
            value={q.type}
            onChange={e => setQ({ ...q, type: e.target.value })}
            className="mt-1 w-full border px-2 py-1 rounded"
          >
            <option value="mcq">MCQ</option>
            <option value="msq">MSQ</option>
            <option value="descriptive">Descriptive</option>
            <option value="image">Image</option>
          </select>
        </label>

        {/* Content with code-block & link support */}
        <div>
          <span>Content</span>
          <ReactQuill
            theme="snow"
            value={q.content}
            modules={modules}
            formats={formats}
            onChange={value => setQ({ ...q, content: value })}
          />
        </div>

        {/* Multiple Images */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="block">
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                disabled={uploading}
                className="mt-1"
              />
            </label>
            {uploading && <span className="text-gray-500">Uploading…</span>}
          </div>
          {q.images.map((img, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <img
                src={img.url}
                alt=""
                className="w-24 h-16 object-cover rounded"
              />
              <input
                placeholder="Caption"
                value={img.caption}
                onChange={e => {
                  const copy = [...q.images]
                  copy[idx].caption = e.target.value
                  setQ({ ...q, images: copy })
                }}
                className="flex-1 border px-2 py-1 rounded"
              />
              <button
                type="button"
                onClick={() =>
                  setQ({
                    ...q,
                    images: q.images.filter((_, i) => i !== idx)
                  })
                }
                className="text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Options for MCQ/MSQ */}
        {(q.type === 'mcq' || q.type === 'msq') && (
          <div className="space-y-2">
            <span>Options & Correct</span>
            {q.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-4">{opt.id}</span>
                <input
                  className="flex-1 border px-2 py-1 rounded"
                  value={opt.text}
                  onChange={e => {
                    const o = [...q.options]
                    o[i].text = e.target.value
                    setQ({ ...q, options: o })
                  }}
                />
                <input
                  type={q.type === 'mcq' ? 'radio' : 'checkbox'}
                  name="correct"
                  checked={q.correctAnswers.includes(opt.id)}
                  onChange={() => {
                    let ca = [...q.correctAnswers]
                    if (q.type === 'mcq') ca = [opt.id]
                    else if (ca.includes(opt.id)) ca = ca.filter(x => x !== opt.id)
                    else ca.push(opt.id)
                    setQ({ ...q, correctAnswers: ca })
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Test Cases */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Test Cases</span>
            <button
              type="button"
              onClick={() =>
                setQ({
                  ...q,
                  testCases: [...q.testCases, { input: '', expected: '' }]
                })
              }
              className="text-blue-600 hover:underline text-sm"
            >
              + Add Test Case
            </button>
          </div>
          {q.testCases.map((tc, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder="Input"
                value={tc.input}
                onChange={e => {
                  const t = [...q.testCases]
                  t[i].input = e.target.value
                  setQ({ ...q, testCases: t })
                }}
                className="flex-1 border px-2 py-1 rounded"
              />
              <input
                placeholder="Expected"
                value={tc.expected}
                onChange={e => {
                  const t = [...q.testCases]
                  t[i].expected = e.target.value
                  setQ({ ...q, testCases: t })
                }}
                className="flex-1 border px-2 py-1 rounded"
              />
              <button
                type="button"
                onClick={() => {
                  const t = q.testCases.filter((_, j) => j !== i)
                  setQ({ ...q, testCases: t })
                }}
                className="text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Explanation with code-block & link support */}
        <div>
          <span>Explanation</span>
          <ReactQuill
            theme="snow"
            value={q.explanation}
            modules={modules}
            formats={formats}
            onChange={value => setQ({ ...q, explanation: value })}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-4">
          <input
            placeholder="Topics (comma separated)"
            value={q.tags.topics.join(',')}
            onChange={e =>
              setQ({
                ...q,
                tags: {
                  ...q.tags,
                  topics: e.target.value.split(',').map(s => s.trim())
                }
              })
            }
            className="flex-1 border px-2 py-1 rounded"
          />
          <select
            value={q.tags.difficulty}
            onChange={e =>
              setQ({
                ...q,
                tags: { ...q.tags, difficulty: e.target.value }
              })
            }
            className="w-40 border px-2 py-1 rounded"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
        >
          {submitting ? 'Saving…' : editMode ? 'Update' : 'Create'}
        </button>
      </form>
    </div>
  )
}
