import type { MathWrongItem } from '../types'
import {
  MATH_MAX_UNIT_STARS,
  MATH_MODE_ORDER,
  MATH_MODES_PER_UNIT,
  MATH_STARS_PER_MODE,
  type MathModeId,
} from './mathModes'
import { loadProgress, saveProgress, starsFromCorrect } from './progress'

export function mathStarKey(unitId: number, modeId: MathModeId) {
  return `math:${unitId}:${modeId}`
}

export function addMathStars(unitId: number, modeId: MathModeId, earned: number) {
  const state = loadProgress()
  const key = mathStarKey(unitId, modeId)
  state.stars[key] = Math.max(0, Math.min(3, Math.round(earned)))
  // 清掉舊版「整單元一顆進度」的 key，避免混淆
  delete state.stars[`math:${unitId}`]
  saveProgress(state)
  return state.stars[key]
}

export function getMathModeStars(unitId: number, modeId: MathModeId) {
  const state = loadProgress()
  const key = mathStarKey(unitId, modeId)
  return {
    played: Object.prototype.hasOwnProperty.call(state.stars, key),
    stars: state.stars[key] ?? 0,
  }
}

/** 首頁／單元頁：與國語一樣用「已玩幾種」算進度條 */
export function getMathUnitProgress(unitId: number) {
  const state = loadProgress()
  const perMode = MATH_MODE_ORDER.map((modeId) => {
    const key = mathStarKey(unitId, modeId)
    return {
      modeId,
      played: Object.prototype.hasOwnProperty.call(state.stars, key),
      stars: state.stars[key] ?? 0,
    }
  })
  const modesDone = perMode.filter((m) => m.played).length
  const earned = perMode.reduce((sum, m) => sum + m.stars, 0)
  return {
    perMode,
    modesDone,
    modeTotal: MATH_MODES_PER_UNIT,
    earned,
    max: MATH_MAX_UNIT_STARS,
    percent: Math.round((modesDone / MATH_MODES_PER_UNIT) * 100),
  }
}

export function markMathWrong(item: MathWrongItem) {
  const state = loadProgress()
  const next = [
    item,
    ...state.wrongMath.filter((w) => w.id !== item.id),
  ].slice(0, 40)
  state.wrongMath = next
  saveProgress(state)
}

export function clearMathWrong(id: string) {
  const state = loadProgress()
  state.wrongMath = state.wrongMath.filter((w) => w.id !== id)
  saveProgress(state)
}

export { starsFromCorrect, MATH_STARS_PER_MODE, MATH_MODE_ORDER }
