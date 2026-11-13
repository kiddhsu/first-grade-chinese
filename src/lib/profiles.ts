export type PlayerProfile = {
  id: string
  name: string
  /** 頭像底色 */
  color: string
  /** 頭像符號 */
  emoji: string
  /** 系統預設使用者，不可刪除 */
  isDefault?: boolean
  createdAt: number
  updatedAt: number
}

export type ProfileStore = {
  profiles: PlayerProfile[]
  activeProfileId: string | null
}

const STORE_KEY = 'fgc-profiles-v1'
const LEGACY_PROGRESS_KEY = 'fgc-progress-v1'

export const PROFILE_COLORS = [
  '#3aa0ff',
  '#ffc107',
  '#ff7eb3',
  '#3dce9a',
  '#9b7bff',
  '#ff8a4c',
] as const

export const PROFILE_EMOJIS = ['😊', '🦊', '🐰', '🐼', '🐯', '🐸', '🦄', '🌟'] as const

function defaultStore(): ProfileStore {
  return { profiles: [], activeProfileId: null }
}

export function loadProfileStore(): ProfileStore {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return defaultStore()
    const parsed = JSON.parse(raw) as ProfileStore
    return {
      profiles: Array.isArray(parsed.profiles) ? parsed.profiles : [],
      activeProfileId: parsed.activeProfileId ?? null,
    }
  } catch {
    return defaultStore()
  }
}

export function saveProfileStore(store: ProfileStore) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

export function progressKeyForProfile(profileId: string) {
  return `${LEGACY_PROGRESS_KEY}:${profileId}`
}

export function createProfileId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const DEFAULT_PROFILE_NAME = '練習生'
const LEGACY_DEFAULT_PROFILE_NAME = '小老師'

export function isDefaultProfile(profile: PlayerProfile) {
  return profile.isDefault === true
}

/** 舊預設名稱「小老師」改為「練習生」，並標記系統預設使用者 */
export function renameLegacyDefaultProfileName() {
  const store = loadProfileStore()
  let changed = false
  let profiles = store.profiles.map((p) => {
    if (p.name !== LEGACY_DEFAULT_PROFILE_NAME) return p
    changed = true
    return {
      ...p,
      name: DEFAULT_PROFILE_NAME,
      isDefault: true,
      updatedAt: Date.now(),
    }
  })

  if (profiles.length > 0 && !profiles.some((p) => p.isDefault)) {
    const oldest = [...profiles].sort((a, b) => a.createdAt - b.createdAt)[0]
    profiles = profiles.map((p) =>
      p.id === oldest.id ? { ...p, isDefault: true } : p,
    )
    changed = true
  }

  if (!changed) return store
  const next: ProfileStore = { ...store, profiles }
  saveProfileStore(next)
  return next
}

/** 把舊版單一進度遷到預設使用者 */
export function migrateLegacyProgressIfNeeded() {
  const store = renameLegacyDefaultProfileName()
  if (store.profiles.length > 0) return store

  let legacy: string | null = null
  try {
    legacy = localStorage.getItem(LEGACY_PROGRESS_KEY)
  } catch {
    legacy = null
  }

  const now = Date.now()
  const profile: PlayerProfile = {
    id: createProfileId(),
    name: DEFAULT_PROFILE_NAME,
    color: PROFILE_COLORS[0],
    emoji: PROFILE_EMOJIS[0],
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  }

  if (legacy) {
    localStorage.setItem(progressKeyForProfile(profile.id), legacy)
    localStorage.removeItem(LEGACY_PROGRESS_KEY)
  }

  const next: ProfileStore = {
    profiles: [profile],
    activeProfileId: null,
  }
  saveProfileStore(next)
  return next
}

export function upsertLocalProfiles(profiles: PlayerProfile[]) {
  const store = loadProfileStore()
  const byId = new Map(store.profiles.map((p) => [p.id, p]))
  for (const p of profiles) {
    const prev = byId.get(p.id)
    byId.set(p.id, {
      ...p,
      isDefault: p.isDefault === true || prev?.isDefault === true,
    })
  }
  let list = [...byId.values()].sort((a, b) => a.createdAt - b.createdAt)
  if (list.length > 0 && !list.some((p) => p.isDefault)) {
    list = list.map((p, i) => (i === 0 ? { ...p, isDefault: true } : p))
  }
  const next: ProfileStore = {
    profiles: list,
    activeProfileId: store.activeProfileId,
  }
  saveProfileStore(next)
  return next
}

export function setActiveProfileId(profileId: string | null) {
  const store = loadProfileStore()
  store.activeProfileId = profileId
  saveProfileStore(store)
  return store
}

export function addLocalProfile(input: {
  name: string
  color: string
  emoji: string
}) {
  const store = loadProfileStore()
  const now = Date.now()
  const profile: PlayerProfile = {
    id: createProfileId(),
    name: input.name.trim() || '新朋友',
    color: input.color,
    emoji: input.emoji,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  }
  store.profiles.push(profile)
  saveProfileStore(store)
  return profile
}

export function updateLocalProfile(
  profileId: string,
  patch: Partial<Pick<PlayerProfile, 'name' | 'color' | 'emoji'>>,
) {
  const store = loadProfileStore()
  const idx = store.profiles.findIndex((p) => p.id === profileId)
  if (idx < 0) return null
  store.profiles[idx] = {
    ...store.profiles[idx],
    ...patch,
    updatedAt: Date.now(),
  }
  saveProfileStore(store)
  return store.profiles[idx]
}

export function removeLocalProfile(profileId: string) {
  const store = loadProfileStore()
  const target = store.profiles.find((p) => p.id === profileId)
  if (!target || isDefaultProfile(target)) return store
  store.profiles = store.profiles.filter((p) => p.id !== profileId)
  if (store.activeProfileId === profileId) store.activeProfileId = null
  saveProfileStore(store)
  try {
    localStorage.removeItem(progressKeyForProfile(profileId))
  } catch {
    /* ignore */
  }
  return store
}

export function getActiveProfile() {
  const store = loadProfileStore()
  if (!store.activeProfileId) return null
  return store.profiles.find((p) => p.id === store.activeProfileId) ?? null
}
