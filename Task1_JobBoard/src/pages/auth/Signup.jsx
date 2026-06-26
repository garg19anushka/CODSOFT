import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase, Building2, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('candidate')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signUp({ email, password, fullName, role, companyName })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Account created! Welcome to BoardRoom.')
    navigate(role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard')
  }

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-ink rotate-3 flex items-center justify-center mx-auto mb-4">
          <Briefcase size={22} className="text-amber" strokeWidth={2.5} />
        </div>
        <h1 className="font-display font-black text-3xl">Join BoardRoom</h1>
        <p className="text-slate text-sm mt-1">Create your account in seconds</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => setRole('candidate')}
          className={`flex flex-col items-center gap-2 border-2 border-ink p-4 transition-colors ${
            role === 'candidate' ? 'bg-amber' : 'bg-paper hover:bg-amber-light'
          }`}
        >
          <User size={20} />
          <span className="font-display font-bold text-sm">Job Seeker</span>
        </button>
        <button
          onClick={() => setRole('employer')}
          className={`flex flex-col items-center gap-2 border-2 border-ink p-4 transition-colors ${
            role === 'employer' ? 'bg-amber' : 'bg-paper hover:bg-amber-light'
          }`}
        >
          <Building2 size={20} />
          <span className="font-display font-bold text-sm">Employer</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="border-2 border-ink p-6 space-y-4">
        <div>
          <label className="block font-bold text-sm mb-1.5">
            {role === 'employer' ? 'Your name' : 'Full name'}
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border-2 border-ink p-3 outline-none font-medium focus:border-amber-dark"
            placeholder="Jane Doe"
          />
        </div>

        {role === 'employer' && (
          <div>
            <label className="block font-bold text-sm mb-1.5">Company name</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border-2 border-ink p-3 outline-none font-medium focus:border-amber-dark"
              placeholder="Acme Inc."
            />
          </div>
        )}

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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-ink p-3 outline-none font-medium focus:border-amber-dark"
            placeholder="At least 6 characters"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-paper font-display font-bold uppercase tracking-wide py-3 hover:bg-amber-dark transition-colors disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate mt-5">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-ink underline hover:text-amber-dark">
          Log in
        </Link>
      </p>
    </div>
  )
}
