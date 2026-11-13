import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  dismissRestPrompt,
  shouldShowRestPrompt,
  touchSession,
} from '../lib/progress'

/** 練習多久後提醒休息（分鐘） */
const REST_AFTER_MINUTES = 30

export function RestPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    touchSession()
    const id = window.setInterval(() => {
      setShow(shouldShowRestPrompt(REST_AFTER_MINUTES))
    }, 30000)
    setShow(shouldShowRestPrompt(REST_AFTER_MINUTES))
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!show) return
    const html = document.documentElement
    const body = document.body
    const prevHtml = html.style.overflow
    const prevBody = body.style.overflow
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    return () => {
      html.style.overflow = prevHtml
      body.style.overflow = prevBody
    }
  }, [show])

  if (!show || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="rest-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rest-title"
    >
      <div className="rest-banner">
        <strong id="rest-title">休息一下眼睛會更亮！</strong>
        <span className="muted">
          已經練習一陣子了，喝口水、看看遠方再繼續。
        </span>
        <div className="actions">
          <button
            type="button"
            className="btn btn-sun"
            onClick={() => {
              dismissRestPrompt(REST_AFTER_MINUTES)
              setShow(false)
            }}
          >
            再玩一會兒
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
