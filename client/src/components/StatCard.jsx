// src/components/StatCard.jsx
import React from 'react'

export default function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-lg flex items-center space-x-4 shadow-lg">
      {Icon && <Icon size={32}/>}
      <div>
        <p className="text-3xl font-bold">{value}</p>
        <p className="uppercase tracking-wide">{label}</p>
      </div>
    </div>
  )
}
