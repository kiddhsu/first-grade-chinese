import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChoiceGrid } from '../components/ChoiceGrid'
import { ContinueButton } from '../components/ContinueButton'
import { mathUnits } from '../content/math-hanlin-g1/units'
import { MATH_MODE_ORDER, type MathModeId } from '../lib/mathModes'
import { buildMathRound, type MathQuestion } from '../lib/mathQuestions'
import {
  clearMathWrong,
  getMathUnitProgress,
  markMathWrong,
} from '../lib/mathProgress'
import { loadProgress, touchSession } from '../lib/progress'
import { pickN } from '../lib/speech'
import { useQuizAdvance } from '../lib/useQuizAdvance'
import type { MathWrongItem } from '../types'

function MathVisual({
  visual,
}: {
  visual: NonNullable<MathQuestion['visual']>
}) {
  if (visual.type === 'dots') {
    return (
      <div className="math-dots" aria-hidden>
        {Array.from({ length: visual.count }, (_, i) => (
          <span key={i}>{visual.emoji}</span>
        ))}
      </div>
    )
  }
  if (visual.type === 'bars') {
    return (
      <div className="math-bars" aria-hidden>
        <div className="math-bar-col">
          <span className="muted">左邊</span>
          <div className="math-bar" style={{ width: `${visual.a * 10}%` }} />
        </div>
        <div className="math-bar-col">
          <span className="muted">右邊</span>
          <div className="math-bar math-bar--b" style={{ width: `${visual.b * 10}%` }} />
        </div>
      </div>
    )
  }
  if (visual.type === 'shape') {
    return <div className={`math-shape math-shape--${visual.name}`} aria-hidden />
  }
  if (visual.type === 'clock') {
    const minuteDeg = visual.half ? 180 : 0
    const hourDeg = (visual.hour % 12) * 30 + (visual.half ? 15 : 0)
    return (
      <div className="math-clock" aria-hidden>
        <div className="math-clock__face">
          <span
            className="math-clock__hand math-clock__hand--hour"
            style={{ transform: `rotate(${hourDeg}deg)` }}
          />
          <span
            className="math-clock__hand math-clock__hand--minute"
            style={{ transform: `rotate(${minuteDeg}deg)` }}
          />
          <span className="math-clock__center" />
        </div>
      </div>
    )
  }
  if (visual.type === 'coins') {
    return (
      <div className="math-coins" aria-hidden>
        {Array.from({ length: visual.tens }, (_, i) => (
          <span key={`t${i}`} className="coin coin--10">
            10
          </span>
        ))}
        {Array.from({ length: visual.fives }, (_, i) => (
          <span key={`f${i}`} className="coin coin--5">
            5
          </span>
        ))}
        {Array.from({ length: visual.ones }, (_, i) => (
          <span key={`o${i}`} className="coin coin--1">
            1
          </span>
        ))}
      </div>
    )
  }
  return null
}

function toQuestion(item: MathWrongItem): MathQuestion {
  return {
    id: item.id,
    prompt: item.prompt,
    answer: item.answer,
    choices: item.choices,
    visual: item.visual,
  }
}

function buildReviewPool(): MathQuestion[] {
  const wrong = loadProgress().wrongMath
  if (wrong.length) {
    return pickN(wrong.map(toQuestion), Math.min(5, wrong.length))
  }

  // 沒有錯題：優先抽星星較少／還沒玩過的單元
  const weakUnits = mathUnits
    .map((u) => ({ unit: u, progress: getMathUnitProgress(u.unitId) }))
    .filter((x) => x.progress.earned < 3 || x.progress.modesDone < x.progress.modeTotal)

  const poolUnits = weakUnits.length
    ? weakUnits.map((x) => x.unit)
    : mathUnits

  const generated: MathQuestion[] = []
  for (const unit of pickN(poolUnits, 5)) {
    const mode = MATH_MODE_ORDER[Math.floor(Math.random() * MATH_MODE_ORDER.length)] as MathModeId
    const [q] = buildMathRound(unit.kind, mode, 1)
    if (q) generated.push(q)
  }
  return generated
}

export function MathReview() {
  const pool = useMemo(() => buildReviewPool(), [])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [locked, setLocked] = useState(false)
  const [done, setDone] = useState(pool.length === 0)
  const [feedback, setFeedback] = useState('')

  const current = pool[index]

  useEffect(() => {
    setLocked(false)
    setFeedback('')
  }, [index])

  const { needContinue, afterCorrect, afterWrong, continueNow, isLast } =
    useQuizAdvance({
      index,
      total: pool.length,
      setIndex,
      onFinish: () => setDone(true),
    })

  if (done || !current) {
    return (
      <div className="panel empty">
        <p className="prompt">複習收工！數字們跟你擊掌了</p>
        <Link className="btn btn-primary" to="/">
          回首頁
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="top-nav">
        <Link className="chip" to="/">
          ← 回首頁
        </Link>
      </div>
      <header className="brand">
        <h1>今天再練一輪</h1>
        <p>
          {index + 1} / {pool.length}　每題只能選一次
        </p>
      </header>
      <div className="panel game-stage">
        <p className="prompt" style={{ whiteSpace: 'pre-line' }}>
          {current.prompt}
        </p>
        {current.visual && <MathVisual visual={current.visual} />}
        <ChoiceGrid
          choices={current.choices}
          roundKey={`${index}-${current.id}`}
          locked={locked || needContinue}
          isCorrect={(c) => c === current.answer}
          onPick={(_c, ok) => {
            touchSession()
            setLocked(true)
            if (ok) {
              clearMathWrong(current.id)
              setFeedback('算對了！給你拍拍手')
              setScore((s) => s + 1)
              afterCorrect(score + 1)
            } else {
              markMathWrong({
                id: current.id,
                kind: 'review',
                mode: 'visual',
                prompt: current.prompt,
                answer: current.answer,
                choices: current.choices,
                visual: current.visual,
              })
              setFeedback(`答錯了，正解是「${current.answer}」`)
              afterWrong(score)
            }
          }}
        />
        <div
          className={`feedback ${feedback.startsWith('算對') ? 'ok' : feedback ? 'bad' : ''}`}
        >
          {feedback}
        </div>
        <ContinueButton
          show={needContinue}
          isLast={isLast}
          onContinue={() => {
            setLocked(false)
            setFeedback('')
            continueNow()
          }}
        />
      </div>
    </>
  )
}
