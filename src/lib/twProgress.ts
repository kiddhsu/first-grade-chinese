import type { TwWrongItem } from '../types'
import {
  TW_MODE_ORDER,
  TW_MODES_PER_LESSON,
  TW_STARS_PER_MODE,
  type TwModeId,
} from './twModes'
import { loadProgress, saveProgress, starsFromCorrect } from './progress'

export const TW_MAX_LESSON_STARS = TW_MODES_PER_LESSON * TW_STARS_PER_MODE

export function twStarKey(lessonId: number, modeId: TwModeId) {
  return `tw:${lessonId}:${modeId}`
}

export function addTwStars(lessonId: number, modeId: TwModeId, earned: number) {
  const state = loadProgress()
  const key = twStarKey(lessonId, modeId)
  state.stars[key] = Math.max(0, Math.min(3, Math.round(earned)))
  saveProgress(state)
  return state.stars[key]
}

export function getTwModeStars(lessonId: number, modeId: TwModeId) {
  const state = loadProgress()
  const key = twStarKey(lessonId, modeId)
  return {
    played: Object.prototype.hasOwnProperty.call(state.stars, key),
    stars: state.stars[key] ?? 0,
  }
}

export function getTwLessonProgress(lessonId: number) {
  const state = loadProgress()
  const perMode = TW_MODE_ORDER.map((modeId) => {
    const key = twStarKey(lessonId, modeId)
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
    modeTotal: TW_MODES_PER_LESSON,
    earned,
    max: TW_MAX_LESSON_STARS,
    percent: Math.round((modesDone / TW_MODES_PER_LESSON) * 100),
  }
}

export function markTwWrong(item: TwWrongItem) {
  const state = loadProgress()
  const next = [item, ...state.wrongTw.filter((w) => w.id !== item.id)].slice(0, 40)
  state.wrongTw = next
  saveProgress(state)
}

export function clearTwWrong(id: string) {
  const state = loadProgress()
  state.wrongTw = state.wrongTw.filter((w) => w.id !== id)
  saveProgress(state)
}

export { starsFromCorrect, TW_STARS_PER_MODE, TW_MODE_ORDER }
