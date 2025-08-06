// src/components/TopStudentsChart.jsx
import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export default function TopStudentsChart({ data }) {
  // data = [{ name: 'Alice', score: 12 }, ...]
  console.log("Data for stats:", data)
  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="score" fill="#6366F1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
