import { useState } from 'react'
import { resetPassword } from '../api/auth.js'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export default function ResetPassword(){
  const [pass,setPass]=useState('')
  const { token } = useParams()
  const nav = useNavigate()

  const handle=async e=>{
    e.preventDefault()
    try{
      await resetPassword(token,pass)
      toast.success('Password updated')
      nav('/login')
    }catch{ toast.error('Error') }
  }

  return (
    <form onSubmit={handle}>
      <input required type="password" placeholder="New password"
        value={pass} onChange={e=>setPass(e.target.value)}/>
      <button type="submit">Reset Password</button>
    </form>
  )
}
 