import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import QuizListing from './pages/QuizListing'
import CreateQuiz from './pages/CreateQuiz'
import TakeQuiz from './pages/TakeQuiz'
import QuizResults from './pages/QuizResults'
import MyQuizzes from './pages/MyQuizzes'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1F3D2E',
              color: '#F7F5EF',
              fontWeight: 600,
              borderRadius: '999px',
            },
          }}
        />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/quizzes" element={<QuizListing />} />
              <Route path="/quiz/:id" element={<TakeQuiz />} />
              <Route path="/results/:attemptId" element={<QuizResults />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreateQuiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-quizzes"
                element={
                  <ProtectedRoute>
                    <MyQuizzes />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <footer className="border-t-2 border-board/15 py-6 text-center text-sm text-sage">
            <p>Markwise — test what you know, share what you make.</p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
