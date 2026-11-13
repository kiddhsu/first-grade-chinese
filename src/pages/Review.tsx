import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChoiceGrid } from '../components/ChoiceGrid'
import { ContinueButton } from '../components/ContinueButton'
import { allWritingChars, lessons } from '../content/kangxuan-grade1-vol1'
import { clearWrong, loadProgress, markWrong } from '../lib/progress'
import { pickN, shuffle, speak } from '../lib/speech'
import { useQuizAdvance } from '../lib/useQuizAdvance'
import type { CharEntry } from '../types'

export function Review() {
  const pool = useMemo(() => {
    const wrong = loadProgress().wrongChars
    const all = allWritingChars()
    const wrongEntries = wrong
      .map((ch) => all.find((c) => c.char === ch))
      .filter(Boolean) as (CharEntry & { lessonId: number })[]
    const progress = loadProgress()
    const unstarred = all.filter((c) => {
      const lessonStars = Object.entries(progress.stars)
        .filter(([k]) => k.startsWith(`${c.lessonId}:`))
        .reduce((s, [, v]) => s + v, 0)
      return lessonStars < 3
    })
    const base = wrongEntries.length
      ? wrongEntries
      : unstarred.length
        ? unstarred
        : all
    return pickN(base, 5)
  }, [])

  const [index, setIndex] = useState(0)
  const [choices, setChoices] = useState<string[]>([])
  const [feedback, setFeedback] = useState('')
  const [done, setDone] = useState(pool.length === 0)

  const current = pool[index]

  const { needContinue, afterCorrect, afterWrong, continueNow, isLast } =
    useQuizAdvance({
      index,
      total: pool.length,
      setIndex,
      onFinish: () => setDone(true),
    })

  useEffect(() => {
    if (!current) return
    const distractors = pickN(
      lessons
        .flatMap((l) => l.writingChars)
        .map((c) => c.char)
        .filter((c) => c !== current.char),
      3,
    )
    setChoices(shuffle([current.char, ...distractors]))
    setFeedback('')
    speak(current.char)
  }, [current])

  if (done || !current) {
    return (
      <div className="panel empty">
        <p className="prompt">複習收工！字們跟你擊掌了</p>
        <Link className="btn btn-primary" to="/">
          回樂園門口
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="top-nav">
        <Link className="chip" to="/">
          ← 回門口
        </Link>
      </div>
      <header className="brand">
        <h1>今天再練一輪</h1>
        <p>
          {index + 1} / {pool.length}　每題只能選一次
        </p>
      </header>
      <div className="panel game-stage">
        <button
          type="button"
          className="btn btn-sun"
          onClick={() => speak(current.char)}
        >
          再說一次給我聽
        </button>
        <div className="zhuyin" style={{ textAlign: 'center' }}>
          {current.zhuyin}
        </div>
        <ChoiceGrid
          choices={choices}
          roundKey={`${index}-${current.char}`}
          isCorrect={(c) => c === current.char}
          onPick={(_c, ok) => {
            if (ok) {
              clearWrong(current.char)
              setFeedback('抓到了！給你拍拍手')
              afterCorrect(0)
            } else {
              markWrong(current.char)
              setFeedback(`答錯了，正解是「${current.char}」`)
              afterWrong(0)
            }
          }}
        />
        <div
          className={`feedback ${feedback.startsWith('抓到') ? 'ok' : feedback ? 'bad' : ''}`}
        >
          {feedback}
        </div>
        <ContinueButton
          show={needContinue}
          isLast={isLast}
          onContinue={continueNow}
        />
      </div>
    </>
  )
}
