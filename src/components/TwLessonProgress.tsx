import { TW_MODE_ORDER } from '../lib/twModes'
import { getTwLessonProgress, twStarKey } from '../lib/twProgress'
import { loadProgress } from '../lib/progress'

type Props = {
  lessonId: number
  showHint?: boolean
}

export function TwLessonProgress({ lessonId, showHint = false }: Props) {
  const summary = getTwLessonProgress(lessonId)
  const progress = loadProgress()

  return (
    <div className="mode-progress">
      <div className="meta-row">
        <span className="muted">
          已玩 {summary.modesDone}/{summary.modeTotal} 種
        </span>
        <span className="muted">{summary.percent}%</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={summary.modesDone}
        aria-valuemin={0}
        aria-valuemax={summary.modeTotal}
        aria-label="玩法進度"
      >
        <div className="progress-fill" style={{ width: `${summary.percent}%` }} />
      </div>
      <div className="mode-dots" aria-hidden>
        {TW_MODE_ORDER.map((modeId) => {
          const key = twStarKey(lessonId, modeId)
          const played = Object.prototype.hasOwnProperty.call(progress.stars, key)
          const stars = progress.stars[key] ?? 0
          return (
            <span
              key={modeId}
              className={`mode-dot${played ? ' mode-dot--done' : ''}`}
              title={played ? `已練過（${stars} 星）` : '還沒練'}
            />
          )
        })}
      </div>
      {showHint && (
        <p className="muted mode-progress__hint">
          亮點＝玩過了　★＝這次玩得怎樣（最多 3 顆）
        </p>
      )}
    </div>
  )
}
