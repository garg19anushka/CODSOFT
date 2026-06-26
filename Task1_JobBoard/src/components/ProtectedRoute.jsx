import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <div className="text-center py-20 text-slate">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && profile?.role !== role) {
    return <Navigate to="/" replace />
  }

  return children
}
