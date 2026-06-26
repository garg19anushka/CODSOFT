import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="text-center py-20 text-sage font-medium">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
