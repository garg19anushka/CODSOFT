import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { ref, get, push, set, update } from 'firebase/database'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import OptionBubble from '../components/OptionBubble'

export default function TakeQuiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selections, setSelections] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    try {
      const quizSnap = await get(ref(db, `quizzes/${id}`))
      if (quizSnap.exists()) {
        const quizData = quizSnap.val()
        const { questions: questionsData, ...meta } = quizData
        setQuiz({ id, ...meta })
        if (questionsData) {
          const qs = Object.entries(questionsData)
            .map(([qId, qData]) => ({ id: qId, ...qData }))
            .sort((a, b) => a.position - b.position)
          setQuestions(qs)
        }
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  function selectOption(questionId, optionId) {
    setSelections((prev) => ({ ...prev, [questionId]: optionId }))
  }

  const current = questions[currentIdx]
  const isLast = currentIdx === questions.length - 1
  const hasSelection = current && selections[current.id]
  const answeredCount = Object.keys(selections).length

  async function handleFinish() {
    if (!user) { toast.error('Log in to save your score.'); navigate('/login'); return }
    setSubmitting(true)
    try {
      let score = 0
      const answers = questions.map((q) => {
        const selectedOptionId = selections[q.id]
        const correctOption = q.options.find((o) => o.isCorrect)
        const isCorrect = selectedOptionId === correctOption?.id
        if (isCorrect) score++
        return { questionId: q.id, selectedOptionId: selectedOptionId || null, isCorrect }
      })

      const newAttemptRef = push(ref(db, 'attempts'))
      await set(newAttemptRef, {
        quizId: id, userId: user.uid, score,
        totalQuestions: questions.length,
        createdAt: new Date().toISOString(),
        answers,
      })

      await update(ref(db, `quizzes/${id}`), {
        attemptCount: (quiz.attemptCount || 0) + 1,
      })

      navigate(`/results/${newAttemptRef.key}`)
    } catch (err) {
      toast.error(err.message || 'Could not submit quiz')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="text-center py-20 text-sage font-medium">Loading quiz...</div>
  if (!quiz || questions.length === 0) return (
    <div className="max-w-xl mx-auto px-5 py-20 text-center">
      <p className="font-display font-bold text-board text-xl mb-2">Quiz not found</p>
      <Link to="/quizzes" className="text-coral font-bold underline">Back to quizzes</Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <Link to="/quizzes" className="inline-flex items-center gap-1.5 text-sm font-bold text-sage hover:text-board mb-6">
        <ArrowLeft size={15} /> Back to quizzes
      </Link>
      <h1 className="font-display font-bold text-2xl text-board mb-1">{quiz.title}</h1>
      <p className="text-sage text-sm mb-6">Question {currentIdx + 1} of {questions.length}</p>
      <div className="h-2 bg-board/10 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-pencil rounded-full transition-all duration-300" style={{ width: `${((currentIdx + (hasSelection ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>
      <div className="border-2 border-board/15 rounded-3xl p-7 bg-white animate-pop" key={current.id}>
        <h2 className="font-display font-bold text-xl text-board mb-6 leading-snug">{current.questionText}</h2>
        <div className="space-y-3">
          {current.options.map((opt, oIdx) => (
            <OptionBubble key={opt.id} letter={oIdx} text={opt.text} selected={selections[current.id] === opt.id} onClick={() => selectOption(current.id, opt.id)} />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between mt-6">
        <button onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))} disabled={currentIdx === 0} className="font-display font-bold text-sm text-sage disabled:opacity-30 hover:text-board transition-colors flex items-center gap-1.5">
          <ArrowLeft size={15} /> Previous
        </button>
        {isLast ? (
          <button onClick={handleFinish} disabled={!hasSelection || submitting} className="bg-coral text-chalk font-display font-bold px-7 py-3 rounded-full hover:bg-coral-dark transition-colors disabled:opacity-40">
            {submitting ? 'Submitting...' : 'Finish Quiz'}
          </button>
        ) : (
          <button onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))} disabled={!hasSelection} className="flex items-center gap-1.5 bg-board text-chalk font-display font-bold px-6 py-3 rounded-full hover:bg-boardDark transition-colors disabled:opacity-40">
            Next <ArrowRight size={15} />
          </button>
        )}
      </div>
      <p className="text-center text-xs text-sage mt-4">{answeredCount} of {questions.length} answered</p>
    </div>
  )
}