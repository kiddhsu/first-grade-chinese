import { useEffect, useState } from 'react'
import {
  dismissRestPrompt,
  shouldShowRestPrompt,
  touchSession,
} from '../lib/progress'

export function RestPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    touchSession()
    const id = window.setInterval(() => {
      setShow(shouldShowRestPrompt(15))
    }, 30000)
    setShow(shouldShowRestPrompt(15))
    return () => window.clearInterval(id)
  }, [])

  if (!show) return null

  return (
    <div className="rest-banner" role="status">
      <strong>休息一下眼睛會更亮！</strong>
      <span className="muted">已經練習一陣子了，喝口水、看看遠方再繼續。</span>
      <div className="actions">
        <button
          type="button"
          className="btn btn-sun"
          onClick={() => {
            dismissRestPrompt(15)
            setShow(false)
          }}
        >
          再玩一會兒
        </button>
      </div>
    </div>
  )
}
