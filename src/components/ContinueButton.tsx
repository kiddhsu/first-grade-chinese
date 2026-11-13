type Props = {
  show: boolean
  isLast: boolean
  onContinue: () => void
}

export function ContinueButton({ show, isLast, onContinue }: Props) {
  if (!show) return null
  return (
    <div className="actions continue-actions">
      <p className="muted continue-hint">先看清楚綠框的正解，再往下走</p>
      <button type="button" className="btn btn-primary" onClick={onContinue}>
        {isLast ? '看懂了，看成績' : '看懂了，下一題'}
      </button>
    </div>
  )
}
