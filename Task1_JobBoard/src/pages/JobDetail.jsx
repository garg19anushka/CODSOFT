import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  MapPin, IndianRupee, Clock, Building2, ArrowLeft, CheckCircle2, Upload, X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showApply, setShowApply] = useState(false)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [coverNote, setCoverNote] = useState('')
  const [resumeFile, setResumeFile] = useState(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('jobs').select('*').eq('id', id).single()
      setJob(data)

      if (user) {
        const { data: existing } = await supabase
          .from('applications')
          .select('id')
          .eq('job_id', id)
          .eq('candidate_id', user.id)
          .maybeSingle()
        setAlreadyApplied(!!existing)
      }
      setLoading(false)
    }
    load()
  }, [id, user])

  async function handleApply(e) {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    setSubmitting(true)
    try {
      let resumeUrl = profile?.resume_url || null

      if (resumeFile) {
        const ext = resumeFile.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(path, resumeFile)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(path)
        resumeUrl = urlData.publicUrl
      }

      const { error } = await supabase.from('applications').insert({
        job_id: id,
        candidate_id: user.id,
        cover_note: coverNote,
        resume_url: resumeUrl,
      })
      if (error) throw error

      toast.success('Application submitted!')
      setAlreadyApplied(true)
      setShowApply(false)
    } catch (err) {
      toast.error(err.message || 'Could not submit application')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto px-5 py-20 text-center text-slate">Loading...</div>
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-20 text-center">
        <p className="font-display font-bold text-xl mb-2">Listing not found</p>
        <Link to="/jobs" className="text-amber-dark font-bold underline">Back to listings</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate hover:text-ink mb-6">
        <ArrowLeft size={15} /> Back to board
      </Link>

      <div className="relative border-2 border-ink p-8 bg-paper perforated">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="bg-leaf text-paper text-xs font-display font-bold uppercase tracking-wide px-2.5 py-1">
              {job.job_type}
            </span>
            <h1 className="font-display font-black text-3xl md:text-4xl mt-3 leading-tight">
              {job.title}
            </h1>
            <p className="flex items-center gap-1.5 text-slate font-semibold mt-1">
              <Building2 size={15} /> {job.company_name}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-5 text-sm border-y border-dashed border-ink/30 py-4 my-5">
          <span className="flex items-center gap-1.5"><MapPin size={15} className="text-amber-dark" />{job.location}</span>
          {(job.salary_min || job.salary_max) && (
            <span className="flex items-center gap-1.5">
              <IndianRupee size={15} className="text-amber-dark" />
              {job.salary_min && job.salary_max
                ? `${job.salary_min.toLocaleString('en-IN')} – ${job.salary_max.toLocaleString('en-IN')} /yr`
                : `${(job.salary_min || job.salary_max).toLocaleString('en-IN')} /yr`}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock size={15} className="text-amber-dark" />
            Posted {new Date(job.created_at).toLocaleDateString()}
          </span>
        </div>

        <div className="prose-sm">
          <h3 className="font-display font-bold text-lg mb-2">About the role</h3>
          <p className="text-ink/85 leading-relaxed whitespace-pre-line mb-6">{job.description}</p>

          {job.requirements && (
            <>
              <h3 className="font-display font-bold text-lg mb-2">What we're looking for</h3>
              <p className="text-ink/85 leading-relaxed whitespace-pre-line mb-6">{job.requirements}</p>
            </>
          )}
        </div>

        {profile?.role !== 'employer' && (
          <div className="mt-6">
            {alreadyApplied ? (
              <div className="flex items-center gap-2 bg-leaf/10 border-2 border-leaf text-leaf font-display font-bold px-5 py-3">
                <CheckCircle2 size={18} /> You've applied to this role
              </div>
            ) : (
              <button
                onClick={() => setShowApply(true)}
                className="bg-amber border-2 border-ink font-display font-bold uppercase tracking-wide px-8 py-3.5 hover:bg-amber-dark transition-colors shadow-[4px_4px_0_0_#14151A] hover:shadow-[2px_2px_0_0_#14151A] hover:translate-x-0.5 hover:translate-y-0.5"
              >
                Apply for this role
              </button>
            )}
          </div>
        )}
      </div>

      {showApply && (
        <div className="fixed inset-0 bg-ink/60 flex items-center justify-center p-5 z-50">
          <div className="bg-paper border-2 border-ink max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowApply(false)}
              className="absolute top-4 right-4 text-slate hover:text-ink"
            >
              <X size={20} />
            </button>
            <h2 className="font-display font-extrabold text-2xl mb-1">Apply now</h2>
            <p className="text-slate text-sm mb-5">{job.title} · {job.company_name}</p>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block font-bold text-sm mb-1.5">Cover note (optional)</label>
                <textarea
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  rows={4}
                  placeholder="Tell them why you're a great fit..."
                  className="w-full border-2 border-ink p-3 outline-none font-medium text-sm resize-none focus:border-amber-dark"
                />
              </div>
              <div>
                <label className="block font-bold text-sm mb-1.5">Resume</label>
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-ink/40 p-4 cursor-pointer hover:border-amber-dark transition-colors text-sm font-medium text-slate">
                  <Upload size={16} />
                  {resumeFile ? resumeFile.name : 'Upload PDF resume'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                  />
                </label>
                {!resumeFile && profile?.resume_url && (
                  <p className="text-xs text-slate mt-1.5">Using resume from your profile.</p>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-ink text-paper font-display font-bold uppercase tracking-wide py-3 hover:bg-amber-dark transition-colors disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
