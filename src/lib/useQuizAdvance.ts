import { useEffect, useRef, useState } from 'react'

type Options = {
  index: number
  total: number
  setIndex: (updater: number | ((i: number) => number)) => void
  onFinish: (score: number) => void
  /** 答對後自動下一題的等待（毫秒） */
  correctDelayMs?: number
}

/**
 * 答對：短暫慶祝後自動下一題
 * 答錯：停住等孩子按「下一題」，才繼續（方便看正解）
 */
export function useQuizAdvance({
  index,
  total,
  setIndex,
  onFinish,
  correctDelayMs = 900,
}: Options) {
  const [needContinue, setNeedContinue] = useState(false)
  const pendingScore = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    setNeedContinue(false)
    pendingScore.current = null
    clearTimer()
  }, [index])

  useEffect(() => () => clearTimer(), [])

  const advance = (score: number) => {
    setNeedContinue(false)
    pendingScore.current = null
    clearTimer()
    if (index + 1 >= total) onFinish(score)
    else setIndex((i) => i + 1)
  }

  const afterCorrect = (score: number) => {
    clearTimer()
    setNeedContinue(false)
    timerRef.current = window.setTimeout(() => advance(score), correctDelayMs)
  }

  const afterWrong = (score: number) => {
    clearTimer()
    pendingScore.current = score
    setNeedContinue(true)
  }

  const continueNow = () => {
    if (pendingScore.current === null) return
    advance(pendingScore.current)
  }

  const isLast = index + 1 >= total

  return { needContinue, afterCorrect, afterWrong, continueNow, isLast }
}
