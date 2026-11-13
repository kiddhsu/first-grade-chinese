import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthProfile } from '../context/AuthProfileContext'
import {
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
  } = useAuthProfile()

  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(PROFILE_COLORS[0])
  const [emoji, setEmoji] = useState<string>(PROFILE_EMOJIS[0])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    setBusy(true)
    setError(null)
    try {
      const profile = await createProfile({ name, color, emoji })
      setAdding(false)
      setName('')
      await selectProfile(profile.id)
      navigate('/', { replace: true })
    } catch {
      setError('新增使用者失敗。')
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
        <div className="profile-grid">
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              className="profile-tile"
              disabled={busy}
              onClick={() => onPick(p.id)}
            >
              <span
                className="profile-avatar"
                style={{ background: p.color }}
                aria-hidden
              >
                {p.emoji}
              </span>
              <span className="profile-name">{p.name}</span>
            </button>
          ))}
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
        </div>
      ) : (
        <div className="profile-editor panel">
          <p className="prompt">幫這位練習生取個名字</p>
          <input
            className="profile-input"
            value={name}
            maxLength={12}
            placeholder="例如：小明"
            onChange={(e) => setName(e.target.value)}
          />
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
              onClick={() => setAdding(false)}
              disabled={busy}
            >
              取消
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onCreate}
              disabled={busy || !name.trim()}
            >
              完成
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
