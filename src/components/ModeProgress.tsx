import { MODE_ORDER } from '../lib/modes'
import { getLessonProgress, loadProgress, starKey } from '../lib/progress'

type Props = {
  lessonId: number
  /** 首頁較精簡；模式選單可顯示說明 */
  showHint?: boolean
}

export function ModeProgress({ lessonId, showHint = false }: Props) {
  const summary = getLessonProgress(lessonId)
  const progress = loadProgress()
  const percent = Math.round((summary.modesDone / summary.modeTotal) * 100)

  return (
    <div className="mode-progress">
      <div className="meta-row">
        <span className="muted">
          已玩 {summary.modesDone}/{summary.modeTotal} 種
        </span>
        <span className="muted">{percent}%</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={summary.modesDone}
        aria-valuemin={0}
        aria-valuemax={summary.modeTotal}
        aria-label="玩法進度"
      >
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="mode-dots" aria-hidden>
        {MODE_ORDER.map((mode) => {
          const key = starKey(lessonId, mode)
          const played = Object.prototype.hasOwnProperty.call(progress.stars, key)
          const stars = progress.stars[key] ?? 0
          return (
            <span
              key={mode}
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
