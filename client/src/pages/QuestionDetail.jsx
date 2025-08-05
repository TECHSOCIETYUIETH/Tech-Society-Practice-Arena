// src/pages/QuestionDetail.jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import API from '../api/api.js'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'

export default function QuestionDetail() {
  const { id } = useParams()
  const [q, setQ] = useState(null)

  useEffect(() => {
    API.get(`/questions/${id}`)
      .then(r => setQ(r.data.data))
      .catch(() => toast.error('Failed to load'))
  }, [id])

  if (!q) {
    return <p className="p-6 text-center">Loading…</p>
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">

      {/* Back to list */}
      <Link
        to="/questions"
        className="flex items-center text-blue-600 hover:underline"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to List
      </Link>

      {/* Title */}
      <h1 className="text-2xl font-semibold">{/* render plain text title if needed */}</h1>

      {/* Meta */}
      <div className="text-sm text-gray-500 flex flex-wrap gap-2">
        <span className="uppercase">{q.type}</span>
        <span>{q.tags.difficulty}</span>
        <span>By {q.tags.creator?.name}</span>
        <span>{format(new Date(q.createdAt), 'PPP')}</span>
      </div>

      {/* Rich Content */}
      <div className="prose max-w-none">
        <div dangerouslySetInnerHTML={{ __html: q.content }} />
      </div>

      {/* Images */}
      {q.images.map((img, i) => (
        <figure key={i} className="my-4">
          <img
            src={img.url}
            alt={img.caption}
            className="w-full max-w-md mx-auto object-contain rounded"
          />
          {img.caption && (
            <figcaption className="text-center text-sm text-gray-600 mt-1">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}

      {/* MCQ/MSQ Options */}
      {(q.type === 'mcq' || q.type === 'msq') && (
        <ul className="list-disc pl-5 space-y-1">
          {q.options.map(o => (
            <li
              key={o.id}
              className={
                q.correctAnswers.includes(o.id)
                  ? 'font-bold text-green-600'
                  : ''
              }
            >
              {o.id}. {o.text}
            </li>
          ))}
        </ul>
      )}

      {/* Test Cases */}
      {q.testCases && q.testCases.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold">Test Cases</h2>
          <table className="w-full mt-2 border-collapse border">
            <thead>
              <tr>
                <th className="px-2 py-1 border">Input</th>
                <th className="px-2 py-1 border">Expected</th>
              </tr>
            </thead>
            <tbody>
              {q.testCases.map((tc, i) => (
                <tr key={i}>
                  <td className="px-2 py-1 border font-mono">{tc.input}</td>
                  <td className="px-2 py-1 border font-mono">{tc.expected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Explanation */}
      {q.explanation && (
        <div className="mt-4">
          <h2 className="font-semibold">Explanation</h2>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: q.explanation }}
          />
        </div>
      )}
    </div>
  )
}
