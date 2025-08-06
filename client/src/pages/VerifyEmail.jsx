import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { verifyEmail } from '../api/auth.js'
import { toast } from 'react-hot-toast'

export default function VerifyEmail(){
  const { token } = useParams()
  const nav = useNavigate()

  useEffect(()=>{
    verifyEmail(token)
      .then(()=>{ toast.success('Email verified!') })
      .catch(()=>{ toast.error('Invalid token') })
      .finally(()=>nav('/login'))
  },[token])

  return <p className="p-6">Verifying…</p>
}
