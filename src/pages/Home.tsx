import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MathUnitProgress } from '../components/MathUnitProgress'
import { ModeProgress } from '../components/ModeProgress'
import { TwLessonProgress } from '../components/TwLessonProgress'
import { lessons } from '../content/grade1-vol1'
import { mathUnits } from '../content/math-hanlin-g1/units'
import { twLessons } from '../content/taiwanese-jenpin-g1/lessons'

type Subject = 'chinese' | 'math' | 'taiwanese'

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

function TwLessonCard({
  lessonId,
  lessonNo,
  title,
  blurb,
  semester,
}: {
  lessonId: number
  lessonNo: number
  title: string
  blurb: string
  semester: string
}) {
  return (
    <Link className="lesson-card" to={`/tw/${lessonId}`}>
      <span className="eyebrow">
        {semester}第 {lessonNo} 課 · 出發
      </span>
      <strong>{title}</strong>
      <p className="card-blurb">{blurb}</p>
      <TwLessonProgress lessonId={lessonId} />
    </Link>
  )
}

function loadSubject(): Subject {
  try {
    const saved = localStorage.getItem(SUBJECT_KEY)
    if (saved === 'math' || saved === 'taiwanese' || saved === 'chinese') {
      return saved
    }
  } catch {
    /* ignore */
  }
  return 'chinese'
}

const HOME_LINE: Record<Subject, string> = {
  chinese: '選一課，把國字逗得乖乖聽話。',
  math: '選一關，把數字逗得歪七扭八。',
  taiwanese: '選一課，共臺語耍甲足歡喜。',
}

const REVIEW_PATH: Record<Subject, string> = {
  chinese: '/review',
  math: '/math-review',
  taiwanese: '/tw-review',
}

export function Home() {
  const [subject, setSubject] = useState<Subject>(loadSubject)

  useEffect(() => {
    try {
      localStorage.setItem(SUBJECT_KEY, subject)
    } catch {
      /* ignore */
    }
  }, [subject])

  const mathUp = mathUnits.filter((u) => u.semester === '一上')
  const mathDown = mathUnits.filter((u) => u.semester === '一下')
  const twUp = twLessons.filter((l) => l.semester === '一上')
  const twDown = twLessons.filter((l) => l.semester === '一下')

  return (
    <>
      <header className="brand brand--home">
        <h1>小老師就是妳😊</h1>
        <p>{HOME_LINE[subject]}</p>
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
        <button
          type="button"
          role="tab"
          aria-selected={subject === 'taiwanese'}
          className={`subject-tab${subject === 'taiwanese' ? ' subject-tab--on' : ''}`}
          onClick={() => setSubject('taiwanese')}
        >
          閩南語
        </button>
      </div>

      <div
        className={`home-actions${subject === 'taiwanese' ? ' home-actions--split' : ''}`}
      >
        <Link className="review-cta" to={REVIEW_PATH[subject]}>
          今天再練一輪
        </Link>
        {subject === 'taiwanese' && (
          <a
            className="tw-listen-cta"
            href="https://listen.jen-pin.com.tw/edge-agua-mxvq"
            target="_blank"
            rel="noreferrer"
          >
            聽真平課文音檔
          </a>
        )}
      </div>

      {subject === 'chinese' ? (
        <>
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
      ) : subject === 'math' ? (
        <>
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
      ) : (
        <>
          <p className="section-label">閩南語一年級上學期</p>
          <section className="grid-cards">
            {twUp.map((lesson) => (
              <TwLessonCard
                key={lesson.lessonId}
                lessonId={lesson.lessonId}
                lessonNo={lesson.lessonNo}
                title={lesson.title}
                blurb={lesson.blurb}
                semester={lesson.semester}
              />
            ))}
          </section>

          <p className="section-label">閩南語一年級下學期</p>
          <section className="grid-cards">
            {twDown.map((lesson) => (
              <TwLessonCard
                key={lesson.lessonId}
                lessonId={lesson.lessonId}
                lessonNo={lesson.lessonNo}
                title={lesson.title}
                blurb={lesson.blurb}
                semester={lesson.semester}
              />
            ))}
          </section>
        </>
      )}
    </>
  )
}
