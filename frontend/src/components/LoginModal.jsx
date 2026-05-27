// ═══════════════════════════════════════════════════════════
//  src/components/LoginModal.jsx  — Admin Login Only
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

// Password field component - defined OUTSIDE to prevent remounting
const PwdField = ({ id, label: lbl, value, onChange, show, onToggle, placeholder, autoComplete }) => {
  const fieldWrap = { marginBottom: 13 }
  const labelStyle = {
    display: 'block', fontSize: '0.72rem', fontWeight: 700,
    color: 'var(--muted)', marginBottom: 5, letterSpacing: '0.05em',
    textTransform: 'uppercase',
  }
  const inputWrap = {
    position: 'relative', borderRadius: 10, overflow: 'hidden',
    border: '1.5px solid var(--border)', background: 'var(--bg)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }
  const inputCss = {
    width: '100%', padding: '10px 14px', paddingRight: 44,
    fontSize: '0.9rem', background: 'transparent', border: 'none',
    outline: 'none', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, sans-serif",
  }
  const eyeBtn = {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: 42,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14,
  }

  return (
    <div style={fieldWrap}>
      <label style={labelStyle} htmlFor={id}>{lbl}</label>
      <div style={inputWrap} className="lc-input-wrap">
        <input 
          id={id} 
          type={show ? 'text' : 'password'} 
          value={value}
          onChange={onChange} 
          style={inputCss}
          placeholder={placeholder || '••••••••'}
          autoComplete={autoComplete || 'current-password'} 
        />
        <button 
          type="button" 
          style={eyeBtn} 
          onClick={onToggle}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  )
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { login, adminLogin } = useAuth()

  const [panel, setPanel] = useState('login') // Admin login only
  const [shake, setShake] = useState(false)
  const [msg,   setMsg]   = useState(null)    // { type:'error'|'success', text }

  // ── Login fields ──
  const [loginEmail,    setLoginEmail]    = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPwd,  setShowLoginPwd]  = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)

  const firstRef = useRef(null)

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstRef.current?.focus(), 80)
    } else {
      setPanel('login'); setMsg(null); setShake(false)
      setLoginEmail(''); setLoginPassword(''); setShowLoginPwd(false)
    }
  }, [isOpen])

  const switchPanel = (p) => { setPanel(p); setMsg(null); setShake(false) }

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // ── Submit handlers ──
  const handleLogin = async (e) => {
    e.preventDefault(); setMsg(null)
    setLoginLoading(true)
    try {
      await adminLogin(loginEmail.trim(), loginPassword)
      onClose()
      // Trigger login success which will show dashboard
      if (onLoginSuccess) onLoginSuccess()
    } catch (error) {
      setMsg({ type: 'error', text: error.message || 'Invalid admin credentials.' })
      setShake(true); setTimeout(() => setShake(false), 600)
    } finally {
      setLoginLoading(false)
    }
  }

  if (!isOpen) return null

  /* ── Style helpers ── */
  const overlay = {
    position: 'fixed', inset: 0, zIndex: 9000,
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(7px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px', animation: 'fadeIn 0.2s ease',
  }
  const card = {
    background: 'var(--card)', borderRadius: 22,
    padding: '40px 38px 32px', width: '100%', maxWidth: 430,
    boxShadow: '0 36px 90px rgba(0,0,0,0.3)', position: 'relative',
    animation: shake ? 'lcShake 0.5s ease' : 'lcSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)',
  }
  const badge = {
    width: 50, height: 50, borderRadius: 13,
    background: 'linear-gradient(135deg, #1a6b4a 0%, #2d9e72 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, marginBottom: 14, boxShadow: '0 6px 18px rgba(26,107,74,0.35)',
  }
  const tabRow = {
    display: 'flex', gap: 0, marginBottom: 22,
    background: 'var(--bg)', borderRadius: 10, padding: 4,
  }
  const tabBtn = (active) => ({
    flex: 1, padding: '7px 4px', borderRadius: 7,
    border: 'none', cursor: 'pointer', fontSize: '0.77rem', fontWeight: 600,
    fontFamily: "'DM Sans', system-ui, sans-serif", transition: 'all 0.2s',
    background: active ? 'var(--card)' : 'transparent',
    color: active ? '#1a6b4a' : 'var(--muted)',
    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
  })
  const fieldWrap  = { marginBottom: 13 }
  const labelStyle = {
    display: 'block', fontSize: '0.72rem', fontWeight: 700,
    color: 'var(--muted)', marginBottom: 5, letterSpacing: '0.05em',
    textTransform: 'uppercase',
  }
  const inputWrap = {
    position: 'relative', borderRadius: 10, overflow: 'hidden',
    border: '1.5px solid var(--border)', background: 'var(--bg)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }
  const inputCss = (hasPad) => ({
    width: '100%', padding: '10px 14px', paddingRight: hasPad ? 44 : 14,
    fontSize: '0.9rem', background: 'transparent', border: 'none',
    outline: 'none', color: 'var(--text)', fontFamily: "'DM Sans', system-ui, sans-serif",
  })
  const eyeBtn = {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: 42,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14,
  }
  const msgBox = (type) => ({
    background: type === 'success' ? '#f0fdf4' : '#fef2f2',
    border: `1px solid ${type === 'success' ? '#bbf7d0' : '#fecaca'}`,
    borderRadius: 8, padding: '9px 13px', marginBottom: 13,
    display: 'flex', alignItems: 'center', gap: 7,
    fontSize: '0.81rem', color: type === 'success' ? '#166534' : '#dc2626',
    animation: 'fadeIn 0.2s ease',
  })
  const submitBtn = (loading, disabled) => ({
    width: '100%', padding: '12px', border: 'none', borderRadius: 10,
    cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
    background: (loading || disabled)
      ? 'var(--border)'
      : 'linear-gradient(135deg, #1a6b4a 0%, #2d9e72 100%)',
    color: (loading || disabled) ? 'var(--muted)' : '#fff',
    fontSize: '0.91rem', fontWeight: 600,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    transition: 'opacity 0.2s, transform 0.15s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 4,
    boxShadow: (loading || disabled) ? 'none' : '0 4px 14px rgba(26,107,74,0.32)',
  })
  const linkBtn = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#1a6b4a', fontSize: '0.81rem', fontWeight: 600,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    textDecoration: 'underline', textUnderlineOffset: 2, padding: 0,
  }
  const divider = {
    marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)',
    fontSize: '0.78rem', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.7,
  }

  const panelTitle = { login: 'Admin Login' }

  return (
    <>
      <style>{`
        @keyframes lcSlideUp {
          from { opacity:0; transform:translateY(22px) scale(0.97); }
          to   { opacity:1; transform:none; }
        }
        @keyframes lcShake {
          0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)}
          40%{transform:translateX(7px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)}
        }
        .lc-input-wrap:focus-within {
          border-color: #1a6b4a !important;
          box-shadow: 0 0 0 3px rgba(26,107,74,0.12) !important;
        }
        .lc-submit:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); }
        .lc-close { position:absolute; top:14px; right:14px; width:32px; height:32px;
          border-radius:8px; background:var(--border); border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          font-size:15px; color:var(--muted); transition:background 0.2s; }
        .lc-close:hover { background:var(--border) !important; filter:brightness(0.88); }
      `}</style>

      <div style={overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
        <div style={card}>
          <button className="lc-close" onClick={onClose} aria-label="Close">✕</button>

          <div style={badge}>🌿</div>
          <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:'1.35rem', fontWeight:700, color:'var(--text)', marginBottom:3 }}>
            {panelTitle[panel]}
          </div>
          <div style={{ fontSize:'0.8rem', color:'var(--muted)', marginBottom:20 }}>
            Lakbay Tourism Management System
          </div>

          {/* ── Tab bar ── */}
          <div style={tabRow}>
            <button style={tabBtn(panel==='login')}    onClick={() => switchPanel('login')}>Sign In</button>
          </div>

          {msg && <div style={msgBox(msg.type)}><span>{msg.type==='success'?'✅':'⚠️'}</span> {msg.text}</div>}

          {/* ══ LOGIN PANEL ══ */}
          {panel === 'login' && (
            <form onSubmit={handleLogin} noValidate>
              <div style={fieldWrap}>
                <label style={labelStyle} htmlFor="lc-email">Email Address</label>
                <div style={inputWrap} className="lc-input-wrap">
                  <input id="lc-email" ref={firstRef} type="email"
                    value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                    style={inputCss(false)} placeholder="admin@lakbay.com"
                    autoComplete="username" required />
                </div>
              </div>
              <PwdField id="lc-pwd" label="Password"
                value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                show={showLoginPwd} onToggle={() => setShowLoginPwd(v => !v)} />

              <button type="submit" className="lc-submit"
                style={submitBtn(loginLoading, !loginEmail || !loginPassword)}
                disabled={loginLoading || !loginEmail || !loginPassword}>
                {loginLoading
                  ? <><span style={{animation:'spin 0.8s linear infinite',display:'inline-block'}}>⏳</span> Verifying…</>
                  : <>🔐 Sign In to Admin Dashboard</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
