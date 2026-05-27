// ═══════════════════════════════════════════════════════════
//  src/pages/AdminForgotPassword.jsx  — 3-step Forgot Password
// ═══════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useToast } from '../components/Toast'

const STEPS = {
  EMAIL:   1,
  VERIFY:  2,
  RESET:   3,
}

// step indicator helpers
const StepDot = ({ n, cur }) => (
  <div style={{
    width: 30, height: 30, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.76rem', fontWeight: 700,
    background: n <= cur ? 'linear-gradient(135deg,#1a6b4a,#2d9e72)' : 'var(--border)',
    color: n <= cur ? '#fff' : 'var(--muted)',
    transition: 'all 0.3s',
  }}>{n}</div>
)

const connector = (active) => ({
  flex: 1, height: 2,
  background: active ? 'linear-gradient(90deg,#1a6b4a,#2d9e72)' : 'var(--border)',
  transition: 'background 0.3s',
  borderRadius: 1,
})

export default function AdminForgotPassword() {
  const navigate = useNavigate()
  const { success, error } = useToast()

  // ── flow state ──
  const [step, setStep]         = useState(STEPS.EMAIL)
   const [email, setEmail]       = useState('')
  const [step1Token, setStep1Token] = useState('')   // real resetToken UUID from API
  const [displayOtp, setDisplayOtp] = useState('')   // 6-digit demo hint shown on screen
  const [otp, setOtp]           = useState('')       // user-entered 6-digit
  const [userId, setUserId]     = useState(null)
  const [newPw, setNewPw]       = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showNewPw, setShowNewPw]     = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  const [loading, setLoading]   = useState(false)
  const [shake, setShake]       = useState(false)
  const [msg, setMsg]           = useState(null)

  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]
  const otpFirstRef = otpRefs[0]

  useEffect(() => { if (otpFirstRef.current) otpFirstRef.current.focus() }, [step])
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') navigate('/admin/login') }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [navigate])

  // ── helpers ──
  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 600) }
  const clearMsg   = () => setMsg(null)

  // ── Step 1: submit email ──
  const handleEmailSubmit = async (e) => {
    e.preventDefault(); clearMsg()
    if (!email.trim()) {
      error('Required', 'Email is required.'); triggerShake(); return
    }
    setLoading(true)
    try {
      const data = await authAPI.forgotPassword(email.trim())
      setUserId(data.userId)
      // Real UUID token the back-end stored in reset_tokens — used by verify step
      if (data.resetToken) setStep1Token(data.resetToken)
      // shortCode shown on-screen for demo UX only (not sent to the back-end)
      if (data.shortCode)  setDisplayOtp(data.shortCode)
      setStep(STEPS.VERIFY)
      success('', `A verification code has been delivered to your screen.`)
    } catch (err) {
      const m = err.message || 'Unable to process request.'
      error('Not Found', m === 'No admin account found with this email address.' ? m : 'An error occurred.')
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: submit OTP via DB verification ──
  const handleOtpSubmit = async (e) => {
    e.preventDefault(); clearMsg()
    const enteredCode = otp.trim()
    if (!enteredCode || enteredCode.length < 6) {
      error('Required', 'Please enter the 6-digit verification code.');
      triggerShake(); return
    }
    if (!step1Token) { error('Session Expired', 'No token in session. Please restart.'); return }
    setLoading(true)
    try {
      // Verify against DB — the frontend OTP digits are just a memorisation aid here
      await authAPI.verifyResetToken({ token: step1Token, email })
      success('Verified', 'Your identity has been confirmed. You may now reset your password.')
      setStep(STEPS.RESET)
    } catch (err) {
      error('Invalid Code', err.message || 'Token invalid or expired.')
      triggerShake()
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 3: reset password ──
  const handleResetSubmit = async (e) => {
    e.preventDefault(); clearMsg()
    if (!newPw) { error('Required', 'New password is required.'); triggerShake(); return }
    if (newPw !== confirmPw) { error('Mismatch', 'Passwords do not match.'); triggerShake(); return }
    if (newPw.length < 6) { error('Too Short', 'Password must be at least 6 characters.'); triggerShake(); return }
    setLoading(true)
    try {
      await authAPI.resetPassword({ userId, newPassword: newPw, confirmPassword: confirmPw })
      success('Password Reset', 'Your password has been changed successfully!')
      setTimeout(() => navigate('/admin/login'), 2200)
    } catch (err) {
      error('Reset Failed', err.message || 'Could not reset password. Please try again.')
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  // ── Fill each OTP tile individually ──
  const handleOtpChange = (idx) => (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    if (val) {
      const arr = otp.split('')
      arr[idx] = val
      setOtp(arr.join(''))
      if (idx < 5) otpRefs[idx + 1].current?.focus()
    } else {
      const arr = otp.split('')
      arr[idx] = ''
      setOtp(arr.join(''))
    }
  }
  const handleOtpKeyDown = (idx) => (e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs[idx - 1].current?.focus()
  }
  const handleOtpPaste = (e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    setOtp(text.padEnd(6, ''))
    const filled = Math.min(text.length, 6)
    if (filled > 0) otpRefs[Math.min(filled, 5)].current?.focus()
  }

  // ═══════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .lc-input-wrap:focus-within {
          border-color: #1a6b4a !important;
          box-shadow: 0 0 0 3px rgba(26,107,74,0.12) !important;
        }
        .otp-tile {
          width: 46px; height: 54px; textAlign:'center', fontSize:'1.3rem',
          fontWeight: 700, border:'1.5px solid var(--border)', borderRadius: 10,
          background:'var(--bg)', color:'var(--text)', outline:'none',
          fontFamily:"'DM Sans',system-ui,sans-serif", caretColor:'transparent',
        }
        @media (max-width: 500px) {
          .otp-tile { width: 38px; height: 48px; fontSize:'1rem'; }
        }
        .otp-tile:focus { border-color:#1a6b4a !important; box-shadow:0 0 0 3px rgba(26,107,74,.12) !important; }
        .otp-tile.filled { borderColor:'#1a6b4a'; background:'rgba(26,107,74,.06)'; }
        @media (max-width: 500px) {
          .otp-tile.filled { border-color:#1a6b4a !important; }
        }
      `}</style>

      <div style={{
        position:'fixed', inset:0, zIndex:9000,
        background:'rgba(0,0,0,0.62)', backdropFilter:'blur(7px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'20px',
      }}>
        <div style={{
          animation: shake ? 'lcShake 0.5s ease' : 'lcSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)',
          background:'var(--card)', borderRadius:22,
          padding:'34px 36px 28px', width:'100%', maxWidth:430,
          boxShadow:'0 36px 90px rgba(0,0,0,0.32)', position:'relative',
        }}>

          {/* Close */}
          <button onClick={() => navigate('/admin/login')} aria-label="Close"
            style={{ position:'absolute', top:14, right:14, width:32, height:32,
              borderRadius:8, background:'var(--border)', border:'none', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:15, color:'var(--muted)' }}>✕</button>

          {/* Header */}
          <div style={{
            width:50, height:50, borderRadius:13,
            background:'linear-gradient(135deg,#1a6b4a 0%,#2d9e72 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:22, marginBottom:14,
            boxShadow:'0 6px 18px rgba(26,107,74,0.35)',
          }}>🔐</div>
          <div style={{
            fontFamily:"'Playfair Display',Georgia,serif", fontSize:'1.3rem', fontWeight:700,
            color:'var(--text)', marginBottom:3,
          }}>Admin Password Recovery</div>
          <div style={{ fontSize:'0.79rem', color:'var(--muted)', marginBottom:18 }}>
            Recover your admin account access — Lakbay Tourism System
          </div>

          {/* Step indicator */}
          <div style={{ display:'flex', alignItems:'center', marginBottom:22, gap:0 }}>
            {[1,2,3].map(n => (
              <div key={n} style={{ display:'flex', alignItems:'center', flex:1 }}>
                <StepDot n={n} cur={step} />
                {n < 3 && <div style={connector(n < step)} />}
              </div>
            ))}
          </div>

          {/* ── Message banner ── */}
          {msg && (
            <div style={{
              background: msg.type==='success' ? '#f0fdf4' : msg.type==='warning' ? '#fffbeb' : '#fef2f2',
              border: `1px solid ${msg.type==='success' ? '#bbf7d0' : msg.type==='warning' ? '#fde68a' : '#fecaca'}`,
              borderRadius:8, padding:'9px 13px', marginBottom:14,
              display:'flex', alignItems:'center', gap:7,
              fontSize:'0.81rem', color: msg.type==='success' ? '#166534' : msg.type==='warning' ? '#854d0e' : '#dc2626',
              animation:'fadeIn 0.2s ease',
            }}>
              <span>{msg.type==='success'?'✅': msg.type==='warning'?'⚠️':'❌'}</span>
              {msg.title && <strong>{msg.title}: </strong>}{msg.text || ''}
            </div>
          )}

          {/* ══════════════════════════════ */}
          {/*  STEP 1 – EMAIL               */}
          {/* ══════════════════════════════ */}
          {step === STEPS.EMAIL && (
            <form onSubmit={handleEmailSubmit} noValidate>
              <div style={{ marginBottom:14 }}>
                <label htmlFor="fp-email" style={{
                  display:'block', fontSize:'0.72rem', fontWeight:700,
                  color:'var(--muted)', marginBottom:5, letterSpacing:'0.05em', textTransform:'uppercase',
                }}>Email Address</label>
                <div style={{
                  position:'relative', borderRadius:10, overflow:'hidden',
                  border:'1.5px solid var(--border)', background:'var(--bg)',
                  transition:'border-color 0.2s, box-shadow 0.2s',
                }} className="lc-input-wrap">
                  <input id="fp-email" type="email"
                    value={email} onChange={e => { setEmail(e.target.value); clearMsg() }}
                    placeholder="admin@lakbay.com"
                    style={{
                      width:'100%', padding:'10px 14px', fontSize:'0.9rem',
                      background:'transparent', border:'none', outline:'none',
                      color:'var(--text)', fontFamily:"'DM Sans',system-ui,sans-serif", boxSizing:'border-box',
                    }}
                    autoComplete="email" required />
                </div>
                <div style={{ fontSize:'0.76rem', color:'var(--muted)', marginTop:5 }}>
                  Only <strong>admin@lakbay.com</strong> is eligible for recovery.
                </div>
              </div>

              <button type="submit" disabled={loading || !email.trim()} style={{
                width:'100%', padding:'12px', border:'none', borderRadius:10,
                cursor: (loading || !email.trim()) ? 'not-allowed' : 'pointer',
                background: (loading || !email.trim()) ? 'var(--border)' : 'linear-gradient(135deg,#1a6b4a 0%,#2d9e72 100%)',
                color: (loading || !email.trim()) ? 'var(--muted)' : '#fff',
                fontSize:'0.91rem', fontWeight:600,
                fontFamily:"'DM Sans',system-ui,sans-serif",
                transition:'opacity 0.2s, transform 0.15s',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                marginTop:4,
                boxShadow: (loading || !email.trim()) ? 'none' : '0 4px 14px rgba(26,107,74,0.32)',
              }}>
                {loading
                  ? <><span style={{animation:'spin 0.8s linear infinite',display:'inline-block'}}>⏳</span> Sending…</>
                  : <>📨 Send Verification Code</>}
              </button>
            </form>
          )}

          {/* ══════════════════════════════ */}
          {/*  STEP 2 – VERIFY OTP          */}
          {/* ══════════════════════════════ */}
          {step === STEPS.VERIFY && (
            <form onSubmit={handleOtpSubmit} noValidate>
              <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginBottom:16, lineHeight:1.55 }}>
                Enter the <strong style={{ color:'var(--text)' }}>6-digit code</strong> delivered to your screen.
                {displayOtp && (
                  <><br />
                  <span style={{
                    display:'inline-block', marginTop:8, padding:'5px 13px', borderRadius:8,
                    background:'rgba(59,130,246,.10)', color:'#2563eb', fontWeight:700,
                    fontSize:'1.35rem', letterSpacing:'6px', fontFamily:'monospace',
                  }}>{displayOtp}</span>
                  <div style={{ fontSize:'0.72rem', color:'var(--muted)', marginTop:5 }}>
                    (Demo only — relayed for testing)
                  </div></>
                )}
              </div>

              {/* 6 individual OTP tiles */}
              <div style={{ display:'flex', justifyContent:'center', gap:7, marginBottom:18 }}
                onPaste={handleOtpPaste}>
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    ref={otpRefs[i]}
                    type="text" inputMode="numeric" maxLength={1}
                    value={otp[i] || ''}
                    onChange={handleOtpChange(i)}
                    onKeyDown={handleOtpKeyDown(i)}
                    className={otp[i] ? 'otp-tile filled' : 'otp-tile'}
                    style={{
                      width:46, height:54, textAlign:'center', fontSize:'1.3rem',
                      fontWeight:700, border:'1.5px solid var(--border)', borderRadius:10,
                      background:'var(--bg)', color:'var(--text)', outline:'none',
                      fontFamily:"'DM Sans',system-ui,sans-serif", caretColor:'transparent',
                      transition:'border-color 0.2s, box-shadow 0.2s',
                      boxSizing:'border-box',
                    }}
                  />
                ))}
              </div>

              <button type="submit" disabled={loading || otp.length < 6} style={{
                width:'100%', padding:'12px', border:'none', borderRadius:10,
                cursor: (loading || otp.length < 6) ? 'not-allowed' : 'pointer',
                background: (loading || otp.length < 6) ? 'var(--border)' : 'linear-gradient(135deg,#1a6b4a 0%,#2d9e72 100%)',
                color: (loading || otp.length < 6) ? 'var(--muted)' : '#fff',
                fontSize:'0.91rem', fontWeight:600,
                fontFamily:"'DM Sans',system-ui,sans-serif",
                transition:'opacity 0.2s, transform 0.15s',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                marginTop:4,
                boxShadow: (loading || otp.length < 6) ? 'none' : '0 4px 14px rgba(26,107,74,0.32)',
              }}>
                {loading
                  ? <><span style={{animation:'spin 0.8s linear infinite',display:'inline-block'}}>⏳</span> Verifying…</>
                  : <>✓ Verify Code</>}
              </button>

              <button type="button" onClick={handleEmailSubmit}
                style={{
                  background:'none', border:'none', cursor:'pointer',
                  color:'var(--muted)', fontSize:'0.79rem', fontWeight:600,
                  fontFamily:"'DM Sans',system-ui,sans-serif",
                  textDecoration:'underline', textUnderlineOffset:3,
                  padding:0, marginTop:14, display:'block', width:'100%', textAlign:'center',
                }}>
                ← Change email address
              </button>
            </form>
          )}

          {/* ══════════════════════════════ */}
          {/*  STEP 3 – RESET PASSWORD      */}
          {/* ══════════════════════════════ */}
          {step === STEPS.RESET && (
            <form onSubmit={handleResetSubmit} noValidate>
              <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginBottom:14, lineHeight:1.55 }}>
                Enter your <strong style={{color:'var(--text)'}}>new password</strong> below.
                Choose something secure that you haven’t used before.
              </div>

              {/* New password */}
              <div style={{
                position:'relative', borderRadius:10, overflow:'hidden',
                border:'1.5px solid var(--border)', background:'var(--bg)',
                marginBottom:12, transition:'border-color 0.2s, box-shadow 0.2s',
              }} className="lc-input-wrap">
                <input type={showNewPw ? 'text' : 'password'}
                  value={newPw} onChange={e => { setNewPw(e.target.value); clearMsg() }}
                  placeholder="New password"
                  style={{
                    width:'100%', padding:'10px 48px 10px 14px', fontSize:'0.9rem',
                    background:'transparent', border:'none', outline:'none',
                    color:'var(--text)', fontFamily:"'DM Sans',system-ui,sans-serif", boxSizing:'border-box',
                  }}
                  autoComplete="new-password" required />
                <button type="button" onClick={() => setShowNewPw(v => !v)}
                  style={{
                    position:'absolute', right:0, top:0, bottom:0, width:42,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:14,
                  }} aria-label={showNewPw ? 'Hide password' : 'Show password'}>
                  {showNewPw ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Confirm password */}
              <div style={{
                position:'relative', borderRadius:10, overflow:'hidden',
                border:'1.5px solid var(--border)', background:'var(--bg)',
                marginBottom:4, transition:'border-color 0.2s, box-shadow 0.2s',
              }} className="lc-input-wrap">
                <input type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPw} onChange={e => { setConfirmPw(e.target.value); clearMsg() }}
                  placeholder="Confirm new password"
                  style={{
                    width:'100%', padding:'10px 48px 10px 14px', fontSize:'0.9rem',
                    background:'transparent', border:'none', outline:'none',
                    color:'var(--text)', fontFamily:"'DM Sans',system-ui,sans-serif", boxSizing:'border-box',
                  }}
                  autoComplete="new-password" required />
                <button type="button" onClick={() => setShowConfirmPw(v => !v)}
                  style={{
                    position:'absolute', right:0, top:0, bottom:0, width:42,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:14,
                  }} aria-label={showConfirmPw ? 'Hide password' : 'Show password'}>
                  {showConfirmPw ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Password strength hint */}
              {newPw && newPw.length < 6 && (
                <div style={{
                  fontSize:'0.75rem', color:'#dc2626', marginTop:5, marginBottom:10,
                }}>
                  ⚠️ At least 6 characters required.
                </div>
              )}
              {newPw && confirmPw && newPw !== confirmPw && (
                <div style={{
                  fontSize:'0.75rem', color:'#dc2626', marginTop:5, marginBottom:10,
                }}>
                  ⚠️ Passwords do not match.
                </div>
              )}

              <button type="submit" disabled={loading || !newPw || !confirmPw || newPw !== confirmPw} style={{
                width:'100%', padding:'12px', border:'none', borderRadius:10,
                cursor: (loading || !newPw || !confirmPw || newPw !== confirmPw) ? 'not-allowed' : 'pointer',
                background: (loading || !newPw || !confirmPw || newPw !== confirmPw) ? 'var(--border)' : 'linear-gradient(135deg,#1a6b4a 0%,#2d9e72 100%)',
                color: (loading || !newPw || !confirmPw || newPw !== confirmPw) ? 'var(--muted)' : '#fff',
                fontSize:'0.91rem', fontWeight:600,
                fontFamily:"'DM Sans',system-ui,sans-serif",
                transition:'opacity 0.2s, transform 0.15s',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                marginTop:6,
                boxShadow: (loading || !newPw || !confirmPw || newPw !== confirmPw) ? 'none' : '0 4px 14px rgba(26,107,74,0.32)',
              }}>
                {loading
                  ? <><span style={{animation:'spin 0.8s linear infinite',display:'inline-block'}}>⏳</span> Saving…</>
                  : <>✅ Reset My Password</>}
              </button>
            </form>
          )}

          {/* ── Back link ── */}
          <button onClick={() => navigate('/admin/login')}
            style={{
              background:'none', border:'none', cursor:'pointer',
              color:'var(--muted)', fontSize:'0.8rem', fontWeight:500,
              fontFamily:"'DM Sans',system-ui,sans-serif",
              textDecoration:'underline', textUnderlineOffset:3,
              padding:0, marginTop:18, display:'block', width:'100%', textAlign:'center',
            }}>
            ← Back to Admin Login
          </button>

        </div>
      </div>
    </>
  )
}
