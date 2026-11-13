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
 *
 * 注意：勿用 setIndex(i => i + 1)。Strict Mode 會把 updater 跑兩次，
 * 題號會一次跳兩格。
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
  const indexRef = useRef(index)
  const handledRef = useRef(false)

  indexRef.current = index

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    setNeedContinue(false)
    pendingScore.current = null
    handledRef.current = false
    clearTimer()
  }, [index])

  useEffect(() => () => clearTimer(), [])

  const advance = (score: number) => {
    if (handledRef.current) return
    handledRef.current = true
    setNeedContinue(false)
    pendingScore.current = null
    clearTimer()
    const next = indexRef.current + 1
    if (next >= total) onFinish(score)
    else setIndex(next)
  }

  const afterCorrect = (score: number) => {
    if (handledRef.current) return
    clearTimer()
    setNeedContinue(false)
    timerRef.current = window.setTimeout(() => advance(score), correctDelayMs)
  }

  const afterWrong = (score: number) => {
    if (handledRef.current) return
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
