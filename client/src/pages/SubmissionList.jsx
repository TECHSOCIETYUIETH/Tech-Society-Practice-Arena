// src/pages/SubmissionList.jsx
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import API from '../api/api.js'
import { toast } from 'react-hot-toast'

export default function SubmissionList() {
  const { id } = useParams()

  const { data: subs = [], isLoading, error } = useQuery(
    ['submissions', id],
    () => API.get(`/assignments/${id}/submissions`).then(r => r.data.data),
    { onError: () => toast.error('Failed to load submissions') }
  )

  if (isLoading) return <p className="p-6 text-center">Loading…</p>
  if (error)     return <p className="p-6 text-red-600">Error loading submissions.</p>

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold">Submissions</h2>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-3 py-2 border">Student</th>
            <th className="px-3 py-2 border">Submitted At</th>
            <th className="px-3 py-2 border">Grade</th>
            <th className="px-3 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subs.map(s => (
            <tr key={s.student._id}>
              <td className="px-3 py-2 border">{s.student.name}</td>
              <td className="px-3 py-2 border">
                {new Date(s.submittedAt).toLocaleString()}
              </td>
              <td className="px-3 py-2 border">
                {s.grade != null ? s.grade : '—'}
              </td>
              <td className="px-3 py-2 border">
                <Link
                  to={`/assignments/${id}/submissions/${s.student._id}`}
                  className="text-blue-600 hover:underline"
                >
                  Review
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
