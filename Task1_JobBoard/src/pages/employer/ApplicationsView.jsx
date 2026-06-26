import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

const STATUSES = ['submitted', 'reviewed', 'shortlisted', 'rejected', 'hired']

const statusColors = {
  submitted: 'bg-slate',
  reviewed: 'bg-amber-dark',
  shortlisted: 'bg-leaf',
  hired: 'bg-leaf',
  rejected: 'bg-rust',
}

export default function ApplicationsView() {
  const { jobId } = useParams()
  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [jobId])

  async function load() {
    setLoading(true)
    const { data: jobData } = await supabase.from('jobs').select('*').eq('id', jobId).single()
    setJob(jobData)

    const { data: apps } = await supabase
      .from('applications')
      .select('*, profiles:candidate_id (full_name, email, headline, resume_url)')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
    setApplications(apps || [])
    setLoading(false)
  }

  async function updateStatus(appId, status) {
    const { error } = await supabase.from('applications').update({ status }).eq('id', appId)
    if (error) {
      toast.error('Could not update status')
      return
    }
    toast.success(`Marked as ${status}`)
    load()
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <Link to="/employer/dashboard" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate hover:text-ink mb-6">
        <ArrowLeft size={15} /> Back to dashboard
      </Link>

      <h1 className="font-display font-black text-3xl mb-1">{job?.title}</h1>
      <p className="text-slate mb-8">{applications.length} application{applications.length !== 1 ? 's' : ''}</p>

      {loading ? (
        <p className="text-slate">Loading...</p>
      ) : applications.length === 0 ? (
        <div className="border-2 border-dashed border-ink/30 p-16 text-center">
          <p className="font-display font-bold text-lg mb-1">No applications yet</p>
          <p className="text-slate text-sm">Check back once candidates start applying.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="border-2 border-ink p-5">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                <div>
                  <h3 className="font-display font-bold text-lg">{app.profiles?.full_name}</h3>
                  <p className="flex items-center gap-1.5 text-sm text-slate">
                    <Mail size={13} /> {app.profiles?.email}
                  </p>
                  {app.profiles?.headline && (
                    <p className="text-sm text-ink/70 mt-0.5">{app.profiles.headline}</p>
                  )}
                </div>
                <span className={`${statusColors[app.status]} text-paper text-[11px] font-display font-bold uppercase px-2.5 py-1`}>
                  {app.status}
                </span>
              </div>

              {app.cover_note && (
                <p className="text-sm text-ink/85 bg-ink/[0.03] border border-dashed border-ink/20 p-3 mb-3 leading-relaxed">
                  {app.cover_note}
                </p>
              )}

              <div className="flex items-center justify-between flex-wrap gap-3">
                {(app.resume_url || app.profiles?.resume_url) ? (
                  <a
                    href={app.resume_url || app.profiles?.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-sm font-bold text-amber-dark hover:underline"
                  >
                    <FileText size={15} /> View Resume
                  </a>
                ) : (
                  <span className="text-sm text-slate">No resume attached</span>
                )}

                <select
                  value={app.status}
                  onChange={(e) => updateStatus(app.id, e.target.value)}
                  className="border-2 border-ink px-3 py-1.5 text-sm font-bold outline-none bg-paper"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
