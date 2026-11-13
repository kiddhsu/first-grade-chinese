type Props = {
  stars: number
  message: string
  onBack: () => void
  /** 有下一關時顯示主按鈕；沒有則只留回選單 */
  onNext?: () => void
}

export function GameResult({ stars, message, onBack, onNext }: Props) {
  return (
    <div className="panel game-stage result-panel">
      <div className="stars result-stars">
        {'★'.repeat(stars)}
        {'☆'.repeat(Math.max(0, 3 - stars))}
      </div>
      <p className="prompt">{message}</p>
      <div className="actions">
        {onNext ? (
          <>
            <button type="button" className="btn btn-ghost" onClick={onBack}>
              回選單
            </button>
            <button type="button" className="btn btn-primary" onClick={onNext}>
              下一關
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onBack}>
            回選單
          </button>
        )}
      </div>
    </div>
  )
}
