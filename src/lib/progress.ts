import type { GameMode, ProgressState } from '../types'

const KEY = 'fgc-progress-v1'

const defaultState = (): ProgressState => ({
  stars: {},
  wrongChars: [],
  wrongMath: [],
  wrongTw: [],
  sessionStartedAt: null,
  restPromptDismissedUntil: null,
})

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    return { ...defaultState(), ...JSON.parse(raw) }
  } catch {
    return defaultState()
  }
}

export function saveProgress(state: ProgressState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function starKey(lessonId: number, mode: GameMode) {
  return `${lessonId}:${mode}`
}

/** 以這次成績直接覆蓋（可升可降），上限 3 星 */
export function addStars(lessonId: number, mode: GameMode, earned: number) {
  const state = loadProgress()
  const key = starKey(lessonId, mode)
  state.stars[key] = Math.max(0, Math.min(3, Math.round(earned)))
  saveProgress(state)
  return state.stars[key]
}

/** 依「一次答對」題數換算星等；全錯可為 0 星 */
export function starsFromCorrect(correct: number, total: number) {
  if (total <= 0 || correct <= 0) return 0
  return Math.min(3, Math.max(1, Math.round((correct / total) * 3)))
}

export const LESSON_MODES: GameMode[] = [
  'stroke',
  'recognize',
  'radical',
  'punct',
  'sentence',
]

/** 每個玩法最多 3 星，一課最多 15 星 */
export const STARS_PER_MODE = 3
export const MAX_LESSON_STARS = LESSON_MODES.length * STARS_PER_MODE

export function getLessonStars(lessonId: number) {
  const state = loadProgress()
  return LESSON_MODES.reduce(
    (sum, m) => sum + (state.stars[starKey(lessonId, m)] ?? 0),
    0,
  )
}

/** 首頁／選單進度：圓點看有沒有玩過（含 0 星），星數另計成績 */
export function getLessonProgress(lessonId: number) {
  const state = loadProgress()
  const perMode = LESSON_MODES.map((m) => {
    const key = starKey(lessonId, m)
    return {
      played: Object.prototype.hasOwnProperty.call(state.stars, key),
      stars: state.stars[key] ?? 0,
    }
  })
  const earned = perMode.reduce((sum, n) => sum + n.stars, 0)
  const modesDone = perMode.filter((n) => n.played).length
  const filled = Math.round((earned / MAX_LESSON_STARS) * LESSON_MODES.length)
  return {
    earned,
    max: MAX_LESSON_STARS,
    modesDone,
    modeTotal: LESSON_MODES.length,
    filled: Math.min(LESSON_MODES.length, filled),
    slots: LESSON_MODES.length,
  }
}

export function markWrong(char: string) {
  const state = loadProgress()
  if (!state.wrongChars.includes(char)) {
    state.wrongChars = [...state.wrongChars, char].slice(-40)
    saveProgress(state)
  }
}

export function clearWrong(char: string) {
  const state = loadProgress()
  state.wrongChars = state.wrongChars.filter((c) => c !== char)
  saveProgress(state)
}

export function touchSession() {
  const state = loadProgress()
  if (!state.sessionStartedAt) {
    state.sessionStartedAt = Date.now()
    saveProgress(state)
  }
  return state
}

export function shouldShowRestPrompt(limitMinutes = 30) {
  const state = loadProgress()
  const now = Date.now()
  if (state.restPromptDismissedUntil && now < state.restPromptDismissedUntil) {
    return false
  }
  if (!state.sessionStartedAt) return false
  return now - state.sessionStartedAt >= limitMinutes * 60 * 1000
}

export function dismissRestPrompt(minutes = 30) {
  const state = loadProgress()
  state.restPromptDismissedUntil = Date.now() + minutes * 60 * 1000
  state.sessionStartedAt = Date.now()
  saveProgress(state)
}
