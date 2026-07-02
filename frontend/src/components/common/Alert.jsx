import { useEffect } from 'react'
import { useApp } from '../../context/AppContext'

export default function Alert({ type = 'error', message, onClose }) {
  const { clearMessage } = useApp()

  useEffect(() => {
    if (!message) return undefined

    const timer = window.setTimeout(() => {
      onClose?.()
      clearMessage()
    }, 4500)

    return () => window.clearTimeout(timer)
  }, [message, onClose, clearMessage])

  if (!message) return null

  return (
    <div className={`alert ${type}`} role="alert">
      <span>{message}</span>
      <button type="button" className="alert-close" onClick={onClose} aria-label="Dismiss">
        ×
      </button>
    </div>
  )
}
