import { Link, useParams } from 'react-router-dom'
import { ModeProgress } from '../components/ModeProgress'
import { getLesson } from '../content/grade1-vol1'
import { MODE_META, MODE_ORDER } from '../lib/modes'
import { loadProgress, starKey, STARS_PER_MODE } from '../lib/progress'

export function ModeHub() {
  const { lessonId = '1' } = useParams()
  const id = Number(lessonId)
  const lesson = getLesson(id)
  const progress = loadProgress()

  if (!lesson) {
    return (
      <div className="panel empty">
        <p>咦，這一課躲起來了。</p>
        <Link className="btn btn-ghost" to="/">
          回樂園門口
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="top-nav">
        <Link className="chip" to="/">
          ← 換一課
        </Link>
      </div>

      <header className="brand">
        <h1>
          第 {lesson.lessonId} 關　{lesson.title}
        </h1>
        <p>想玩哪一種？點下去就開始！</p>
      </header>

      <div className="panel">
        <ModeProgress lessonId={id} showHint />
      </div>

      <section className="grid-cards">
        {MODE_ORDER.map((mode) => {
          const meta = MODE_META[mode]
          const stars = progress.stars[starKey(id, mode)] ?? 0
          return (
            <Link
              key={mode}
              className="mode-card"
              to={`/lesson/${id}/${meta.path}`}
            >
              <span className="eyebrow">{meta.tag}</span>
              <strong>{meta.title}</strong>
              <span className="muted">{meta.subtitle}</span>
              <div className="meta-row">
                <span className="muted">
                  {Object.prototype.hasOwnProperty.call(
                    progress.stars,
                    starKey(id, mode),
                  )
                    ? `成績 ${stars} 星`
                    : '還沒練過'}
                </span>
                <span className="stars">
                  {'★'.repeat(stars)}
                  {'☆'.repeat(STARS_PER_MODE - stars)}
                </span>
              </div>
            </Link>
          )
        })}
      </section>
    </>
  )
}
