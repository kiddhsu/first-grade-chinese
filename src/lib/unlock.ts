import { lessons } from '../content/grade1-vol1'
import { mathUnits } from '../content/math-hanlin-g1/units'
import { twLessons } from '../content/taiwanese-jenpin-g1/lessons'
import { getLessonProgress } from './progress'
import { getMathUnitProgress } from './mathProgress'
import { getTwLessonProgress } from './twProgress'

/** 上一關至少玩過 1 種玩法，就算通關可解鎖下一關 */
export function isStageCleared(modesDone: number) {
  return modesDone >= 1
}

/**
 * 線性解鎖：第 1 關永遠開；已玩過的關保持可進；否則需上一關已通關。
 */
export function computeUnlocked(stages: { cleared: boolean; started: boolean }[]) {
  const unlocked: boolean[] = []
  for (let i = 0; i < stages.length; i += 1) {
    if (i === 0 || stages[i].started) {
      unlocked.push(true)
      continue
    }
    unlocked.push(Boolean(unlocked[i - 1] && stages[i - 1].cleared))
  }
  return unlocked
}

export function getChineseUnlockMap() {
  const stages = lessons.map((l) => {
    const p = getLessonProgress(l.lessonId)
    const started = p.modesDone > 0
    return { cleared: isStageCleared(p.modesDone), started }
  })
  const flags = computeUnlocked(stages)
  const map: Record<number, boolean> = {}
  lessons.forEach((l, i) => {
    map[l.lessonId] = flags[i]
  })
  return map
}

export function getMathUnlockMap() {
  const stages = mathUnits.map((u) => {
    const p = getMathUnitProgress(u.unitId)
    const started = p.modesDone > 0
    return { cleared: isStageCleared(p.modesDone), started }
  })
  const flags = computeUnlocked(stages)
  const map: Record<number, boolean> = {}
  mathUnits.forEach((u, i) => {
    map[u.unitId] = flags[i]
  })
  return map
}

export function getTwUnlockMap() {
  const stages = twLessons.map((l) => {
    const p = getTwLessonProgress(l.lessonId)
    const started = p.modesDone > 0
    return { cleared: isStageCleared(p.modesDone), started }
  })
  const flags = computeUnlocked(stages)
  const map: Record<number, boolean> = {}
  twLessons.forEach((l, i) => {
    map[l.lessonId] = flags[i]
  })
  return map
}

export function isChineseLessonUnlocked(lessonId: number) {
  return Boolean(getChineseUnlockMap()[lessonId])
}

export function isMathUnitUnlocked(unitId: number) {
  return Boolean(getMathUnlockMap()[unitId])
}

export function isTwLessonUnlocked(lessonId: number) {
  return Boolean(getTwUnlockMap()[lessonId])
}
