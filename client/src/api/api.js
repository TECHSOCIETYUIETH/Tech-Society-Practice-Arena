// src/api/api.js
import axios from 'axios'

// If you’re using a Vite proxy, baseURL can just be '/api'
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
})

// Automatically attach the JWT token (if any) to every request
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default API
