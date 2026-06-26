import { Link } from 'react-router-dom'
import { MapPin, Clock, IndianRupee } from 'lucide-react'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

const typeColors = {
  'Full-time': 'bg-leaf',
  'Part-time': 'bg-amber-dark',
  Contract: 'bg-rust',
  Internship: 'bg-ink',
  Remote: 'bg-amber-dark',
}

export default function JobStubCard({ job, isNew }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="relative block bg-paper border-2 border-ink p-5 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#14151A] transition-all duration-150 group"
    >
      {isNew && (
        <div className="absolute -top-3 -right-3 w-14 h-14 bg-amber rounded-full flex items-center justify-center rotate-12 border-2 border-ink animate-stamp">
          <span className="font-display font-extrabold text-[10px] uppercase leading-tight text-ink text-center">
            New
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <span
          className={`${typeColors[job.job_type] || 'bg-slate'} text-paper text-[11px] font-display font-bold uppercase tracking-wide px-2 py-1`}
        >
          {job.job_type}
        </span>
        <span className="text-xs text-slate font-medium">{timeAgo(job.created_at)}</span>
      </div>

      <h3 className="font-display font-extrabold text-xl leading-tight mb-1 group-hover:text-amber-dark transition-colors">
        {job.title}
      </h3>
      <p className="text-slate font-semibold text-sm mb-4">{job.company_name}</p>

      <div className="flex flex-wrap gap-4 text-sm text-ink/80 border-t border-dashed border-ink/30 pt-3">
        <span className="flex items-center gap-1.5">
          <MapPin size={14} className="text-amber-dark" />
          {job.location}
        </span>
        {(job.salary_min || job.salary_max) && (
          <span className="flex items-center gap-1.5">
            <IndianRupee size={14} className="text-amber-dark" />
            {job.salary_min && job.salary_max
              ? `${(job.salary_min / 1000).toFixed(0)}k–${(job.salary_max / 1000).toFixed(0)}k`
              : `${((job.salary_min || job.salary_max) / 1000).toFixed(0)}k`}
          </span>
        )}
      </div>
    </Link>
  )
}
