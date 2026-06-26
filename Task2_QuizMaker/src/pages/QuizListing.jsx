import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ListChecks, Search, FileQuestion } from 'lucide-react'
import { ref, get } from 'firebase/database'
import { db } from '../lib/firebase'

function timeAgo(isoStr) {
  if (!isoStr) return ''
  const diff = Date.now() - new Date(isoStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

export default function QuizListing() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const snap = await get(ref(db, 'quizzes'))
      if (snap.exists()) {
        const data = Object.entries(snap.val())
          .map(([id, val]) => ({ id, ...val }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setQuizzes(data)
      } else {
        setQuizzes([])
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const filtered = quizzes.filter((q) => q.title?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="font-display font-bold text-3xl text-board mb-1">Browse Quizzes</h1>
      <p className="text-sage mb-8">{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} available</p>
      <div className="flex items-center border-2 border-board/20 rounded-full bg-white mb-8 max-w-md">
        <Search size={17} className="text-sage ml-4" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search quizzes..." className="w-full px-3 py-3 outline-none bg-transparent font-medium rounded-full" />
      </div>
      {loading ? (
        <div className="grid md:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => <div key={i} className="border-2 border-board/10 rounded-3xl h-32 animate-pulse bg-board/5" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border-2 border-dashed border-board/25 rounded-3xl p-16 text-center">
          <FileQuestion size={28} className="mx-auto mb-3 text-sage" />
          <p className="font-display font-bold text-board mb-1">No quizzes found</p>
          <p className="text-sage text-sm">Try a different search, or be the first to create one.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((quiz) => (
            <Link key={quiz.id} to={`/quiz/${quiz.id}`} className="border-2 border-board/15 rounded-3xl p-6 hover:border-board hover:-translate-y-0.5 transition-all duration-150 bg-white">
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 text-xs font-display font-bold text-coral uppercase tracking-wide">
                  <ListChecks size={13} /> {quiz.questionCount || 0} question{quiz.questionCount !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-sage font-medium">{timeAgo(quiz.createdAt)}</span>
              </div>
              <h3 className="font-display font-bold text-xl text-board leading-tight mb-1.5">{quiz.title}</h3>
              {quiz.description && <p className="text-sm text-sage leading-relaxed line-clamp-2 mb-2">{quiz.description}</p>}
              <p className="text-xs text-sage/80 font-medium">by {quiz.creatorName || 'a Markwise user'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}