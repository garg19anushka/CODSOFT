const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export default function OptionBubble({
  letter,
  text,
  selected,
  onClick,
  revealed,
  isCorrect,
  disabled,
}) {
  const idx = typeof letter === 'number' ? letter : 0
  const label = LETTERS[idx] || '?'

  let bubbleClasses = 'border-board/30 text-board bg-transparent'
  let rowClasses = 'border-board/15 hover:border-board/40 hover:bg-board/[0.03]'

  if (revealed) {
    if (isCorrect) {
      bubbleClasses = 'bg-board border-board text-chalk'
      rowClasses = 'border-board bg-board/5'
    } else if (selected) {
      bubbleClasses = 'bg-coral border-coral text-chalk'
      rowClasses = 'border-coral bg-coral/5'
    } else {
      rowClasses = 'border-board/10 opacity-60'
    }
  } else if (selected) {
    bubbleClasses = 'bg-pencil border-pencil text-board'
    rowClasses = 'border-pencil bg-pencil/10'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-4 border-2 rounded-2xl px-5 py-4 text-left transition-all duration-150 ${rowClasses} ${
        disabled && !revealed ? 'cursor-default' : ''
      }`}
    >
      <span
        className={`flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center font-display font-bold text-sm transition-colors ${bubbleClasses}`}
      >
        {label}
      </span>
      <span className="font-medium text-board flex-1">{text}</span>
      {revealed && isCorrect && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="draw-check flex-shrink-0">
          <path d="M4 12.5L9 17.5L20 6.5" stroke="#1F3D2E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {revealed && selected && !isCorrect && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="draw-check flex-shrink-0">
          <path d="M5 5L19 19M19 5L5 19" stroke="#E85D4C" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
    </button>
  )
}
