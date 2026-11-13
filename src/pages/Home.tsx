import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MathUnitProgress } from '../components/MathUnitProgress'
import { ModeProgress } from '../components/ModeProgress'
import { lessons } from '../content/grade1-vol1'
import { mathUnits } from '../content/math-hanlin-g1/units'

type Subject = 'chinese' | 'math'

const SUBJECT_KEY = 'fgc-subject'

function MathUnitCard({
  unitId,
  unitNo,
  title,
  blurb,
}: {
  unitId: number
  unitNo: number
  title: string
  blurb: string
}) {
  return (
    <Link className="lesson-card" to={`/math/${unitId}`}>
      <span className="eyebrow">第 {unitNo} 單元 · 出發</span>
      <strong>{title}</strong>
      <p className="card-blurb">{blurb}</p>
      <MathUnitProgress unitId={unitId} />
    </Link>
  )
}

export function Home() {
  const [subject, setSubject] = useState<Subject>(() => {
    try {
      const saved = localStorage.getItem(SUBJECT_KEY)
      return saved === 'math' ? 'math' : 'chinese'
    } catch {
      return 'chinese'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(SUBJECT_KEY, subject)
    } catch {
      /* ignore */
    }
  }, [subject])

  const mathUp = mathUnits.filter((u) => u.semester === '一上')
  const mathDown = mathUnits.filter((u) => u.semester === '一下')

  return (
    <>
      <header className="brand">
        <h1>答錯也不會被老師罰寫</h1>
        <p>
          {subject === 'chinese'
            ? '選一課，把國字逗得乖乖聽話。'
            : '選一關，把數字逗得歪七扭八。'}
        </p>
      </header>

      <div className="subject-tabs" role="tablist" aria-label="科目">
        <button
          type="button"
          role="tab"
          aria-selected={subject === 'chinese'}
          className={`subject-tab${subject === 'chinese' ? ' subject-tab--on' : ''}`}
          onClick={() => setSubject('chinese')}
        >
          國語
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={subject === 'math'}
          className={`subject-tab${subject === 'math' ? ' subject-tab--on' : ''}`}
          onClick={() => setSubject('math')}
        >
          數學
        </button>
      </div>

      {subject === 'chinese' ? (
        <>
          <div className="top-nav">
            <Link className="chip" to="/review">
              今天再練一輪
            </Link>
          </div>

          <p className="section-label">國語一年級上學期</p>
          <section className="grid-cards">
            {lessons.map((lesson) => (
              <Link
                key={lesson.lessonId}
                className="lesson-card"
                to={`/lesson/${lesson.lessonId}`}
              >
                <span className="eyebrow">第 {lesson.lessonId} 關 · 出發</span>
                <strong>{lesson.title}</strong>
                <ModeProgress lessonId={lesson.lessonId} />
              </Link>
            ))}
          </section>
        </>
      ) : (
        <>
          <div className="top-nav">
            <Link className="chip" to="/math-review">
              今天再練一輪
            </Link>
          </div>

          <p className="section-label">數學一年級上學期</p>
          <section className="grid-cards">
            {mathUp.map((unit) => (
              <MathUnitCard
                key={unit.unitId}
                unitId={unit.unitId}
                unitNo={unit.unitNo}
                title={unit.title}
                blurb={unit.blurb}
              />
            ))}
          </section>

          <p className="section-label">數學一年級下學期</p>
          <section className="grid-cards">
            {mathDown.map((unit) => (
              <MathUnitCard
                key={unit.unitId}
                unitId={unit.unitId}
                unitNo={unit.unitNo}
                title={unit.title}
                blurb={unit.blurb}
              />
            ))}
          </section>
        </>
      )}
    </>
  )
}
