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

  if (!q) return <p className="p-6">Loading…</p>

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Link to="/questions" className="flex items-center text-blue-600 hover:underline">
        <ArrowLeft size={16} className="mr-1"/> Back to List
      </Link>

      <h1 className="text-2xl font-semibold">{q.content}</h1>
      <div className="text-sm text-gray-500 flex flex-wrap gap-2">
        <span className="uppercase">{q.type}</span>
        <span>{q.tags.difficulty}</span>
        <span>By {q.tags.creator.name}</span>
        <span>{format(new Date(q.createdAt), 'PPP')}</span>
      </div>

      {q.type === 'image' && (
        <figure className="my-4">
          <img src={q.imageUrl} alt={q.imageCaption} className="w-full object-contain rounded"/>
          <figcaption className="text-sm text-gray-600 mt-1">{q.imageCaption}</figcaption>
        </figure>
      )}

      {(q.type==='mcq'||q.type==='msq') && (
        <ul className="list-disc pl-5 space-y-1">
          {q.options.map(o => (
            <li key={o.id} className={q.correctAnswers.includes(o.id) ? 'font-bold text-green-600' : ''}>
              {o.id}. {o.text}
            </li>
          ))}
        </ul>
      )}

      {q.testCases && q.testCases.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold">Test Cases</h2>
          <table className="w-full mt-2 border">
            <thead><tr><th className="px-2 py-1 border">Input</th><th className="px-2 py-1 border">Expected</th></tr></thead>
            <tbody>
              {q.testCases.map((tc,i) => (
                <tr key={i}>
                  <td className="px-2 py-1 border font-mono">{tc.input}</td>
                  <td className="px-2 py-1 border font-mono">{tc.expected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {q.explanation && (
        <div className="mt-4">
          <h2 className="font-semibold">Explanation</h2>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: q.explanation }}
          />
        </div>
      )}
    </div>
  )
}
