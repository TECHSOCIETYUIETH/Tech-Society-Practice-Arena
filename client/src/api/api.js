// src/api/api.js
import axios from 'axios'

const API = axios.create({
  baseURL: '/api',            // pointing at http://localhost:5000/api in dev via your proxy
})

// Attach JWT on every request if present
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => Promise.reject(error))

export default API
