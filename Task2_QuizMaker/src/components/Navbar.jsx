import { Link, useNavigate } from 'react-router-dom'
import { PencilLine, LogOut, ListChecks } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-chalk border-b-4 border-board">
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-board rounded-full flex items-center justify-center">
            <PencilLine size={17} className="text-pencil" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-board">
            Mark<span className="text-coral">wise</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 font-display font-semibold text-sm text-board">
          <Link to="/quizzes" className="hover:text-coral transition-colors">
            Browse Quizzes
          </Link>
          {user && (
            <Link to="/create" className="hover:text-coral transition-colors">
              Create Quiz
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/my-quizzes"
                className="hidden sm:flex items-center gap-1.5 font-display font-semibold text-sm text-board hover:text-coral transition-colors"
              >
                <ListChecks size={16} /> My Quizzes
              </Link>
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-board/5 rounded-full transition-colors text-board"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="font-display font-semibold text-sm px-4 py-2 text-board hover:text-coral transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="font-display font-semibold text-sm px-4 py-2 bg-board text-chalk rounded-full hover:bg-boardDark transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
