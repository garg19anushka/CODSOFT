import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Upload, MapPin, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const statusColors = {
  submitted: 'bg-slate',
  reviewed: 'bg-amber-dark',
  shortlisted: 'bg-leaf',
  hired: 'bg-leaf',
  rejected: 'bg-rust',
}

export default function CandidateDashboard() {
  const { user, profile, refreshProfile } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)

  useEffect(() => {
    if (profile) {
      setHeadline(profile.headline || '')
      setBio(profile.bio || '')
    }
  }, [profile])

  useEffect(() => {
    if (user) loadApplications()
  }, [user])

  async function loadApplications() {
    setLoading(true)
    const { data } = await supabase
      .from('applications')
      .select('*, jobs:job_id (title, company_name, location, job_type)')
      .eq('candidate_id', user.id)
      .order('created_at', { ascending: false })
    setApplications(data || [])
    setLoading(false)
  }

  async function saveProfile() {
    setSavingProfile(true)
    const { error } = await supabase
      .from('profiles')
      .update({ headline, bio })
      .eq('id', user.id)
    setSavingProfile(false)
    if (error) {
      toast.error('Could not save profile')
      return
    }
    toast.success('Profile updated')
    await refreshProfile()
    setEditing(false)
  }

  async function handleResumeUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingResume(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/profile-resume.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(path)
      const { error } = await supabase
        .from('profiles')
        .update({ resume_url: urlData.publicUrl })
        .eq('id', user.id)
      if (error) throw error
      await refreshProfile()
      toast.success('Resume uploaded')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploadingResume(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="font-display font-black text-3xl mb-1">My Dashboard</h1>
      <p className="text-slate text-sm mb-8">Manage your profile and track applications</p>

      {/* Profile card */}
      <div className="border-2 border-ink p-6 mb-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-xl">{profile?.full_name}</h2>
            <p className="text-sm text-slate">{profile?.email}</p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="text-sm font-bold underline hover:text-amber-dark"
          >
            {editing ? 'Cancel' : 'Edit profile'}
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-sm mb-1.5">Headline</label>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Frontend Developer"
                className="w-full border-2 border-ink p-2.5 outline-none font-medium focus:border-amber-dark"
              />
            </div>
            <div>
              <label className="block font-bold text-sm mb-1.5">Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A short summary about your experience..."
                className="w-full border-2 border-ink p-2.5 outline-none font-medium resize-none focus:border-amber-dark"
              />
            </div>
            <button
              onClick={saveProfile}
              disabled={savingProfile}
              className="bg-ink text-paper font-display font-bold uppercase text-sm tracking-wide px-5 py-2.5 hover:bg-amber-dark transition-colors disabled:opacity-60"
            >
              {savingProfile ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        ) : (
          <>
            {profile?.headline && <p className="font-semibold text-ink/90 mb-1">{profile.headline}</p>}
            {profile?.bio && <p className="text-sm text-slate leading-relaxed">{profile.bio}</p>}
          </>
        )}

        <div className="mt-5 pt-4 border-t border-dashed border-ink/30">
          <label className="font-bold text-sm mb-1.5 block">Resume</label>
          <label className="inline-flex items-center gap-2 border-2 border-dashed border-ink/40 px-4 py-2.5 cursor-pointer hover:border-amber-dark transition-colors text-sm font-medium text-slate">
            <Upload size={15} />
            {uploadingResume ? 'Uploading...' : profile?.resume_url ? 'Replace resume' : 'Upload resume'}
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleResumeUpload}
              disabled={uploadingResume}
            />
          </label>
          {profile?.resume_url && (
            <a
              href={profile.resume_url}
              target="_blank"
              rel="noreferrer"
              className="ml-3 text-sm font-bold text-amber-dark hover:underline"
            >
              View current resume
            </a>
          )}
        </div>
      </div>

      {/* Applications */}
      <h2 className="font-display font-extrabold text-2xl mb-5">My Applications</h2>
      {loading ? (
        <p className="text-slate">Loading...</p>
      ) : applications.length === 0 ? (
        <div className="border-2 border-dashed border-ink/30 p-12 text-center">
          <p className="font-display font-bold mb-1">No applications yet</p>
          <p className="text-slate text-sm mb-4">Browse the board and apply to roles that fit you.</p>
          <Link to="/jobs" className="inline-block bg-ink text-paper font-display font-bold uppercase text-sm tracking-wide px-6 py-2.5 hover:bg-amber-dark transition-colors">
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="border-2 border-ink p-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <Link to={`/jobs/${app.job_id}`} className="font-display font-bold text-lg hover:text-amber-dark">
                  {app.jobs?.title}
                </Link>
                <p className="flex items-center gap-1.5 text-sm text-slate">
                  <MapPin size={13} /> {app.jobs?.company_name} · {app.jobs?.location}
                </p>
              </div>
              <span className={`${statusColors[app.status]} text-paper text-[11px] font-display font-bold uppercase px-2.5 py-1`}>
                {app.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
