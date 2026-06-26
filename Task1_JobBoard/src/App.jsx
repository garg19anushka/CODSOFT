import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import JobListings from './pages/JobListings'
import JobDetail from './pages/JobDetail'
import Notifications from './pages/Notifications'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import EmployerDashboard from './pages/employer/EmployerDashboard'
import PostJob from './pages/employer/PostJob'
import ApplicationsView from './pages/employer/ApplicationsView'
import CandidateDashboard from './pages/candidate/CandidateDashboard'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#14151A',
              color: '#FAF8F4',
              fontWeight: 600,
              borderRadius: 0,
            },
          }}
        />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<JobListings />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/dashboard"
                element={
                  <ProtectedRoute role="employer">
                    <EmployerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/post"
                element={
                  <ProtectedRoute role="employer">
                    <PostJob />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/applications/:jobId"
                element={
                  <ProtectedRoute role="employer">
                    <ApplicationsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/dashboard"
                element={
                  <ProtectedRoute role="candidate">
                    <CandidateDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <footer className="border-t-2 border-ink py-6 text-center text-sm text-slate">
            <p>BoardRoom — built for finding work that fits.</p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
