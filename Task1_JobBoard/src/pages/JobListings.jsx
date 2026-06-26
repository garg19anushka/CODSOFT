import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import JobStubCard from '../components/JobStubCard'

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote']

export default function JobListings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [activeTypes, setActiveTypes] = useState([])
  const [location, setLocation] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      let q = supabase.from('jobs').select('*').eq('status', 'open')

      if (query.trim()) {
        q = q.or(`title.ilike.%${query}%,company_name.ilike.%${query}%`)
      }
      if (location.trim()) {
        q = q.ilike('location', `%${location}%`)
      }
      if (activeTypes.length > 0) {
        q = q.in('job_type', activeTypes)
      }

      const { data, error } = await q.order('created_at', { ascending: false })
      if (!error) setJobs(data || [])
      setLoading(false)
    }
    load()
  }, [query, activeTypes, location])

  function toggleType(type) {
    setActiveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="font-display font-black text-4xl mb-2">The Board</h1>
      <p className="text-slate mb-8">{jobs.length} open roles right now</p>

      {/* Search bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex items-center border-2 border-ink bg-paper flex-1">
          <Search size={18} className="text-slate ml-4" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSearchParams(e.target.value ? { q: e.target.value } : {})
            }}
            placeholder="Search by title or company..."
            className="w-full px-3 py-3 outline-none bg-transparent font-medium"
          />
          {query && (
            <button onClick={() => { setQuery(''); setSearchParams({}) }} className="pr-4 text-slate">
              <X size={16} />
            </button>
          )}
        </div>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="border-2 border-ink bg-paper px-4 py-3 outline-none font-medium md:w-56"
        />
      </div>

      {/* Type filters */}
      <div className="flex items-center gap-2 mb-10 flex-wrap">
        <SlidersHorizontal size={16} className="text-slate mr-1" />
        {JOB_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className={`font-display font-bold text-xs uppercase tracking-wide px-3 py-1.5 border-2 border-ink transition-colors ${
              activeTypes.includes(type)
                ? 'bg-ink text-paper'
                : 'bg-paper text-ink hover:bg-amber-light'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border-2 border-ink/10 h-44 animate-pulse bg-ink/5" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="border-2 border-dashed border-ink/30 p-16 text-center">
          <p className="font-display font-bold text-lg mb-1">No roles match that search</p>
          <p className="text-slate text-sm">Try a different keyword or clear your filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <JobStubCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}
