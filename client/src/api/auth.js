import API from './api.js'

export function register(name,email,password,branch,year){
  return API.post('/auth/register',{ name,email,password,branch,year })
    .then(res=>res.data)
}

export function verifyEmail(token){
  return API.get(`/auth/verify/${token}`).then(r=>r.data)
}

export async function login(email, password) {
  const res = await API.post('/auth/login', { email, password })
  // res.data looks like { success: true, data: { user, token } }
  return res.data.data   // <-- return exactly { user, token }
}
export function fetchMe(token){
  return API.get('/auth/me',{ headers:{ Authorization:`Bearer ${token}` } })
    .then(res=>res.data.data)
}

export function forgotPassword(email){
  return API.post('/auth/forgot-password',{ email }).then(r=>r.data)
}

export function resetPassword(token,password){
  return API.post(`/auth/reset-password/${token}`,{ password }).then(r=>r.data)
}
