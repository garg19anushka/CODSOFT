import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote']

export default function PostJob() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: '',
    location: '',
    job_type: 'Full-time',
    salary_min: '',
    salary_max: '',
    description: '',
    requirements: '',
  })

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)

    const { error } = await supabase.from('jobs').insert({
      employer_id: user.id,
      title: form.title,
      company_name: profile?.company_name || 'Company',
      location: form.location,
      job_type: form.job_type,
      salary_min: form.salary_min ? parseInt(form.salary_min) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      description: form.description,
      requirements: form.requirements,
    })

    setSubmitting(false)

    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Job posted!')
    navigate('/employer/dashboard')
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="font-display font-black text-3xl mb-1">Post a job</h1>
      <p className="text-slate text-sm mb-8">
        Posting as <span className="font-bold">{profile?.company_name}</span>
      </p>

      <form onSubmit={handleSubmit} className="border-2 border-ink p-6 space-y-5">
        <div>
          <label className="block font-bold text-sm mb-1.5">Job title</label>
          <input
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. Frontend Developer"
            className="w-full border-2 border-ink p-3 outline-none font-medium focus:border-amber-dark"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-sm mb-1.5">Location</label>
            <input
              required
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="Remote / City"
              className="w-full border-2 border-ink p-3 outline-none font-medium focus:border-amber-dark"
            />
          </div>
          <div>
            <label className="block font-bold text-sm mb-1.5">Job type</label>
            <select
              value={form.job_type}
              onChange={(e) => update('job_type', e.target.value)}
              className="w-full border-2 border-ink p-3 outline-none font-medium bg-paper focus:border-amber-dark"
            >
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-sm mb-1.5">Min salary (₹/yr, optional)</label>
            <input
              type="number"
              value={form.salary_min}
              onChange={(e) => update('salary_min', e.target.value)}
              placeholder="300000"
              className="w-full border-2 border-ink p-3 outline-none font-medium focus:border-amber-dark"
            />
          </div>
          <div>
            <label className="block font-bold text-sm mb-1.5">Max salary (₹/yr, optional)</label>
            <input
              type="number"
              value={form.salary_max}
              onChange={(e) => update('salary_max', e.target.value)}
              placeholder="600000"
              className="w-full border-2 border-ink p-3 outline-none font-medium focus:border-amber-dark"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-sm mb-1.5">Description</label>
          <textarea
            required
            rows={5}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Describe the role, responsibilities, and team..."
            className="w-full border-2 border-ink p-3 outline-none font-medium resize-none focus:border-amber-dark"
          />
        </div>

        <div>
          <label className="block font-bold text-sm mb-1.5">Requirements (optional)</label>
          <textarea
            rows={4}
            value={form.requirements}
            onChange={(e) => update('requirements', e.target.value)}
            placeholder="Skills, experience, qualifications..."
            className="w-full border-2 border-ink p-3 outline-none font-medium resize-none focus:border-amber-dark"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-amber border-2 border-ink font-display font-bold uppercase tracking-wide py-3.5 hover:bg-amber-dark transition-colors disabled:opacity-60"
        >
          {submitting ? 'Posting...' : 'Publish Listing'}
        </button>
      </form>
    </div>
  )
}
