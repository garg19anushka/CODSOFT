import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PencilLine } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { friendlyFirebaseError } from '../../lib/errors'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn({ email, password })
    setLoading(false)
    if (error) {
      toast.error(friendlyFirebaseError(error))
      return
    }
    toast.success('Welcome back!')
    navigate('/')
  }

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-board rounded-full flex items-center justify-center mx-auto mb-4">
          <PencilLine size={20} className="text-pencil" strokeWidth={2.5} />
        </div>
        <h1 className="font-display font-bold text-3xl text-board">Welcome back</h1>
        <p className="text-sage text-sm mt-1">Log in to your Markwise account</p>
      </div>

      <form onSubmit={handleSubmit} className="border-2 border-board/15 rounded-3xl p-6 space-y-4 bg-white">
        <div>
          <label className="block font-display font-bold text-sm text-board mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-board/20 rounded-xl p-3 outline-none font-medium focus:border-coral"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block font-display font-bold text-sm text-board mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-board/20 rounded-xl p-3 outline-none font-medium focus:border-coral"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-board text-chalk font-display font-bold py-3 rounded-full hover:bg-boardDark transition-colors disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="text-center text-sm text-sage mt-5">
        Don't have an account?{' '}
        <Link to="/signup" className="font-bold text-board underline hover:text-coral">
          Sign up
        </Link>
      </p>
    </div>
  )
}
