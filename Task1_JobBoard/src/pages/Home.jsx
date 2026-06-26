import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowRight, Building2, Users, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import JobStubCard from '../components/JobStubCard'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [stats, setStats] = useState({ jobs: 0, companies: 0 })
  const [query, setQuery] = useState('')

  useEffect(() => {
    async function load() {
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(6)
      setFeatured(jobs || [])

      const { count: jobCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')

      const { data: companies } = await supabase
        .from('jobs')
        .select('company_name')

      const uniqueCompanies = new Set((companies || []).map((c) => c.company_name))
      setStats({ jobs: jobCount || 0, companies: uniqueCompanies.size })
    }
    load()
  }, [])

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b-2 border-ink bg-dot-grid">
        <div className="max-w-6xl mx-auto px-5 pt-20 pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-ink text-paper font-display font-bold text-xs uppercase tracking-widest px-3 py-1.5 mb-6 -rotate-1">
              <span className="w-1.5 h-1.5 bg-amber rounded-full" /> Now Posting
            </div>
            <h1 className="font-display font-black text-5xl md:text-7xl leading-[0.95] tracking-tight mb-6">
              Find work that
              <br />
              actually <span className="text-amber-dark">fits.</span>
            </h1>
            <p className="text-lg text-slate max-w-xl mb-10 leading-relaxed">
              BoardRoom connects employers and job seekers without the noise.
              Post a role, find a role, get hired — no middlemen, no clutter.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                window.location.href = `/jobs?q=${encodeURIComponent(query)}`
              }}
              className="flex items-stretch border-2 border-ink bg-paper max-w-xl"
            >
              <div className="flex items-center pl-4 text-slate">
                <Search size={18} />
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Job title, skill, or company..."
                className="flex-1 px-3 py-4 outline-none bg-transparent font-medium text-base"
              />
              <button
                type="submit"
                className="bg-ink text-paper font-display font-bold uppercase text-sm tracking-wide px-6 hover:bg-amber-dark transition-colors flex items-center gap-2"
              >
                Search <ArrowRight size={16} />
              </button>
            </form>

            <div className="flex gap-10 mt-10">
              <div>
                <p className="font-display font-black text-3xl">{stats.jobs}+</p>
                <p className="text-xs uppercase tracking-wide text-slate font-bold">Open Roles</p>
              </div>
              <div>
                <p className="font-display font-black text-3xl">{stats.companies}+</p>
                <p className="text-xs uppercase tracking-wide text-slate font-bold">Companies</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative rotated stub in corner */}
        <div className="hidden lg:block absolute top-24 right-10 w-56 bg-paper border-2 border-ink p-4 rotate-6 shadow-[6px_6px_0_0_#14151A]">
          <span className="bg-leaf text-paper text-[10px] font-display font-bold uppercase px-2 py-0.5">
            Full-time
          </span>
          <p className="font-display font-extrabold mt-2">Product Designer</p>
          <p className="text-xs text-slate">Notion · Remote</p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-5 py-16 border-b-2 border-ink">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Building2,
              title: 'Employers post',
              desc: 'List your open role with salary, location, and requirements in minutes.',
            },
            {
              icon: Search,
              title: 'Candidates search',
              desc: 'Filter by role, type, and location to find the right fit fast.',
            },
            {
              icon: Send,
              title: 'Apply & get noticed',
              desc: 'Upload a resume, apply directly, and track your status in real time.',
            },
          ].map((s, i) => (
            <div key={i} className="relative">
              <span className="font-display font-black text-5xl text-amber-light absolute -top-4 -left-1 -z-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="relative pt-8">
                <s.icon size={22} className="mb-3 text-ink" />
                <h3 className="font-display font-bold text-lg mb-1">{s.title}</h3>
                <p className="text-sm text-slate leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-extrabold text-3xl">Fresh on the board</h2>
          <Link
            to="/jobs"
            className="font-display font-bold text-sm uppercase tracking-wide flex items-center gap-1.5 hover:text-amber-dark"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="border-2 border-dashed border-ink/30 p-12 text-center">
            <Users size={28} className="mx-auto mb-3 text-slate" />
            <p className="text-slate font-medium">
              No listings yet. Be the first employer to post a role.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((job, i) => (
              <JobStubCard key={job.id} job={job} isNew={i === 0} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
