import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  type Firestore,
} from 'firebase/firestore'
import type { ProgressState } from '../types'
import {
  defaultProgressState,
  loadProgressForProfile,
  mergeProgress,
  saveProgressForProfile,
} from './progress'
import type { PlayerProfile } from './profiles'
import {
  DEFAULT_PROFILE_NAME,
  loadProfileStore,
  progressKeyForProfile,
  replaceLocalProfiles,
  saveProfileStore,
} from './profiles'

function profilesCol(db: Firestore, uid: string) {
  return collection(db, 'users', uid, 'profiles')
}

function progressDoc(db: Firestore, uid: string, profileId: string) {
  return doc(db, 'users', uid, 'progress', profileId)
}

export async function pullCloudProfiles(db: Firestore, uid: string) {
  const snap = await getDocs(profilesCol(db, uid))
  const profiles: PlayerProfile[] = []
  const renamed: PlayerProfile[] = []
  snap.forEach((d) => {
    const data = d.data() as Omit<PlayerProfile, 'id'> & { id?: string }
    const rawName = data.name || '使用者'
    const name = rawName === '小老師' ? DEFAULT_PROFILE_NAME : rawName
    const profile: PlayerProfile = {
      id: d.id,
      name,
      color: data.color || '#3aa0ff',
      emoji: data.emoji || '😊',
      isDefault: data.isDefault === true || name !== rawName,
      createdAt: data.createdAt || Date.now(),
      updatedAt: name !== rawName ? Date.now() : data.updatedAt || Date.now(),
    }
    profiles.push(profile)
    if (name !== rawName) renamed.push(profile)
  })
  if (profiles.length) {
    const local = loadProfileStore()
    const remoteIds = new Set(profiles.map((p) => p.id))
    const keep =
      profiles.find((p) => p.isDefault) ||
      profiles.find((p) => p.name === DEFAULT_PROFILE_NAME) ||
      profiles[0]
    for (const localP of local.profiles) {
      if (remoteIds.has(localP.id)) continue
      const merged = mergeProgress(
        loadProgressForProfile(keep.id),
        loadProgressForProfile(localP.id),
      )
      saveProgressForProfile(keep.id, merged, { skipCloud: true })
      try {
        localStorage.removeItem(progressKeyForProfile(localP.id))
      } catch {
        /* ignore */
      }
    }
    replaceLocalProfiles(profiles)
  }
  for (const p of renamed) {
    await pushCloudProfile(db, uid, p)
  }
  return profiles
}

/**
 * 合併多餘的「練習生／預設」使用者，回傳應從雲端刪除的 id。
 */
export function dedupeDefaultProfiles(): string[] {
  const store = loadProfileStore()
  const candidates = store.profiles.filter(
    (p) => p.isDefault || p.name === DEFAULT_PROFILE_NAME,
  )
  if (candidates.length <= 1) {
    if (candidates.length === 1 && !candidates[0].isDefault) {
      saveProfileStore({
        ...store,
        profiles: store.profiles.map((p) =>
          p.id === candidates[0].id ? { ...p, isDefault: true } : p,
        ),
      })
    }
    return []
  }

  const kept = [...candidates].sort((a, b) => {
    if (Boolean(a.isDefault) !== Boolean(b.isDefault)) {
      return a.isDefault ? -1 : 1
    }
    return a.createdAt - b.createdAt
  })[0]

  let progress = loadProgressForProfile(kept.id)
  const removedIds: string[] = []
  for (const p of candidates) {
    if (p.id === kept.id) continue
    progress = mergeProgress(progress, loadProgressForProfile(p.id))
    removedIds.push(p.id)
    try {
      localStorage.removeItem(progressKeyForProfile(p.id))
    } catch {
      /* ignore */
    }
  }
  saveProgressForProfile(kept.id, progress, { skipCloud: true })

  const profiles = store.profiles
    .filter((p) => !removedIds.includes(p.id))
    .map((p) =>
      p.id === kept.id
        ? {
            ...p,
            name: DEFAULT_PROFILE_NAME,
            isDefault: true,
            updatedAt: Date.now(),
          }
        : { ...p, isDefault: false },
    )
  const activeProfileId =
    store.activeProfileId && removedIds.includes(store.activeProfileId)
      ? kept.id
      : store.activeProfileId

  saveProfileStore({ profiles, activeProfileId })
  return removedIds
}

export async function pushCloudProfile(
  db: Firestore,
  uid: string,
  profile: PlayerProfile,
) {
  await setDoc(doc(profilesCol(db, uid), profile.id), {
    name: profile.name,
    color: profile.color,
    emoji: profile.emoji,
    isDefault: profile.isDefault === true,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  })
}

export async function deleteCloudProfile(
  db: Firestore,
  uid: string,
  profileId: string,
) {
  await deleteDoc(doc(profilesCol(db, uid), profileId))
  await deleteDoc(progressDoc(db, uid, profileId))
}

export async function pullAndMergeProgress(
  db: Firestore,
  uid: string,
  profileId: string,
) {
  const local = loadProgressForProfile(profileId)
  const remoteSnap = await getDoc(progressDoc(db, uid, profileId))
  if (!remoteSnap.exists()) {
    if (Object.keys(local.stars).length || local.wrongChars.length) {
      await pushCloudProgress(db, uid, profileId, local)
    }
    return local
  }
  const remote = {
    ...defaultProgressState(),
    ...(remoteSnap.data() as ProgressState),
  }
  const merged = mergeProgress(local, remote)
  saveProgressForProfile(profileId, merged, { skipCloud: true })
  await pushCloudProgress(db, uid, profileId, merged)
  return merged
}

export async function pushCloudProgress(
  db: Firestore,
  uid: string,
  profileId: string,
  state: ProgressState,
) {
  await setDoc(progressDoc(db, uid, profileId), {
    ...state,
    updatedAt: Date.now(),
  })
}

export async function syncAllProfilesProgress(
  db: Firestore,
  uid: string,
  profiles: PlayerProfile[],
) {
  for (const p of profiles) {
    await pullAndMergeProgress(db, uid, p.id)
  }
}
