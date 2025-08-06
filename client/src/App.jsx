import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext } from './contexts/AuthContext.jsx'
import Layout from './components/Layout.jsx'

import Login            from './pages/Login.jsx'
import Register         from './pages/Register.jsx'
import VerifyEmail      from './pages/VerifyEmail.jsx'
import ForgotPassword   from './pages/ForgotPassword.jsx'
import ResetPassword    from './pages/ResetPassword.jsx'

import MentorDashboard  from './pages/MentorDashboard.jsx'
import AdminDashboard   from './pages/AdminDashboard.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import StudentProfile   from './pages/StudentProfile.jsx'
import MentorProfile    from './pages/MentorProfile.jsx'

import QuestionsList    from './pages/QuestionsList.jsx'
import QuestionForm     from './pages/QuestionForm.jsx'
import QuestionDetail   from './pages/QuestionDetail.jsx'

import AssignmentList   from './pages/AssignmentList.jsx'
import AssignmentForm   from './pages/AssignmentForm.jsx'
import AssignmentDetail from './pages/AssignmentDetail.jsx'

import SubmissionForm   from './pages/SubmissionForm.jsx'
import SubmissionList   from './pages/SubmissionList.jsx'
import SubmissionReview from './pages/SubmissionReview.jsx'

function Protected({ children }) {
  const { user, loading } = useContext(AuthContext)
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading…</p>
      </div>
    )
  }
  return user ? children : <Navigate to="/login" replace />
}

function NavigateToDashboard() {
  const { user } = useContext(AuthContext)
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin')   return <Navigate to="/admin"  replace />
  if (user.role === 'mentor')  return <Navigate to="/mentor" replace />
  if (user.role === 'student') return <Navigate to="/student" replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Public auth flow */}
        <Route path="/login"             element={<Login />} />
        <Route path="/register"          element={<Register />} />
        <Route path="/verify-email/:token"  element={<VerifyEmail />} />
        <Route path="/forgot-password"      element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Root → role‐based redirect */}
        <Route
          path="/"
          element={
            <Protected>
              <NavigateToDashboard />
            </Protected>
          }
        />

        {/* Dashboards */}
        <Route
          path="/admin"
          element={
            <Protected>
              <AdminDashboard />
            </Protected>
          }
        />
        <Route
          path="/mentor"
          element={
            <Protected>
              <MentorDashboard />
            </Protected>
          }
        />
        <Route
          path="/student"
          element={
            <Protected>
              <StudentDashboard />
            </Protected>
          }
        />

        {/* Profiles */}
        <Route
          path="/users/:id"
          element={
            <Protected>
              {/* choose component by role or user type */}
              <Routes>
                <Route path="" element={<StudentProfile />} />
                <Route path="" element={<MentorProfile />} />
              </Routes>
            </Protected>
          }
        />

        {/* Questions CRUD */}
        <Route path="/questions"           element={<Protected><QuestionsList /></Protected>} />
        <Route path="/questions/new"       element={<Protected><QuestionForm /></Protected>} />
        <Route path="/questions/:id/edit"  element={<Protected><QuestionForm /></Protected>} />
        <Route path="/questions/:id"       element={<Protected><QuestionDetail /></Protected>} />

        {/* Assignments / Submissions */}
        <Route path="/assignments"               element={<Protected><AssignmentList /></Protected>} />
        <Route path="/assignments/new"           element={<Protected><AssignmentForm /></Protected>} />
        <Route path="/assignments/:id/edit"      element={<Protected><AssignmentForm /></Protected>} />
        <Route path="/assignments/:id"           element={<Protected><AssignmentDetail /></Protected>} />
        <Route path="/assignments/:id/submit"    element={<Protected><SubmissionForm /></Protected>} />
        <Route path="/assignments/:id/submissions"          element={<Protected><SubmissionList /></Protected>} />
        <Route path="/assignments/:id/submissions/:studentId" element={<Protected><SubmissionReview /></Protected>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
