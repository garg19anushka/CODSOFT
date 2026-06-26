import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PencilLine, ListChecks, ArrowRight, Sparkles } from 'lucide-react'
import { ref, get } from 'firebase/database'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ quizzes: 0, attempts: 0 })

  useEffect(() => {
    async function load() {
      try {
        const quizzesSnap = await get(ref(db, 'quizzes'))
        const attemptsSnap = await get(ref(db, 'attempts'))
        setStats({
          quizzes: quizzesSnap.exists() ? Object.keys(quizzesSnap.val()).length : 0,
          attempts: attemptsSnap.exists() ? Object.keys(attemptsSnap.val()).length : 0,
        })
      } catch (err) {
        console.error('Could not load stats', err)
      }
    }
    load()
  }, [])

  return (
    <div>
      <section className="relative border-b-4 border-board bg-board chalk-texture overflow-hidden">
        <div className="max-w-4xl mx-auto px-5 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-pencil/15 border border-pencil/40 text-pencil font-display font-semibold text-xs uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
            <Sparkles size={12} /> Make a quiz in minutes
          </div>
          <h1 className="font-display font-bold text-5xl md:text-6xl leading-[1.05] text-chalk mb-5">
            Test what you know.
            <br />
            <span className="text-pencil">Share what you make.</span>
          </h1>
          <p className="text-lg text-sageLight max-w-xl mx-auto mb-10 leading-relaxed">
            Markwise lets you build multiple-choice quizzes and get instant, scored feedback — no sign-up required to play.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={user ? '/create' : '/signup'} className="flex items-center gap-2 bg-pencil text-board font-display font-bold px-7 py-3.5 rounded-full hover:bg-pencil/90 transition-colors w-full sm:w-auto justify-center">
              <PencilLine size={18} /> Create a Quiz
            </Link>
            <Link to="/quizzes" className="flex items-center gap-2 bg-transparent border-2 border-chalk/30 text-chalk font-display font-bold px-7 py-3.5 rounded-full hover:bg-chalk/10 transition-colors w-full sm:w-auto justify-center">
              <ListChecks size={18} /> Take a Quiz
            </Link>
          </div>
          <div className="flex justify-center gap-12 mt-12">
            <div>
              <p className="font-display font-bold text-3xl text-chalk">{stats.quizzes}+</p>
              <p className="text-xs uppercase tracking-wide text-sageLight font-semibold">Quizzes made</p>
            </div>
            <div>
              <p className="font-display font-bold text-3xl text-chalk">{stats.attempts}+</p>
              <p className="text-xs uppercase tracking-wide text-sageLight font-semibold">Quizzes taken</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-5 py-16">
        <h2 className="font-display font-bold text-2xl text-board text-center mb-10">Two ways to play</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-board/15 rounded-3xl p-7">
            <div className="w-11 h-11 rounded-full bg-board flex items-center justify-center mb-4">
              <PencilLine size={18} className="text-pencil" />
            </div>
            <h3 className="font-display font-bold text-lg text-board mb-2">Build a quiz</h3>
            <p className="text-sm text-sage leading-relaxed mb-4">Write your questions, give each one multiple-choice options, and mark the correct answer. Publish it and anyone can take it.</p>
            <Link to={user ? '/create' : '/signup'} className="inline-flex items-center gap-1.5 font-display font-bold text-sm text-coral hover:underline">
              Start creating <ArrowRight size={14} />
            </Link>
          </div>
          <div className="border-2 border-board/15 rounded-3xl p-7">
            <div className="w-11 h-11 rounded-full bg-board flex items-center justify-center mb-4">
              <ListChecks size={18} className="text-pencil" />
            </div>
            <h3 className="font-display font-bold text-lg text-board mb-2">Take a quiz</h3>
            <p className="text-sm text-sage leading-relaxed mb-4">Browse what others have made, answer one question at a time, and get your score with a full answer review at the end.</p>
            <Link to="/quizzes" className="inline-flex items-center gap-1.5 font-display font-bold text-sm text-coral hover:underline">
              Browse quizzes <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}