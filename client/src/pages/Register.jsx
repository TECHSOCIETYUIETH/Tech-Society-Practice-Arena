import React, { useState, useContext } from 'react'
import AuthContext from '../contexts/AuthContext.jsx'

export default function Register() {
  const { register } = useContext(AuthContext)
  const [name,setName] = useState(''),
        [email,setEmail] = useState(''),
        [pw,setPw] = useState('')

  const submit = e => {
    e.preventDefault()
    register(name,email,pw)  // default role student
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-white p-6 rounded shadow">
        <h2 className="text-2xl mb-4">Register</h2>
        <label className="block mb-2">
          Name
          <input
            value={name}
            onChange={e=>setName(e.target.value)}
            className="mt-1 w-full border px-2 py-1 rounded"
            required
          />
        </label>
        <label className="block mb-2">
          Email
          <input
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            className="mt-1 w-full border px-2 py-1 rounded"
            required
          />
        </label>
        <label className="block mb-4">
          Password
          <input
            type="password"
            value={pw}
            onChange={e=>setPw(e.target.value)}
            className="mt-1 w-full border px-2 py-1 rounded"
            required
          />
        </label>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Register
        </button>
        <p className="mt-4 text-sm">
          Already have an account? <a href="/login" className="text-blue-600">Login</a>
        </p>
      </form>
    </div>
  )
}
