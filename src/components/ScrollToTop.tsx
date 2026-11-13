import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** 換頁／進關卡時滾回頂部，避免停在上一頁的捲動位置 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}
