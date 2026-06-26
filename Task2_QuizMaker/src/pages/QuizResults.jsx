import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Award, RotateCcw, ListChecks } from 'lucide-react'
import { ref, get } from 'firebase/database'
import { db } from '../lib/firebase'
import OptionBubble from '../components/OptionBubble'

export default function QuizResults() {
  const { attemptId } = useParams()
  const [attempt, setAttempt] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [reviewQuestions, setReviewQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [attemptId])

  async function load() {
    setLoading(true)
    try {
      const attemptSnap = await get(ref(db, `attempts/${attemptId}`))
      if (!attemptSnap.exists()) { setLoading(false); return }
      const attemptData = { id: attemptId, ...attemptSnap.val() }
      setAttempt(attemptData)

      const quizSnap = await get(ref(db, `quizzes/${attemptData.quizId}`))
      if (quizSnap.exists()) {
        const { questions: questionsData, ...meta } = quizSnap.val()
        setQuiz({ id: attemptData.quizId, ...meta })

        const questions = Object.entries(questionsData || {})
          .map(([qId, qData]) => ({ id: qId, ...qData }))
          .sort((a, b) => a.position - b.position)

        const merged = questions.map((question) => {
          const answer = attemptData.answers.find((a) => a.questionId === question.id)
          return { ...question, selectedOptionId: answer?.selectedOptionId, isCorrect: answer?.isCorrect }
        })
        setReviewQuestions(merged)
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  if (loading) return <div className="text-center py-20 text-sage font-medium">Loading results...</div>
  if (!attempt) return (
    <div className="max-w-xl mx-auto px-5 py-20 text-center">
      <p className="font-display font-bold text-board text-xl mb-2">Results not found</p>
      <Link to="/quizzes" className="text-coral font-bold underline">Back to quizzes</Link>
    </div>
  )

  const pct = Math.round((attempt.score / attempt.totalQuestions) * 100)
  const scoreColor = pct >= 70 ? 'text-board' : pct >= 40 ? 'text-pencil' : 'text-coral'

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <div className="border-2 border-board/15 rounded-3xl p-10 text-center bg-white mb-8 animate-pop">
        <Award size={36} className={`mx-auto mb-3 ${scoreColor}`} />
        <p className="text-sage font-medium text-sm mb-1">{quiz?.title}</p>
        <p className={`font-display font-bold text-5xl mb-2 ${scoreColor}`}>{pct}%</p>
        <p className="text-board font-display font-semibold">{attempt.score} out of {attempt.totalQuestions} correct</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link to={`/quiz/${attempt.quizId}`} className="flex items-center justify-center gap-1.5 border-2 border-board text-board font-display font-bold px-6 py-2.5 rounded-full hover:bg-board hover:text-chalk transition-colors">
            <RotateCcw size={15} /> Retake Quiz
          </Link>
          <Link to="/quizzes" className="flex items-center justify-center gap-1.5 bg-coral text-chalk font-display font-bold px-6 py-2.5 rounded-full hover:bg-coral-dark transition-colors">
            <ListChecks size={15} /> More Quizzes
          </Link>
        </div>
      </div>
      <h2 className="font-display font-bold text-xl text-board mb-4">Answer review</h2>
      <div className="space-y-5">
        {reviewQuestions.map((q, i) => (
          <div key={q.id} className="border-2 border-board/15 rounded-3xl p-6 bg-white">
            <p className="font-display font-bold text-board mb-4 leading-snug">{i + 1}. {q.questionText}</p>
            <div className="space-y-2.5">
              {q.options.map((opt, oIdx) => (
                <OptionBubble key={opt.id} letter={oIdx} text={opt.text} selected={q.selectedOptionId === opt.id} isCorrect={opt.isCorrect} revealed disabled />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}