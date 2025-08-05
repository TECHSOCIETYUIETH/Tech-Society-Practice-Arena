// src/App.jsx
import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import Login       from './pages/Login.jsx'
import Register    from './pages/Register.jsx'
import Dashboard   from './pages/Dashboard.jsx'
import QuestionsList   from './pages/QuestionsList.jsx'
import QuestionForm    from './pages/QuestionForm.jsx'
import QuestionDetail  from './pages/QuestionDetail.jsx'

import AssignmentList    from './pages/AssignmentList.jsx'
import AssignmentForm    from './pages/AssignmentForm.jsx'
import AssignmentDetail  from './pages/AssignmentDetail.jsx'
import SubmissionForm    from './pages/SubmissionForm.jsx'
import SubmissionList    from './pages/SubmissionList.jsx'
import SubmissionReview  from './pages/SubmissionReview.jsx'

import AuthContext from './contexts/AuthContext.jsx'
import Layout      from './components/Layout.jsx'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient()

function Protected({ children }) {
  const { user } = useContext(AuthContext)
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route path="/" element={<Protected><Dashboard /></Protected>} />

          {/* Questions */}
          <Route path="/questions"           element={<Protected><QuestionsList /></Protected>} />
          <Route path="/questions/new"       element={<Protected><QuestionForm /></Protected>} />
          <Route path="/questions/:id/edit"  element={<Protected><QuestionForm /></Protected>} />
          <Route path="/questions/:id"       element={<Protected><QuestionDetail /></Protected>} />

          {/* Assignments */}
          <Route path="/assignments"           element={<Protected><AssignmentList /></Protected>} />
          <Route path="/assignments/new"       element={<Protected><AssignmentForm /></Protected>} />
          <Route path="/assignments/:id/edit"  element={<Protected><AssignmentForm /></Protected>} />
          <Route path="/assignments/:id"       element={<Protected><AssignmentDetail /></Protected>} />

          {/* Student Submissions */}
          <Route path="/assignments/:id/submit" element={<Protected><SubmissionForm /></Protected>} />

          {/* Mentor/Admin Submissions */}
          <Route path="/assignments/:id/submissions"           element={<Protected><SubmissionList /></Protected>} />
          <Route path="/assignments/:id/submissions/:studentId" element={<Protected><SubmissionReview /></Protected>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>

      <Toaster position="top-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
