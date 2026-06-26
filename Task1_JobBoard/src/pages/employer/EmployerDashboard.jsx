import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, MapPin, MoreVertical, Trash2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

export default function EmployerDashboard() {
  const { user, profile } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState(null)

  useEffect(() => {
    if (user) load()
  }, [user])

  async function load() {
    setLoading(true)
    const { data: jobsData } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', user.id)
      .order('created_at', { ascending: false })

    const jobsWithCounts = await Promise.all(
      (jobsData || []).map(async (job) => {
        const { count } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', job.id)
        return { ...job, applicationCount: count || 0 }
      })
    )
    setJobs(jobsWithCounts)
    setLoading(false)
  }

  async function toggleStatus(job) {
    const newStatus = job.status === 'open' ? 'closed' : 'open'
    const { error } = await supabase.from('jobs').update({ status: newStatus }).eq('id', job.id)
    if (error) {
      toast.error('Could not update listing')
      return
    }
    toast.success(newStatus === 'open' ? 'Listing reopened' : 'Listing closed')
    load()
    setOpenMenu(null)
  }

  async function deleteJob(job) {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return
    const { error } = await supabase.from('jobs').delete().eq('id', job.id)
    if (error) {
      toast.error('Could not delete listing')
      return
    }
    toast.success('Listing deleted')
    load()
    setOpenMenu(null)
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-3xl">
            {profile?.company_name || 'Your'} Dashboard
          </h1>
          <p className="text-slate text-sm mt-1">Manage your listings and applications</p>
        </div>
        <Link
          to="/employer/post"
          className="flex items-center gap-2 bg-amber border-2 border-ink font-display font-bold uppercase text-sm tracking-wide px-5 py-3 hover:bg-amber-dark transition-colors shadow-[4px_4px_0_0_#14151A] hover:shadow-[2px_2px_0_0_#14151A] hover:translate-x-0.5 hover:translate-y-0.5"
        >
          <Plus size={16} /> Post a Job
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="border-2 border-ink p-5">
          <p className="font-display font-black text-3xl">{jobs.length}</p>
          <p className="text-xs uppercase font-bold text-slate tracking-wide">Total Listings</p>
        </div>
        <div className="border-2 border-ink p-5">
          <p className="font-display font-black text-3xl">
            {jobs.filter((j) => j.status === 'open').length}
          </p>
          <p className="text-xs uppercase font-bold text-slate tracking-wide">Open Roles</p>
        </div>
        <div className="border-2 border-ink p-5">
          <p className="font-display font-black text-3xl">
            {jobs.reduce((sum, j) => sum + j.applicationCount, 0)}
          </p>
          <p className="text-xs uppercase font-bold text-slate tracking-wide">Total Applications</p>
        </div>
      </div>

      {loading ? (
        <p className="text-slate">Loading...</p>
      ) : jobs.length === 0 ? (
        <div className="border-2 border-dashed border-ink/30 p-16 text-center">
          <p className="font-display font-bold text-lg mb-1">No listings yet</p>
          <p className="text-slate text-sm mb-5">Post your first role to start receiving applications.</p>
          <Link
            to="/employer/post"
            className="inline-block bg-ink text-paper font-display font-bold uppercase text-sm tracking-wide px-6 py-3 hover:bg-amber-dark transition-colors"
          >
            Post a Job
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="border-2 border-ink p-5 flex items-center justify-between gap-4 flex-wrap"
            >
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-bold text-lg">{job.title}</h3>
                  <span
                    className={`text-[10px] font-display font-bold uppercase px-2 py-0.5 ${
                      job.status === 'open' ? 'bg-leaf text-paper' : 'bg-slate text-paper'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                <p className="flex items-center gap-1.5 text-sm text-slate">
                  <MapPin size={13} /> {job.location} · {job.job_type}
                </p>
              </div>

              <Link
                to={`/employer/applications/${job.id}`}
                className="flex items-center gap-1.5 font-bold text-sm hover:text-amber-dark"
              >
                <Users size={15} /> {job.applicationCount} applicant
                {job.applicationCount !== 1 ? 's' : ''}
              </Link>

              <div className="relative">
                <button
                  onClick={() => setOpenMenu(openMenu === job.id ? null : job.id)}
                  className="p-2 hover:bg-ink/5 rounded-full"
                >
                  <MoreVertical size={18} />
                </button>
                {openMenu === job.id && (
                  <div className="absolute right-0 top-10 bg-paper border-2 border-ink z-10 w-44 shadow-[4px_4px_0_0_#14151A]">
                    <button
                      onClick={() => toggleStatus(job)}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-amber-light flex items-center gap-2"
                    >
                      <XCircle size={14} />
                      {job.status === 'open' ? 'Close listing' : 'Reopen listing'}
                    </button>
                    <button
                      onClick={() => deleteJob(job)}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-rust/10 text-rust flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
