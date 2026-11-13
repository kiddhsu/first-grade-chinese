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
import { upsertLocalProfiles } from './profiles'

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
    const name = rawName === '小老師' ? '練習生' : rawName
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
  if (profiles.length) upsertLocalProfiles(profiles)
  for (const p of renamed) {
    await pushCloudProfile(db, uid, p)
  }
  return profiles
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
