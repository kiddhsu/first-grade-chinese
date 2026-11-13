import { Link, useParams } from 'react-router-dom'
import { TwLessonProgress } from '../components/TwLessonProgress'
import { getTwLesson } from '../content/taiwanese-jenpin-g1/lessons'
import { getTwModes } from '../lib/twModes'
import { getTwModeStars, TW_STARS_PER_MODE } from '../lib/twProgress'

export function TwHub() {
  const { lessonId = '' } = useParams()
  const id = Number(lessonId)
  const lesson = getTwLesson(id)

  if (!lesson) {
    return (
      <div className="panel empty">
        <p>咦，這一課躲起來了。</p>
        <Link className="btn btn-ghost" to="/">
          回首頁
        </Link>
      </div>
    )
  }

  const modes = getTwModes()

  return (
    <>
      <div className="top-nav">
        <Link className="chip" to="/">
          ← 換一課
        </Link>
      </div>

      <header className="brand">
        <h1>
          第 {lesson.lessonNo} 課　{lesson.title}
        </h1>
        <p>想玩哪一種？點下去就開始！</p>
      </header>

      <div className="panel">
        <TwLessonProgress lessonId={lesson.lessonId} showHint />
      </div>

      <section className="grid-cards">
        {modes.map((mode) => {
          const { played, stars } = getTwModeStars(lesson.lessonId, mode.id)
          return (
            <Link
              key={mode.id}
              className="mode-card"
              to={`/tw/${lesson.lessonId}/${mode.path}`}
            >
              <span className="eyebrow">{mode.tag}</span>
              <strong>{mode.title}</strong>
              <span className="muted">{mode.subtitle}</span>
              <div className="meta-row">
                <span className="muted">{played ? `成績 ${stars} 星` : '還沒練過'}</span>
                <span className="stars">
                  {'★'.repeat(stars)}
                  {'☆'.repeat(TW_STARS_PER_MODE - stars)}
                </span>
              </div>
            </Link>
          )
        })}
      </section>
    </>
  )
}
