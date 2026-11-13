import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  choices: string[]
  /** 用來在換題時清掉動畫狀態 */
  roundKey: string | number
  locked?: boolean
  /** 每題只能選一次；選完鎖定並標出正解（預設開啟） */
  oneShot?: boolean
  onPick: (choice: string, ok: boolean) => void
  isCorrect: (choice: string) => boolean
}

type Flash = {
  picked: string
  kind: 'correct' | 'wrong'
  bump: number
}

function isEmojiChar(ch: string) {
  return /\p{Extended_Pictographic}/u.test(ch) || ch === '⭐' || ch === '★'
}

/** 連續圖示（如 ⭐⭐⭐⭐⭐）改成每列最多 4 個，避免撐破按鈕 */
function renderChoiceLabel(label: string): ReactNode {
  const chars = [...label]
  if (chars.length >= 4 && chars.every(isEmojiChar)) {
    return (
      <span className="choice__emoji-grid" aria-label={`${chars.length} 個`}>
        {chars.map((ch, i) => (
          <span key={`${ch}-${i}`} className="choice__emoji-cell">
            {ch}
          </span>
        ))}
      </span>
    )
  }
  return <span className="choice__label">{label}</span>
}

export function ChoiceGrid({
  choices,
  roundKey,
  locked = false,
  oneShot = true,
  onPick,
  isCorrect,
}: Props) {
  const [flash, setFlash] = useState<Flash | null>(null)
  const [busy, setBusy] = useState(false)
  const timerRef = useRef<number | null>(null)
  const correctChoice = choices.find((c) => isCorrect(c))

  useEffect(() => {
    setFlash(null)
    setBusy(false)
    if (timerRef.current) window.clearTimeout(timerRef.current)
  }, [roundKey])

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    },
    [],
  )

  return (
    <div className="choice-grid">
      {choices.map((c) => {
        const isPicked = flash?.picked === c
        const showAsCorrect =
          (isPicked && flash.kind === 'correct') ||
          (flash !== null && flash.kind === 'wrong' && c === correctChoice)
        const showAsWrong = isPicked && flash.kind === 'wrong'
        const cls = [
          'choice',
          showAsCorrect ? 'choice--correct' : '',
          showAsWrong ? 'choice--wrong' : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <button
            key={`${roundKey}-${c}`}
            type="button"
            className={cls}
            disabled={locked || busy}
            onClick={() => {
              if (locked || busy) return
              const ok = isCorrect(c)
              const next: Flash = {
                picked: c,
                kind: ok ? 'correct' : 'wrong',
                bump: Date.now(),
              }
              setFlash(next)
              setBusy(true)
              onPick(c, ok)
              if (!oneShot && !ok) {
                if (timerRef.current) window.clearTimeout(timerRef.current)
                timerRef.current = window.setTimeout(() => {
                  setFlash(null)
                  setBusy(false)
                }, 650)
              }
            }}
          >
            {renderChoiceLabel(c)}
            {showAsCorrect && (
              <span className="choice__burst" key={flash?.bump} aria-hidden>
                ★
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
