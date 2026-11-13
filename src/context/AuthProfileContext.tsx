import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import {
  deleteCloudProfile,
  pullCloudProfiles,
  pushCloudProfile,
  pushCloudProgress,
  syncAllProfilesProgress,
} from '../lib/cloudSync'
import { getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from '../lib/firebase'
import {
  defaultProgressState,
  registerCloudProgressSaver,
  saveProgressForProfile,
} from '../lib/progress'
import {
  addLocalProfile,
  getActiveProfile,
  loadProfileStore,
  isDefaultProfile,
  migrateLegacyProgressIfNeeded,
  removeLocalProfile,
  setActiveProfileId,
  type PlayerProfile,
  updateLocalProfile,
} from '../lib/profiles'

type AuthProfileContextValue = {
  ready: boolean
  cloudEnabled: boolean
  user: User | null
  profiles: PlayerProfile[]
  activeProfile: PlayerProfile | null
  syncing: boolean
  syncError: string | null
  signInWithGoogle: () => Promise<void>
  signOutUser: () => Promise<void>
  selectProfile: (profileId: string) => Promise<void>
  clearActiveProfile: () => void
  createProfile: (input: {
    name: string
    color: string
    emoji: string
  }) => Promise<PlayerProfile>
  renameProfile: (
    profileId: string,
    patch: Partial<Pick<PlayerProfile, 'name' | 'color' | 'emoji'>>,
  ) => Promise<void>
  deleteProfile: (profileId: string) => Promise<void>
  refreshProfiles: () => void
}

const AuthProfileContext = createContext<AuthProfileContextValue | null>(null)

export function AuthProfileProvider({ children }: { children: ReactNode }) {
  const cloudEnabled = isFirebaseConfigured()
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [profiles, setProfiles] = useState<PlayerProfile[]>([])
  const [activeProfile, setActiveProfile] = useState<PlayerProfile | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const saveTimer = useRef<number | null>(null)
  const userRef = useRef<User | null>(null)

  const refreshProfiles = useCallback(() => {
    const store = loadProfileStore()
    setProfiles(store.profiles)
    setActiveProfile(
      store.activeProfileId
        ? (store.profiles.find((p) => p.id === store.activeProfileId) ?? null)
        : null,
    )
  }, [])

  useEffect(() => {
    migrateLegacyProgressIfNeeded()
    refreshProfiles()

    if (!cloudEnabled) {
      setReady(true)
      return
    }

    const auth = getFirebaseAuth()
    if (!auth) {
      setReady(true)
      return
    }

    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      userRef.current = nextUser
      setUser(nextUser)
      setSyncError(null)
      if (nextUser) {
        const db = getFirebaseDb()
        if (db) {
          try {
            setSyncing(true)
            const remote = await pullCloudProfiles(db, nextUser.uid)
            const store = loadProfileStore()
            const list = remote.length ? remote : store.profiles
            if (remote.length === 0 && store.profiles.length) {
              for (const p of store.profiles) {
                await pushCloudProfile(db, nextUser.uid, p)
              }
            }
            await syncAllProfilesProgress(db, nextUser.uid, list)
            refreshProfiles()
          } catch (err) {
            console.error(err)
            setSyncError('雲端同步失敗，先用這台的進度。')
          } finally {
            setSyncing(false)
          }
        }
      }
      setReady(true)
    })

    return () => unsub()
  }, [cloudEnabled, refreshProfiles])

  useEffect(() => {
    registerCloudProgressSaver((profileId, state) => {
      const u = userRef.current
      const db = getFirebaseDb()
      if (!u || !db) return
      if (saveTimer.current != null) window.clearTimeout(saveTimer.current)
      saveTimer.current = window.setTimeout(() => {
        pushCloudProgress(db, u.uid, profileId, state).catch((err) => {
          console.error(err)
          setSyncError('進度上傳失敗，已先存在這台。')
        })
      }, 800)
    })
    return () => {
      registerCloudProgressSaver(null)
      if (saveTimer.current != null) window.clearTimeout(saveTimer.current)
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error('尚未設定 Firebase')
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    await signInWithPopup(auth, provider)
  }, [])

  const signOutUser = useCallback(async () => {
    const auth = getFirebaseAuth()
    setActiveProfileId(null)
    setActiveProfile(null)
    if (auth) await signOut(auth)
    refreshProfiles()
  }, [refreshProfiles])

  const selectProfile = useCallback(
    async (profileId: string) => {
      setActiveProfileId(profileId)
      refreshProfiles()
      const u = userRef.current
      const db = getFirebaseDb()
      const profile =
        getActiveProfile() ||
        loadProfileStore().profiles.find((p) => p.id === profileId)
      if (u && db && profile) {
        try {
          setSyncing(true)
          await syncAllProfilesProgress(db, u.uid, [profile])
        } catch (err) {
          console.error(err)
          setSyncError('讀取雲端進度失敗，先用這台的。')
        } finally {
          setSyncing(false)
          refreshProfiles()
        }
      }
    },
    [refreshProfiles],
  )

  const clearActiveProfile = useCallback(() => {
    setActiveProfileId(null)
    setActiveProfile(null)
    refreshProfiles()
  }, [refreshProfiles])

  const createProfile = useCallback(
    async (input: { name: string; color: string; emoji: string }) => {
      const profile = addLocalProfile(input)
      const empty = defaultProgressState()
      saveProgressForProfile(profile.id, empty, { skipCloud: true })
      const u = userRef.current
      const db = getFirebaseDb()
      if (u && db) {
        await pushCloudProfile(db, u.uid, profile)
        await pushCloudProgress(db, u.uid, profile.id, empty)
      }
      refreshProfiles()
      return profile
    },
    [refreshProfiles],
  )

  const renameProfile = useCallback(
    async (
      profileId: string,
      patch: Partial<Pick<PlayerProfile, 'name' | 'color' | 'emoji'>>,
    ) => {
      const updated = updateLocalProfile(profileId, patch)
      if (!updated) return
      const u = userRef.current
      const db = getFirebaseDb()
      if (u && db) await pushCloudProfile(db, u.uid, updated)
      refreshProfiles()
    },
    [refreshProfiles],
  )

  const deleteProfile = useCallback(
    async (profileId: string) => {
      const target = loadProfileStore().profiles.find((p) => p.id === profileId)
      if (!target || isDefaultProfile(target)) return
      removeLocalProfile(profileId)
      const u = userRef.current
      const db = getFirebaseDb()
      if (u && db) {
        try {
          await deleteCloudProfile(db, u.uid, profileId)
        } catch (err) {
          console.error(err)
          setSyncError('已從這台刪除，但雲端刪除失敗，之後可能又同步回來。')
        }
      }
      refreshProfiles()
    },
    [refreshProfiles],
  )

  const value = useMemo<AuthProfileContextValue>(
    () => ({
      ready,
      cloudEnabled,
      user,
      profiles,
      activeProfile,
      syncing,
      syncError,
      signInWithGoogle,
      signOutUser,
      selectProfile,
      clearActiveProfile,
      createProfile,
      renameProfile,
      deleteProfile,
      refreshProfiles,
    }),
    [
      ready,
      cloudEnabled,
      user,
      profiles,
      activeProfile,
      syncing,
      syncError,
      signInWithGoogle,
      signOutUser,
      selectProfile,
      clearActiveProfile,
      createProfile,
      renameProfile,
      deleteProfile,
      refreshProfiles,
    ],
  )

  return (
    <AuthProfileContext.Provider value={value}>
      {children}
    </AuthProfileContext.Provider>
  )
}

export function useAuthProfile() {
  const ctx = useContext(AuthProfileContext)
  if (!ctx) {
    throw new Error('useAuthProfile 必須包在 AuthProfileProvider 內')
  }
  return ctx
}
