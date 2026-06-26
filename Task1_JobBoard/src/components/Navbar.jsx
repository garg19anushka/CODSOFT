import { Link, useNavigate } from 'react-router-dom'
import { Briefcase, Bell, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-paper border-b-2 border-ink">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-ink rotate-3 flex items-center justify-center group-hover:rotate-0 transition-transform">
            <Briefcase size={16} className="text-amber" strokeWidth={2.5} />
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight">
            Board<span className="text-amber">Room</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 font-display font-bold text-sm uppercase tracking-wide">
          <Link to="/jobs" className="hover:text-amber-dark transition-colors">
            Listings
          </Link>
          {profile?.role === 'employer' && (
            <Link to="/employer/post" className="hover:text-amber-dark transition-colors">
              Post a Job
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/notifications"
                className="p-2 hover:bg-ink/5 rounded-full transition-colors"
                aria-label="Notifications"
              >
                <Bell size={19} />
              </Link>
              <Link
                to={profile?.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard'}
                className="p-2 hover:bg-ink/5 rounded-full transition-colors"
                aria-label="Dashboard"
              >
                <LayoutDashboard size={19} />
              </Link>
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-ink/5 rounded-full transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={19} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="font-display font-bold text-sm uppercase tracking-wide px-4 py-2 hover:text-amber-dark transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="font-display font-bold text-sm uppercase tracking-wide px-4 py-2 bg-ink text-paper hover:bg-amber-dark transition-colors"
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
