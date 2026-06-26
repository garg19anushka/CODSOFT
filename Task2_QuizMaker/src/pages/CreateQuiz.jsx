import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { ref, push, set } from 'firebase/database'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'

function emptyQuestion() {
  return { questionText: '', options: ['', '', '', ''], correctIndex: 0 }
}

export default function CreateQuiz() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [submitting, setSubmitting] = useState(false)

  function updateQuestion(qIdx, field, value) {
    setQuestions((prev) => prev.map((q, i) => (i === qIdx ? { ...q, [field]: value } : q)))
  }

  function updateOption(qIdx, oIdx, value) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.map((o, j) => (j === oIdx ? value : o)) } : q
      )
    )
  }

  function addOption(qIdx) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx && q.options.length < 6 ? { ...q, options: [...q.options, ''] } : q))
    )
  }

  function removeOption(qIdx, oIdx) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx || q.options.length <= 2) return q
        const newOptions = q.options.filter((_, j) => j !== oIdx)
        let newCorrect = q.correctIndex
        if (oIdx === q.correctIndex) newCorrect = 0
        else if (oIdx < q.correctIndex) newCorrect = q.correctIndex - 1
        return { ...q, options: newOptions, correctIndex: newCorrect }
      })
    )
  }

  function addQuestion() { setQuestions((prev) => [...prev, emptyQuestion()]) }
  function removeQuestion(qIdx) {
    if (questions.length <= 1) return
    setQuestions((prev) => prev.filter((_, i) => i !== qIdx))
  }

  function validate() {
    if (!title.trim()) return 'Give your quiz a title.'
    for (const [i, q] of questions.entries()) {
      if (!q.questionText.trim()) return `Question ${i + 1} needs text.`
      if (q.options.filter((o) => o.trim()).length < 2) return `Question ${i + 1} needs at least 2 options.`
      if (!q.options[q.correctIndex]?.trim()) return `Question ${i + 1}: mark a correct answer that has text.`
    }
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const error = validate()
    if (error) { toast.error(error); return }
    setSubmitting(true)
    try {
      const questionsPayload = questions.map((q, qIdx) => ({
        questionText: q.questionText,
        position: qIdx,
        options: q.options
          .map((text, oIdx) => ({ text, oIdx }))
          .filter((o) => o.text.trim())
          .map((o) => ({ id: `opt_${qIdx}_${o.oIdx}`, text: o.text, isCorrect: o.oIdx === q.correctIndex })),
      }))

      const newQuizRef = push(ref(db, 'quizzes'))
      const quizId = newQuizRef.key

      await set(newQuizRef, {
        title, description,
        creatorId: user.uid,
        creatorName: profile?.fullName || 'a Markwise user',
        createdAt: new Date().toISOString(),
        questionCount: questionsPayload.length,
        attemptCount: 0,
      })

      for (const [idx, q] of questionsPayload.entries()) {
        await set(ref(db, `quizzes/${quizId}/questions/q_${idx}`), q)
      }

      toast.success('Quiz published!')
      navigate(`/quiz/${quizId}`)
    } catch (err) {
      toast.error(err.message || 'Could not create quiz')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <h1 className="font-display font-bold text-3xl text-board mb-1">Create a quiz</h1>
      <p className="text-sage text-sm mb-8">Add questions, give each one multiple-choice options, and mark the right answer.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-2 border-board/15 rounded-3xl p-6 bg-white">
          <label className="block font-display font-bold text-sm text-board mb-1.5">Quiz title</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. World Capitals Challenge" className="w-full border-2 border-board/20 rounded-xl p-3 outline-none font-medium focus:border-coral mb-4" />
          <label className="block font-display font-bold text-sm text-board mb-1.5">Description (optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What's this quiz about?" className="w-full border-2 border-board/20 rounded-xl p-3 outline-none font-medium resize-none focus:border-coral" />
        </div>

        {questions.map((q, qIdx) => (
          <div key={qIdx} className="border-2 border-board/15 rounded-3xl p-6 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-bold text-coral text-sm uppercase tracking-wide">Question {qIdx + 1}</span>
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(qIdx)} className="text-sage hover:text-coral transition-colors"><Trash2 size={16} /></button>
              )}
            </div>
            <input required value={q.questionText} onChange={(e) => updateQuestion(qIdx, 'questionText', e.target.value)} placeholder="Type your question..." className="w-full border-2 border-board/20 rounded-xl p-3 outline-none font-medium focus:border-coral mb-4" />
            <div className="space-y-2.5">
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <button type="button" onClick={() => updateQuestion(qIdx, 'correctIndex', oIdx)} className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-display font-bold text-xs transition-colors ${q.correctIndex === oIdx ? 'bg-board border-board text-pencil' : 'border-board/30 text-board/60 hover:border-board'}`}>
                    {String.fromCharCode(65 + oIdx)}
                  </button>
                  <input value={opt} onChange={(e) => updateOption(qIdx, oIdx, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oIdx)}`} className="flex-1 border-2 border-board/20 rounded-xl p-2.5 outline-none font-medium text-sm focus:border-coral" />
                  {q.options.length > 2 && (
                    <button type="button" onClick={() => removeOption(qIdx, oIdx)} className="flex-shrink-0 text-sage hover:text-coral transition-colors"><Trash2 size={14} /></button>
                  )}
                </div>
              ))}
            </div>
            {q.options.length < 6 && (
              <button type="button" onClick={() => addOption(qIdx)} className="mt-3 flex items-center gap-1.5 text-sm font-display font-bold text-coral hover:underline">
                <Plus size={14} /> Add option
              </button>
            )}
            <p className="text-xs text-sage mt-3">Tap a letter bubble to mark that option as the correct answer.</p>
          </div>
        ))}

        <button type="button" onClick={addQuestion} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-board/30 rounded-3xl p-4 font-display font-bold text-board hover:border-board hover:bg-board/[0.03] transition-colors">
          <Plus size={18} /> Add another question
        </button>
        <button type="submit" disabled={submitting} className="w-full bg-coral text-chalk font-display font-bold py-4 rounded-full hover:bg-coral-dark transition-colors disabled:opacity-60">
          {submitting ? 'Publishing...' : 'Publish Quiz'}
        </button>
      </form>
    </div>
  )
}