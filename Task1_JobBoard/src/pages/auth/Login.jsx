import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await signIn({ email, password })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Welcome back!')
    navigate('/')
  }

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-ink rotate-3 flex items-center justify-center mx-auto mb-4">
          <Briefcase size={22} className="text-amber" strokeWidth={2.5} />
        </div>
        <h1 className="font-display font-black text-3xl">Welcome back</h1>
        <p className="text-slate text-sm mt-1">Log in to your BoardRoom account</p>
      </div>

      <form onSubmit={handleSubmit} className="border-2 border-ink p-6 space-y-4">
        <div>
          <label className="block font-bold text-sm mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-ink p-3 outline-none font-medium focus:border-amber-dark"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block font-bold text-sm mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-ink p-3 outline-none font-medium focus:border-amber-dark"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-paper font-display font-bold uppercase tracking-wide py-3 hover:bg-amber-dark transition-colors disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <p className="text-center text-sm text-slate mt-5">
        Don't have an account?{' '}
        <Link to="/signup" className="font-bold text-ink underline hover:text-amber-dark">
          Sign up
        </Link>
      </p>
    </div>
  )
}
