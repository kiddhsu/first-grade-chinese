import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ContinueButton } from '../components/ContinueButton'
import { GameResult } from '../components/GameResult'
import { getLesson } from '../content/grade1-vol1'
import { addStars, starsFromCorrect } from '../lib/progress'
import { shuffle, speak } from '../lib/speech'
import { getNextChineseLessonPath, isChineseLessonUnlocked } from '../lib/unlock'
import { useQuizAdvance } from '../lib/useQuizAdvance'

export function SentenceGame() {
  const { lessonId = '1' } = useParams()
  const id = Number(lessonId)
  const lesson = getLesson(id)
  const navigate = useNavigate()

  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<string[]>([])
  const [bank, setBank] = useState<string[]>([])
  const [feedback, setFeedback] = useState('')
  const [done, setDone] = useState(false)
  const [locked, setLocked] = useState(false)

  const patterns = lesson?.sentencePatterns ?? []

  const { needContinue, afterCorrect, afterWrong, continueNow, isLast } =
    useQuizAdvance({
      index,
      total: patterns.length,
      setIndex,
      onFinish: (finalScore) => {
        addStars(id, 'sentence', starsFromCorrect(finalScore, patterns.length))
        setDone(true)
      },
      correctDelayMs: 1000,
    })

  useEffect(() => {
    setIndex(0)
    setScore(0)
    setDone(false)
    setFeedback('')
    setLocked(false)
  }, [lesson])

  const pattern = patterns[index]

  useEffect(() => {
    if (!pattern) return
    setPicked([])
    setBank(shuffle(pattern.tokens))
    setFeedback('')
    setLocked(false)
    speak(pattern.prompt)
  }, [pattern])

  if (!lesson) {
    return (
      <div className="panel empty">
        <Link to="/">回首頁</Link>
      </div>
    )
  }

  if (!isChineseLessonUnlocked(id)) {
    return <Navigate to="/" replace />
  }

  if (done) {
    const stars = starsFromCorrect(score, patterns.length)
    const nextPath = getNextChineseLessonPath(id)
    return (
      <GameResult
        stars={stars}
        message={`一次拼對 ${score} / ${patterns.length} 句`}
        onBack={() => navigate(`/lesson/${id}`)}
        onNext={nextPath ? () => navigate(nextPath) : undefined}
      />
    )
  }

  if (!pattern) {
    return <div className="panel empty">沒有句型題</div>
  }

  const check = (next: string[]) => {
    if (locked || next.length !== pattern.answer.length) return
    setLocked(true)
    const ok = next.every((t, i) => t === pattern.answer[i])
    if (ok) {
      const nextScore = score + 1
      setScore(nextScore)
      setFeedback('拼好了！它們和好了')
      speak(next.join(''))
      afterCorrect(nextScore)
    } else {
      setPicked([...pattern.answer])
      setBank([])
      setFeedback(`這次排錯了，正解是：${pattern.answer.join('')}`)
      speak(pattern.answer.join(''))
      afterWrong(score)
    }
  }

  return (
    <>
      <div className="top-nav">
        <Link className="chip" to={`/lesson/${id}`}>
          ← 回選單
        </Link>
      </div>
      <header className="brand">
        <h1>詞卡大亂鬥</h1>
        <p>
          {index + 1} / {patterns.length}　排完一次就定案
        </p>
      </header>
      <div className="panel game-stage">
        <p className="prompt">{pattern.prompt}</p>
        <div className="slot-row" aria-label="已選詞卡">
          {picked.length === 0 ? (
            <span className="muted">點下面的詞卡，把它們叫回隊伍</span>
          ) : (
            picked.map((t, i) => (
              <span key={`${t}-${i}`} className="slot">
                {t}
              </span>
            ))
          )}
        </div>
        <div className="token-row">
          {bank.map((t, i) => (
            <button
              key={`${t}-${i}`}
              type="button"
              className="token"
              disabled={locked}
              onClick={() => {
                if (locked) return
                const nextBank = [...bank]
                nextBank.splice(i, 1)
                const nextPicked = [...picked, t]
                setBank(nextBank)
                setPicked(nextPicked)
                check(nextPicked)
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div className={`feedback ${feedback.includes('拼好') ? 'ok' : feedback ? 'bad' : ''}`}>
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
