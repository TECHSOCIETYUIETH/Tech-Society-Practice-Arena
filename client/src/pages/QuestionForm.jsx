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
  imageUrl: '',
  imageCaption: '',
  options: [{ id: 'A', text: '' }, { id: 'B', text: '' }],
  correctAnswers: [],
  testCases: [],
  explanation: '',
  tags: { topics: [], difficulty: 'beginner' }
}

export default function QuestionForm() {
  const { id } = useParams()
  const editMode = Boolean(id)
  const navigate = useNavigate()
  const [q, setQ] = useState(initial)

  useEffect(() => {
    if (editMode) {
      API.get(`/questions/${id}`)
        .then(r => {
          // convert HTML explanation/content to initial for Quill
          setQ(r.data.data)
        })
        .catch(() => toast.error('Load failed'))
    }
  }, [editMode, id])

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      if (editMode) {
        await API.put(`/questions/${id}`, q)
        toast.success('Updated')
      } else {
        await API.post('/questions', q)
        toast.success('Created')
      }
      navigate('/questions')
    } catch {
      toast.error('Save failed')
    }
  }

  // Quill toolbar
  const toolbar = [['bold','italic','underline'], [{ 'list': 'ordered' }, { 'list': 'bullet' }]]

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow space-y-6">
      <h2 className="text-xl font-semibold">
        {editMode ? 'Edit Question' : 'New Question'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Content */}
        <div>
          <span>Content</span>
          <ReactQuill
            theme="snow"
            value={q.content}
            modules={{ toolbar }}
            onChange={value => setQ({ ...q, content: value })}
          />
        </div>

        {/* Image */}
        {q.type === 'image' && (
          <>
            <label className="block">
              <span>Image URL</span>
              <input
                value={q.imageUrl}
                onChange={e => setQ({ ...q, imageUrl: e.target.value })}
                className="mt-1 w-full border px-2 py-1 rounded"
              />
            </label>
            <label className="block">
              <span>Caption</span>
              <input
                value={q.imageCaption}
                onChange={e => setQ({ ...q, imageCaption: e.target.value })}
                className="mt-1 w-full border px-2 py-1 rounded"
              />
            </label>
          </>
        )}

        {/* Options */}
        {(q.type === 'mcq' || q.type === 'msq') && (
          <div className="space-y-2">
            <span>Options & Correct</span>
            {q.options.map((opt,i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-4">{opt.id}</span>
                <input
                  className="flex-1 border px-2 py-1 rounded"
                  value={opt.text}
                  onChange={e => {
                    const o = [...q.options]; o[i].text = e.target.value
                    setQ({ ...q, options: o })
                  }}
                />
                <input
                  type={q.type==='mcq'?'radio':'checkbox'}
                  name="correct"
                  checked={q.correctAnswers.includes(opt.id)}
                  onChange={() => {
                    let ca = [...q.correctAnswers]
                    if (q.type==='mcq') ca = [opt.id]
                    else if (ca.includes(opt.id)) ca = ca.filter(x=>x!==opt.id)
                    else ca.push(opt.id)
                    setQ({ ...q, correctAnswers: ca })
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Test Cases */}
        {q.type==='descriptive' || q.testCases ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Test Cases</span>
              <button
                type="button"
                onClick={() => setQ({ ...q, testCases: [...q.testCases,{ input:'',expected:'' }] })}
                className="text-blue-600 hover:underline text-sm"
              >
                + Add Test Case
              </button>
            </div>
            {q.testCases.map((tc,i) => (
              <div key={i} className="flex gap-2">
                <input
                  placeholder="Input"
                  value={tc.input}
                  onChange={e => {
                    const t = [...q.testCases]; t[i].input = e.target.value
                    setQ({ ...q, testCases: t })
                  }}
                  className="flex-1 border px-2 py-1 rounded"
                />
                <input
                  placeholder="Expected"
                  value={tc.expected}
                  onChange={e => {
                    const t = [...q.testCases]; t[i].expected = e.target.value
                    setQ({ ...q, testCases: t })
                  }}
                  className="flex-1 border px-2 py-1 rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    const t = q.testCases.filter((_,j)=>j!==i)
                    setQ({ ...q, testCases: t })
                  }}
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {/* Explanation */}
        <div>
          <span>Explanation</span>
          <ReactQuill
            theme="snow"
            value={q.explanation}
            modules={{ toolbar }}
            onChange={value => setQ({ ...q, explanation: value })}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-4">
          <input
            placeholder="Topics (comma separated)"
            value={q.tags.topics.join(',')}
            onChange={e => setQ({
              ...q,
              tags:{ ...q.tags,
                topics: e.target.value.split(',').map(s=>s.trim())
              }
            })}
            className="flex-1 border px-2 py-1 rounded"
          />
          <select
            value={q.tags.difficulty}
            onChange={e => setQ({
              ...q,
              tags:{ ...q.tags, difficulty: e.target.value }
            })}
            className="w-40 border px-2 py-1 rounded"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          {editMode?'Update':'Create'}
        </button>
      </form>
    </div>
  )
}
