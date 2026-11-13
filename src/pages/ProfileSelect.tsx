import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthProfile } from '../context/AuthProfileContext'
import {
  isDefaultProfile,
  PROFILE_COLORS,
  PROFILE_EMOJIS,
} from '../lib/profiles'

export function ProfileSelect() {
  const navigate = useNavigate()
  const {
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
    createProfile,
    deleteProfile,
  } = useAuthProfile()

  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(PROFILE_COLORS[0])
  const [emoji, setEmoji] = useState<string>(PROFILE_EMOJIS[0])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [managing, setManaging] = useState(false)
  const [nameChecked, setNameChecked] = useState(false)
  const canManage = profiles.some((p) => !isDefaultProfile(p))
  const nameMissing = !name.trim()
  const showNameError = nameChecked && nameMissing

  useEffect(() => {
    if (!canManage && managing) setManaging(false)
  }, [canManage, managing])

  if (!ready) {
    return (
      <div className="profile-screen">
        <p className="profile-screen__hint">載入中…</p>
      </div>
    )
  }

  if (activeProfile) {
    return <Navigate to="/" replace />
  }

  const onPick = async (id: string) => {
    setBusy(true)
    setError(null)
    try {
      await selectProfile(id)
      navigate('/', { replace: true })
    } catch {
      setError('無法選擇使用者，請再試一次。')
    } finally {
      setBusy(false)
    }
  }

  const onCreate = async () => {
    setNameChecked(true)
    if (nameMissing) return
    setBusy(true)
    setError(null)
    try {
      const profile = await createProfile({ name, color, emoji })
      setAdding(false)
      setName('')
      setNameChecked(false)
      await selectProfile(profile.id)
      navigate('/', { replace: true })
    } catch {
      setError('新增使用者失敗。')
    } finally {
      setBusy(false)
    }
  }

  const onDelete = async (
    id: string,
    profileName: string,
    locked: boolean,
  ) => {
    if (locked) return
    if (
      !window.confirm(
        `確定刪除「${profileName}」？這個使用者的練習進度也會一起刪掉。`,
      )
    ) {
      return
    }
    setBusy(true)
    setError(null)
    try {
      await deleteProfile(id)
    } catch {
      setError('刪除使用者失敗。')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="profile-screen">
      <h1 className="profile-screen__title">誰要來練習？</h1>
      <p className="profile-screen__hint">
        {cloudEnabled
          ? user
            ? '選一個使用者開始；進度會同步到雲端。'
            : '登入 Google 後，換裝置也能接著玩。'
          : '先在這台選使用者練習。設定 Firebase 後即可跨裝置同步。'}
      </p>

      {cloudEnabled && (
        <div className="profile-screen__auth">
          {user ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => signOutUser()}
              disabled={busy}
            >
              登出
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                setError(null)
                try {
                  await signInWithGoogle()
                } catch (err) {
                  const code =
                    err && typeof err === 'object' && 'code' in err
                      ? String((err as { code: unknown }).code)
                      : ''
                  if (code === 'auth/unauthorized-domain') {
                    setError(
                      '此網域未授權：請到 Firebase Authentication → 設定 → 授權網域，加入目前網址的網域。',
                    )
                  } else if (code === 'auth/popup-blocked') {
                    setError('瀏覽器封鎖了登入視窗，請允許彈出視窗後再試。')
                  } else if (code === 'auth/popup-closed-by-user') {
                    setError('登入視窗被關閉，請再試一次。')
                  } else if (code === 'auth/operation-not-allowed') {
                    setError('Firebase 尚未啟用 Google 登入，請到 Console 開啟並儲存。')
                  } else {
                    setError(
                      code
                        ? `Google 登入失敗（${code}）。請確認已啟用 Google，並重新整理後再試。`
                        : 'Google 登入失敗，請確認已在 Firebase 開啟 Google 登入。',
                    )
                  }
                } finally {
                  setBusy(false)
                }
              }}
            >
              用 Google 登入同步
            </button>
          )}
        </div>
      )}

      {(syncError || error) && (
        <p className="profile-screen__error">{error || syncError}</p>
      )}
      {syncing && <p className="profile-screen__hint">同步中…</p>}

      {!adding ? (
        <>
          <div
            className={`profile-grid${managing ? ' profile-grid--managing' : ''}`}
          >
            {profiles.map((p) => {
              const locked = isDefaultProfile(p)
              return (
                <div key={p.id} className="profile-tile-wrap">
                  <div className="profile-avatar-slot">
                    <button
                      type="button"
                      className="profile-avatar"
                      style={{ background: p.color }}
                      disabled={busy || managing}
                      aria-label={`選擇 ${p.name}`}
                      onClick={() => {
                        if (managing) return
                        void onPick(p.id)
                      }}
                    >
                      {p.emoji}
                    </button>
                    {!locked && (
                      <button
                        type="button"
                        className="profile-tile-delete"
                        disabled={busy}
                        aria-label={`刪除 ${p.name}`}
                        onClick={() => void onDelete(p.id, p.name, locked)}
                      >
                        <svg
                          className="profile-tile-delete__icon"
                          viewBox="0 0 10 10"
                          aria-hidden
                        >
                          <path
                            d="M1 1l8 8M9 1L1 9"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    className="profile-name"
                    disabled={busy || managing}
                    onClick={() => {
                      if (managing) return
                      void onPick(p.id)
                    }}
                  >
                    {p.name}
                  </button>
                </div>
              )
            })}
            {!managing && (
              <button
                type="button"
                className="profile-tile profile-tile--add"
                disabled={busy}
                onClick={() => setAdding(true)}
              >
                <span className="profile-avatar profile-avatar--add" aria-hidden>
                  ＋
                </span>
                <span className="profile-name">新增使用者</span>
              </button>
            )}
          </div>
          {canManage && (
            <div className="profile-screen__manage">
              <button
                type="button"
                className="btn btn-ghost"
                disabled={busy}
                onClick={() => setManaging((v) => !v)}
              >
                {managing ? '完成' : '管理'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="profile-editor panel">
          <p className="prompt">幫這位練習生取個名字</p>
          <input
            className={`profile-input${showNameError ? ' profile-input--error' : ''}`}
            value={name}
            maxLength={12}
            placeholder="例如：小明"
            aria-invalid={showNameError}
            onChange={(e) => {
              setName(e.target.value)
              if (e.target.value.trim()) setNameChecked(false)
            }}
            onBlur={() => setNameChecked(true)}
          />
          {showNameError && (
            <p className="profile-input-hint">請先取個名字</p>
          )}
          <p className="muted">選顏色</p>
          <div className="profile-swatches">
            {PROFILE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`profile-swatch${color === c ? ' profile-swatch--on' : ''}`}
                style={{ background: c }}
                aria-label={c}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <p className="muted">選表情</p>
          <div className="profile-swatches">
            {PROFILE_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                className={`profile-emoji-pick${emoji === e ? ' profile-emoji-pick--on' : ''}`}
                onClick={() => setEmoji(e)}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setAdding(false)
                setNameChecked(false)
              }}
              disabled={busy}
            >
              取消
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onCreate}
              disabled={busy}
            >
              完成
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
