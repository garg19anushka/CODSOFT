import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, ListChecks, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { ref, get, remove } from 'firebase/database'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'

export default function MyQuizzes() {
  const { user } = useAuth()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    setLoading(true)
    try {
      const snap = await get(ref(db, 'quizzes'))
      if (snap.exists()) {
        const all = Object.entries(snap.val()).map(([id, data]) => ({ id, ...data }))
        const mine = all
          .filter((q) => q.creatorId === user.uid)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setQuizzes(mine)
      } else {
        setQuizzes([])
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  async function deleteQuiz(quiz) {
    if (!confirm(`Delete "${quiz.title}"? This cannot be undone.`)) return
    try {
      await remove(ref(db, `quizzes/${quiz.id}`))
      toast.success('Quiz deleted')
      load()
    } catch (err) { toast.error('Could not delete quiz') }
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-board">My Quizzes</h1>
          <p className="text-sage text-sm mt-1">Quizzes you've created</p>
        </div>
        <Link to="/create" className="flex items-center gap-2 bg-coral text-chalk font-display font-bold px-5 py-2.5 rounded-full hover:bg-coral-dark transition-colors">
          <Plus size={16} /> New Quiz
        </Link>
      </div>

      {loading ? <p className="text-sage">Loading...</p>
        : quizzes.length === 0 ? (
          <div className="border-2 border-dashed border-board/25 rounded-3xl p-16 text-center">
            <p className="font-display font-bold text-board mb-1">No quizzes yet</p>
            <p className="text-sage text-sm mb-5">Create your first quiz to share with others.</p>
            <Link to="/create" className="inline-block bg-board text-chalk font-display font-bold px-6 py-2.5 rounded-full hover:bg-boardDark transition-colors">Create a Quiz</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="border-2 border-board/15 rounded-3xl p-5 flex items-center justify-between gap-4 flex-wrap bg-white">
                <div className="flex-1 min-w-[180px]">
                  <h3 className="font-display font-bold text-lg text-board">{quiz.title}</h3>
                  <p className="flex items-center gap-3 text-sm text-sage mt-0.5">
                    <span className="flex items-center gap-1"><ListChecks size={13} /> {quiz.questionCount || 0} questions</span>
                    <span className="flex items-center gap-1"><Eye size={13} /> {quiz.attemptCount || 0} attempts</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link to={`/quiz/${quiz.id}`} className="font-display font-bold text-sm text-coral hover:underline">View</Link>
                  <button onClick={() => deleteQuiz(quiz)} className="text-sage hover:text-coral transition-colors p-1.5"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}