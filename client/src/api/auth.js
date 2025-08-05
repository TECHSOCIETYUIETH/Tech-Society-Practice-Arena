// src/api/auth.js
import API from './api.js'

// Logs in and returns { user, token }
export function login(email, password) {
  return API
    .post('/auth/login', { email, password })
    .then(res => res.data.data)
}

// Registers a new user and returns { user, token }
export function register(name, email, password, role = 'student') {
  return API
    .post('/auth/register', { name, email, password, role })
    .then(res => res.data.data)
}

// Fetches the current user; no need to pass the token manually
export function fetchMe() {
  return API
    .get('/auth/me')
    .then(res => res.data.data)
}
