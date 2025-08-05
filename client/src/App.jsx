import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AuthContext from './contexts/AuthContext.jsx'

import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'

import QuestionsList  from './pages/QuestionsList.jsx'
import QuestionForm   from './pages/QuestionForm.jsx'
import QuestionDetail  from './pages/QuestionDetail.jsx'

function Protected({ children }) {
  const { user } = useContext(AuthContext)
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        <Protected>
          <Dashboard />
        </Protected>
      } />
      <Route path="/questions" element={
       <Protected><QuestionsList /></Protected>
     } />
     <Route path="/questions/new" element={
       <Protected><QuestionForm /></Protected>
     } />
     <Route path="/questions/:id/edit" element={
      <Protected><QuestionForm /></Protected>
     } />
     <Route path="/questions/:id" element={
       <Protected><QuestionDetail /></Protected>
   }/>

   
    </Routes>
  )
}
