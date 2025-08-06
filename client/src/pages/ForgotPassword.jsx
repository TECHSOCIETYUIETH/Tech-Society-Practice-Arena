import { useState } from 'react'
import { forgotPassword } from '../api/auth.js'
import { toast } from 'react-hot-toast'

export default function ForgotPassword(){
  const [email,setEmail]=useState('')
  const handle=async e=>{
    e.preventDefault()
    try{ await forgotPassword(email); toast.success('Check your inbox') }
    catch{ toast.error('Error') }
  }
  return (
    <form onSubmit={handle}>
      <input required type="email" placeholder="Your email"
        value={email} onChange={e=>setEmail(e.target.value)}/>
      <button type="submit">Send reset link</button>
    </form>
  )
}
