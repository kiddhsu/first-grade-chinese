type Props = {
  stars: number
  message: string
  onAgain: () => void
  onBack: () => void
}

export function GameResult({ stars, message, onAgain, onBack }: Props) {
  return (
    <div className="panel game-stage result-panel">
      <div className="stars result-stars">
        {'★'.repeat(stars)}
        {'☆'.repeat(Math.max(0, 3 - stars))}
      </div>
      <p className="prompt">{message}</p>
      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={onAgain}>
          再鬧一輪
        </button>
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          回選單
        </button>
      </div>
    </div>
  )
}
