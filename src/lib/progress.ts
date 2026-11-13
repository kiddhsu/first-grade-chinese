import type { GameMode, ProgressState } from '../types'
import { getActiveProfile, progressKeyForProfile } from './profiles'

const LEGACY_KEY = 'fgc-progress-v1'

export const defaultProgressState = (): ProgressState => ({
  stars: {},
  wrongChars: [],
  wrongMath: [],
  wrongTw: [],
  sessionStartedAt: null,
  restPromptDismissedUntil: null,
})

function activeProgressKey() {
  const profile = getActiveProfile()
  if (!profile) return LEGACY_KEY
  return progressKeyForProfile(profile.id)
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(activeProgressKey())
    if (!raw) return defaultProgressState()
    return { ...defaultProgressState(), ...JSON.parse(raw) }
  } catch {
    return defaultProgressState()
  }
}

export function loadProgressForProfile(profileId: string): ProgressState {
  try {
    const raw = localStorage.getItem(progressKeyForProfile(profileId))
    if (!raw) return defaultProgressState()
    return { ...defaultProgressState(), ...JSON.parse(raw) }
  } catch {
    return defaultProgressState()
  }
}

type SaveOptions = {
  /** 略過雲端同步（由 sync 層寫入本機時使用） */
  skipCloud?: boolean
}

let cloudSaveHandler: ((profileId: string, state: ProgressState) => void) | null =
  null

/** 由 AuthProfileProvider 註冊：本機存檔後排程上傳 */
export function registerCloudProgressSaver(
  handler: ((profileId: string, state: ProgressState) => void) | null,
) {
  cloudSaveHandler = handler
}

export function saveProgress(state: ProgressState, options: SaveOptions = {}) {
  const key = activeProgressKey()
  localStorage.setItem(key, JSON.stringify(state))
  if (options.skipCloud) return
  const profile = getActiveProfile()
  if (profile && cloudSaveHandler) {
    cloudSaveHandler(profile.id, state)
  }
}

export function saveProgressForProfile(
  profileId: string,
  state: ProgressState,
  options: SaveOptions = {},
) {
  localStorage.setItem(progressKeyForProfile(profileId), JSON.stringify(state))
  if (options.skipCloud) return
  if (cloudSaveHandler) cloudSaveHandler(profileId, state)
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

/** 合併兩份進度：星星取較高；錯題合併去重 */
export function mergeProgress(
  a: ProgressState,
  b: ProgressState,
): ProgressState {
  const stars: Record<string, number> = { ...a.stars }
  for (const [k, v] of Object.entries(b.stars)) {
    stars[k] = Math.max(stars[k] ?? 0, v)
  }
  const wrongChars = [...new Set([...a.wrongChars, ...b.wrongChars])].slice(-40)
  const wrongMathMap = new Map(
    [...a.wrongMath, ...b.wrongMath].map((item) => [item.id, item]),
  )
  const wrongTwMap = new Map(
    [...a.wrongTw, ...b.wrongTw].map((item) => [item.id, item]),
  )
  return {
    stars,
    wrongChars,
    wrongMath: [...wrongMathMap.values()].slice(0, 40),
    wrongTw: [...wrongTwMap.values()].slice(0, 40),
    sessionStartedAt: a.sessionStartedAt ?? b.sessionStartedAt,
    restPromptDismissedUntil:
      a.restPromptDismissedUntil ?? b.restPromptDismissedUntil,
  }
}
