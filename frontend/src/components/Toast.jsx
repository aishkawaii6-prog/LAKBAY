// src/components/Toast.jsx — all styles inlined

import { useState, useCallback, createContext, useContext } from 'react'

const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }

const BORDER_COLORS = { success: '#22c55e', error: '#e53e3e', warning: '#e8a020', info: '#3b82f6' }

function ToastItem({ id, type, title, message, onRemove }) {
  const toastStyle = {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 17px', borderRadius: 13,
    background: 'var(--card)', boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
    border: '1px solid var(--border)', borderLeft: `3px solid ${BORDER_COLORS[type]}`,
    minWidth: 270, maxWidth: 340, pointerEvents: 'all',
    animation: 'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
  }

  return (
    <div style={toastStyle} role="alert" aria-live="assertive">
      <span style={{ fontSize: 18, flexShrink: 0 }}>{ICONS[type] || 'ℹ️'}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text)' }}>{title}</div>
        {message && <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 1 }}>{message}</div>}
      </div>
      <button
        style={{ color: 'var(--subtle)', fontSize: 15, cursor: 'pointer', padding: 2, background: 'none', border: 'none', lineHeight: 1 }}
        onClick={() => onRemove(id)}
        aria-label="Close notification"
      >✕</button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((type, title, message = '', duration = 4200) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, type, title, message }])
    if (duration > 0) setTimeout(() => removeToast(id), duration)
  }, [removeToast])

  const toast = {
    success: (title, msg) => addToast('success', title, msg),
    error:   (title, msg) => addToast('error',   title, msg),
    warning: (title, msg) => addToast('warning', title, msg),
    info:    (title, msg) => addToast('info',     title, msg),
  }

  const wrapStyle = {
    position: 'fixed', bottom: 26, right: 26, zIndex: 9999,
    display: 'flex', flexDirection: 'column', gap: 9, pointerEvents: 'none',
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={wrapStyle} aria-live="polite" aria-label="Notifications">
        {toasts.map(t => (
          <ToastItem key={t.id} {...t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
