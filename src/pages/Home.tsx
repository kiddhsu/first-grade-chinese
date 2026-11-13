import { Link } from 'react-router-dom'
import { ModeProgress } from '../components/ModeProgress'
import { lessons } from '../content/grade1-vol1'

export function Home() {
  return (
    <>
      <header className="brand">
        <h1>答錯也不會被老師罰寫</h1>
        <p>選一課，把國字逗得乖乖聽話。</p>
        <p className="brand-note">個人自製練習小站，非出版社官方。</p>
      </header>

      <div className="top-nav">
        <Link className="chip" to="/review">
          今天再練一輪
        </Link>
      </div>

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
  )
}
