import { Link, Navigate, useParams } from 'react-router-dom'
import { MathUnitProgress } from '../components/MathUnitProgress'
import { getMathUnit } from '../content/math-hanlin-g1/units'
import { getMathModes } from '../lib/mathModes'
import { getMathModeStars, MATH_STARS_PER_MODE } from '../lib/mathProgress'
import { isMathUnitUnlocked } from '../lib/unlock'

export function MathHub() {
  const { unitId = '' } = useParams()
  const id = Number(unitId)
  const unit = getMathUnit(id)

  if (!unit) {
    return (
      <div className="panel empty">
        <p>咦，這一關躲起來了。</p>
        <Link className="btn btn-ghost" to="/">
          回首頁
        </Link>
      </div>
    )
  }

  if (!isMathUnitUnlocked(id)) {
    return <Navigate to="/" replace />
  }

  const modes = getMathModes(unit.kind)

  return (
    <>
      <div className="top-nav">
        <Link className="chip" to="/">
          ← 換一關
        </Link>
      </div>

      <header className="brand">
        <h1>
          第 {unit.unitNo} 單元　{unit.title}
        </h1>
        <p>想玩哪一種？點下去就開始！</p>
      </header>

      <div className="panel">
        <MathUnitProgress unitId={unit.unitId} showHint />
      </div>

      <section className="grid-cards">
        {modes.map((mode) => {
          const { played, stars } = getMathModeStars(unit.unitId, mode.id)
          return (
            <Link
              key={mode.id}
              className="mode-card"
              to={`/math/${unit.unitId}/${mode.path}`}
            >
              <span className="eyebrow">{mode.tag}</span>
              <strong>{mode.title}</strong>
              <span className="muted">{mode.subtitle}</span>
              <div className="meta-row">
                <span className="muted">{played ? `成績 ${stars} 星` : '還沒練過'}</span>
                <span className="stars">
                  {'★'.repeat(stars)}
                  {'☆'.repeat(MATH_STARS_PER_MODE - stars)}
                </span>
              </div>
            </Link>
          )
        })}
      </section>
    </>
  )
}
