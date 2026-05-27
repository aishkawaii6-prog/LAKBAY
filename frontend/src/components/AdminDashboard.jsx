// ═══════════════════════════════════════════════════════════
//  src/components/AdminDashboard.jsx  – Admin Dashboard
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react'
import { storage } from '../hooks/useStorage'
import { useAuth as useAuthContext } from '../context/AuthContext'
import { destinationsAPI, messagesAPI, feedbackAPI, activityLogsAPI, galleryAPI, bookmarksAPI, activitiesAPI, newsAPI } from '../services/api'
import { useToast } from './Toast'

/* ── Category options ── */
const CATEGORIES = ['Waterfall', 'Beach', 'Park', 'Heritage', 'Adventure', 'Cave', 'Other']

/* ── Compress an image File to a base64 data URL that fits in MySQL TEXT (<65KB) ── */
const compressImage = (file) => new Promise((resolve) => {
  const img = new Image()
  const objectUrl = URL.createObjectURL(file)
  img.onload = () => {
    const MAX = 720
    const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
    const w = Math.round(img.width * ratio)
    const h = Math.round(img.height * ratio)
    const canvas = document.createElement('canvas')
    canvas.width  = w
    canvas.height = h
    canvas.getContext('2d').drawImage(img, 0, 0, w, h)
    URL.revokeObjectURL(objectUrl)
    let quality = 0.80
    let dataUrl
    do {
      dataUrl = canvas.toDataURL('image/jpeg', quality)
      quality  = parseFloat((quality - 0.10).toFixed(2))
    } while (dataUrl.length > 60000 && quality >= 0.20)
    resolve(dataUrl)
  }
  img.src = objectUrl
})

/* ── Empty spot form ── */
const emptyForm = () => ({
  name: '', category: 'Waterfall', location: '',
  description: '', history: '', discovery: '',
  coverImage: '', mapUrl: '', featured: false,
  images: [], latitude: null, longitude: null,
})

/* ═══════════════════════════════════════════════════════════
   SpotFormModal  – Add / Edit a location
═══════════════════════════════════════════════════════════ */
function SpotFormModal({ spot, onClose, onSaved, token }) {
  const isEdit = !!spot
  const toast = useToast()
  const [form,    setForm]    = useState(isEdit ? { ...spot } : emptyForm())
  const [errors,  setErrors]  = useState({})
  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [field]: val }))
    if (errors[field]) setErrors(er => { const n = { ...er }; delete n[field]; return n })
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())        e.name        = 'Name is required.'
    if (!form.location.trim())    e.location    = 'Location is required.'
    if (!form.description.trim()) e.description = 'Description is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    const payload = {
      name:        form.name.trim(),
      category:    form.category,
      location:    form.location.trim(),
      description: form.description.trim(),
      coverImage:  form.coverImage || '',
      mapUrl:      form.mapUrl || '',
      featured:    !!form.featured,
      history:     form.history || '',
      discovery:   form.discovery || '',
      images:      Array.isArray(form.images) ? form.images : (form.images ? JSON.parse(form.images) : []),
      latitude:    typeof form.latitude  === 'number' ? form.latitude  : null,
      longitude:   typeof form.longitude === 'number' ? form.longitude : null,
    }

    try {
      if (isEdit) {
        await destinationsAPI.update(token, spot.id, payload)
        storage.updateSpot(spot.id, payload)
      } else {
        const created = await destinationsAPI.create(token, payload)
        storage.addSpot(created)
      }
      setSuccess(true)
      toast.success(isEdit ? 'Location updated!' : 'Location added!', isEdit ? `${payload.name} has been saved.` : `${payload.name} is now listed.`)
      setTimeout(async () => { await onSaved(); onClose() }, 900)
    } catch (err) {
      console.error('Failed to save destination:', err)
      toast.error('Save failed', err.message || 'Please try again.')
    } finally {
      setSaving(false)
    }
  }

  /* ── Styles ── */
  const overlay = {
    position: 'fixed', inset: 0, zIndex: 9500,
    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: '40px 20px', overflowY: 'auto', animation: 'fadeIn 0.2s ease',
  }
  const card = {
    background: 'var(--card)', borderRadius: 18, padding: '32px 34px',
    width: '100%', maxWidth: 560, boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
    position: 'relative', animation: 'lcSlideUp 0.26s cubic-bezier(0.34,1.56,0.64,1)',
    marginBottom: 40,
  }
  const fieldRow = { marginBottom: 16 }
  const labelSt = {
    display: 'block', fontSize: '0.72rem', fontWeight: 700,
    color: 'var(--muted)', marginBottom: 5, letterSpacing: '0.05em',
    textTransform: 'uppercase',
  }
  const inputSt = (hasErr) => ({
    width: '100%', padding: '10px 13px', borderRadius: 9,
    border: `1.5px solid ${hasErr ? '#fca5a5' : 'var(--border)'}`,
    background: 'var(--bg)', color: 'var(--text)',
    fontSize: '0.9rem', fontFamily: "'DM Sans', system-ui, sans-serif",
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  })
  const textareaSt = (hasErr) => ({
    ...inputSt(hasErr),
    minHeight: 88, resize: 'vertical', lineHeight: 1.55,
  })
  const selectSt = {
    width: '100%', padding: '10px 13px', borderRadius: 9,
    border: '1.5px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontSize: '0.9rem',
    fontFamily: "'DM Sans', system-ui, sans-serif", outline: 'none',
    boxSizing: 'border-box',
  }
  const errTxt = { fontSize: '0.75rem', color: '#dc2626', marginTop: 4 }
  const twoCol = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }
  const checkRow = {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22,
    padding: '10px 14px', borderRadius: 9, background: 'var(--bg)',
    border: '1.5px solid var(--border)', cursor: 'pointer',
  }
  const btnRow = { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }
  const cancelBtn = {
    padding: '10px 20px', borderRadius: 9,
    border: '1.5px solid var(--border)', background: 'none',
    color: 'var(--muted)', fontSize: '0.88rem', fontWeight: 600,
    cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif",
  }
  const saveBtn = {
    padding: '10px 24px', borderRadius: 9, border: 'none',
    background: saving || success
      ? (success ? '#166534' : 'var(--border)')
      : 'linear-gradient(135deg, #1a6b4a 0%, #2d9e72 100%)',
    color: saving ? 'var(--muted)' : '#fff',
    fontSize: '0.88rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    boxShadow: '0 3px 12px rgba(26,107,74,0.3)',
    display: 'flex', alignItems: 'center', gap: 7,
    transition: 'background 0.3s',
  }

  return (
    <div style={overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={card}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
          <div>
            <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:'1.25rem', fontWeight:700, color:'var(--text)' }}>
              {isEdit ? '✏️ Edit Location' : '➕ Add New Location'}
            </div>
            <div style={{ fontSize:'0.78rem', color:'var(--muted)', marginTop:2 }}>
              {isEdit ? `Editing: ${spot.name}` : 'Fill in the details for the new tourist spot'}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'var(--border)', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:15, color:'var(--muted)', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>

        {/* Name + Category */}
        <div style={twoCol}>
          <div>
            <label style={labelSt}>Spot Name *</label>
            <input value={form.name} onChange={set('name')} style={inputSt(errors.name)}
              placeholder="e.g. Bangon Falls" />
            {errors.name && <div style={errTxt}>⚠ {errors.name}</div>}
          </div>
          <div>
            <label style={labelSt}>Category</label>
            <select value={form.category} onChange={set('category')} style={selectSt}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Location */}
        <div style={fieldRow}>
          <label style={labelSt}>Location / Address *</label>
          <input value={form.location} onChange={set('location')} style={inputSt(errors.location)}
            placeholder="e.g. Barangay Tinaplacan, Calbayog City, Samar" />
          {errors.location && <div style={errTxt}>⚠ {errors.location}</div>}
        </div>

        {/* Cover Image Upload */}
        <div style={fieldRow}>
          <label style={labelSt}>Cover Image <span style={{ fontWeight:400, textTransform:'none', fontSize:'0.7rem' }}>(optional)</span></label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0]
              if (file) {
                const dataUrl = await compressImage(file)
                setForm(f => ({ ...f, coverImage: dataUrl }))
              }
            }}
            style={{...inputSt(false), padding: '8px'}}
          />
          {form.coverImage && form.coverImage.startsWith('data:') && (
            <div style={{ marginTop: 8 }}>
              <img src={form.coverImage} alt="Preview" style={{ width: 100, height: 'auto', borderRadius: 8, objectFit: 'cover' }} />
              <button type="button" onClick={() => setForm(f => ({ ...f, coverImage: '' }))} style={{ display:'block', marginTop: 4, fontSize:'0.75rem', color:'#dc2626', background:'none', border:'none', cursor:'pointer' }}>Remove</button>
            </div>
          )}
          {form.coverImage && !form.coverImage.startsWith('data:') && (
            <div style={{ marginTop: 8 }}>
              <img src={form.coverImage} alt="Preview" style={{ width: 100, height: 'auto', borderRadius: 8, objectFit: 'cover' }} />
            </div>
          )}
        </div>

        {/* Gallery Images Upload */}
        <div style={fieldRow}>
          <label style={labelSt}>
            Gallery Images <span style={{ fontWeight:400, textTransform:'none', fontSize:'0.7rem' }}>(optional – appears in View Details → Gallery)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={async (e) => {
              const files = Array.from(e.target.files)
              if (!files.length) return
              const compressed = await Promise.all(files.map(f => compressImage(f)))
              setForm(f => ({ ...f, images: [...(Array.isArray(f.images) ? f.images : []), ...compressed] }))
              e.target.value = ''
            }}
            style={{...inputSt(false), padding: '8px'}}
          />
          {Array.isArray(form.images) && form.images.length > 0 && (
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
              {form.images.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '1' }}>
                  <img
                    src={img}
                    alt={`Gallery ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))}
                    style={{
                      position: 'absolute', top: 3, right: 3,
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'rgba(220,38,38,0.85)', border: 'none',
                      color: '#fff', fontSize: 11, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      lineHeight: 1,
                    }}
                    title="Remove image"
                  >✕</button>
                </div>
              ))}
            </div>
          )}
          {Array.isArray(form.images) && form.images.length > 0 && (
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, images: [] }))}
              style={{ marginTop: 6, fontSize: '0.75rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Remove all gallery images
            </button>
          )}
        </div>

        {/* Google Maps URL */}
        <div style={fieldRow}>
          <label style={labelSt}>Google Maps Embed URL <span style={{ fontWeight:400, textTransform:'none', fontSize:'0.7rem' }}>(optional - for directions)</span></label>
          <input value={form.mapUrl || ''} onChange={set('mapUrl')} style={inputSt(false)}
            placeholder="https://www.google.com/maps/embed?pb=..." />
        </div>

        {/* Description */}
        <div style={fieldRow}>
          <label style={labelSt}>Description *</label>
          <textarea value={form.description} onChange={set('description')} style={textareaSt(errors.description)}
            placeholder="Describe the tourist spot…" />
          {errors.description && <div style={errTxt}>⚠ {errors.description}</div>}
        </div>

        {/* History */}
        <div style={fieldRow}>
          <label style={labelSt}>History <span style={{ fontWeight:400, textTransform:'none', fontSize:'0.7rem' }}>(optional)</span></label>
          <textarea value={form.history || ''} onChange={set('history')} style={textareaSt(false)}
            placeholder="Historical background of the spot…" />
        </div>

        {/* Discovery */}
        <div style={fieldRow}>
          <label style={labelSt}>Discovery / How it became known <span style={{ fontWeight:400, textTransform:'none', fontSize:'0.7rem' }}>(optional)</span></label>
          <textarea value={form.discovery || ''} onChange={set('discovery')} style={textareaSt(false)}
            placeholder="How was this place discovered or popularized?…" />
        </div>

        {/* Featured toggle */}
        <label style={checkRow}>
          <input type="checkbox" checked={!!form.featured} onChange={set('featured')}
            style={{ width:18, height:18, accentColor:'#1a6b4a', cursor:'pointer' }} />
          <div>
            <div style={{ fontSize:'0.88rem', fontWeight:600, color:'var(--text)' }}>Mark as Featured</div>
            <div style={{ fontSize:'0.74rem', color:'var(--muted)' }}>Featured spots appear highlighted on the home page</div>
          </div>
        </label>

        {/* Actions */}
        <div style={btnRow}>
          <button style={cancelBtn} onClick={onClose}>Cancel</button>
          <button style={saveBtn} onClick={handleSave} disabled={saving || success}>
            {success
              ? <>✅ Saved!</>
              : saving
              ? <><span style={{ animation:'spin 0.8s linear infinite', display:'inline-block' }}>⏳</span> Saving…</>
              : isEdit ? <>💾 Save Changes</> : <>➕ Add Location</>}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   DeleteConfirmModal
═══════════════════════════════════════════════════════════ */
function DeleteConfirmModal({ spot, onClose, onDeleted, token }) {
  const toast = useToast()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await new Promise(r => setTimeout(r, 400))
    try {
      await destinationsAPI.delete(token, spot.id)
      storage.deleteSpot(spot.id)
      toast.success('Location deleted!', `${spot.name} has been removed.`)
      if (onDeleted) onDeleted()
      onClose()
    } catch (err) {
      console.error('Failed to delete destination:', err)
      toast.error('Delete failed', err.message || 'Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 9600,
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px', animation: 'fadeIn 0.15s ease',
  }

  return (
    <div style={overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background:'var(--card)', borderRadius:16, padding:'30px 32px', maxWidth:380, width:'100%', boxShadow:'0 24px 60px rgba(0,0,0,0.3)', animation:'lcSlideUp 0.22s ease', textAlign:'center' }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🗑️</div>
        <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:'1.1rem', fontWeight:700, color:'var(--text)', marginBottom:8 }}>Delete Location?</div>
        <div style={{ fontSize:'0.84rem', color:'var(--muted)', marginBottom:22, lineHeight:1.6 }}>
          Are you sure you want to delete <strong>{spot.name}</strong>? This cannot be undone.
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          <button onClick={onClose} style={{ padding:'9px 22px', borderRadius:8, border:'1.5px solid var(--border)', background:'none', cursor:'pointer', fontSize:'0.86rem', fontWeight:600, color:'var(--muted)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>Cancel</button>
          <button onClick={handleDelete} disabled={deleting}
            style={{ padding:'9px 22px', borderRadius:8, border:'none', background:'#dc2626', color:'#fff', cursor:deleting?'not-allowed':'pointer', fontSize:'0.86rem', fontWeight:700, fontFamily:"'DM Sans',system-ui,sans-serif", display:'flex', alignItems:'center', gap:6 }}>
            {deleting ? '⏳ Deleting…' : '🗑️ Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Main AdminDashboard
═══════════════════════════════════════════════════════════ */
export default function AdminDashboard({ onExit, refreshSpots }) {
  const { logout, token } = useAuthContext()
  const [activeTab,     setActiveTab]     = useState('overview')
  const [session,       setSession]       = useState(null)
  const [spots,         setSpots]         = useState([])
  const [feedback,      setFeedback]      = useState(() => storage.getFeedback())
  const [messages,      setMessages]      = useState([])
  const [activityLogs,  setActivityLogs]  = useState([])
  const [galleryImages, setGalleryImages] = useState([])
  const [newsItems,     setNewsItems]     = useState([])
  const [eventsList,    setEventsList]    = useState([])
  const [savedBookmarks,setSavedBookmarks]= useState([])
  const [fbOverviewStats, setFbOverviewStats] = useState({ totalReviews: 0, averageRating: 0 })
  const [theme,     setTheme]     = useState(() => storage.getTheme())
  const [collapsed, setCollapsed] = useState(false)
  const [formModal,   setFormModal]   = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)

  /* ── Theme toggle ── */
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    storage.setTheme(newTheme)
  }

  /* ── Load messages ── */
  useEffect(() => {
    let cancelled = false
    const loadFromAPI = async () => {
      if (!token) { setMessages(storage.getMessages()); return }
      try {
        const data = await messagesAPI.getAll(token)
        if (!cancelled) setMessages(data.messages || [])
      } catch {
        if (!cancelled) setMessages(storage.getMessages())
      }
    }
    loadFromAPI()
    return () => { cancelled = true }
  }, [token])

  /* ── Refresh all data ── */
  const refresh = useCallback(async () => {
    const { destinations } = await destinationsAPI.getAll()
    setSpots(destinations)
    setFeedback(storage.getFeedback())
    if (token) {
      try {
        const data = await messagesAPI.getAll(token)
        setMessages(data.messages || [])
      } catch { /* no messages endpoint */ }
    }
    try {
      const stats = await feedbackAPI.overviewStats()
      setFbOverviewStats({
        totalReviews:  stats.totalReviews  || 0,
        averageRating: stats.averageRating || 0,
      })
    } catch {
      const fb  = storage.getFeedback()
      const total = fb.length
      const avg   = total ? fb.reduce((s, f) => s + f.rating, 0) / total : 0
      setFbOverviewStats({ totalReviews: total, averageRating: avg })
    }
    try {
      const data = await activityLogsAPI.getAll(token)
      setActivityLogs(data.activityLogs || [])
    } catch {
      setActivityLogs([])
    }
    if (refreshSpots) refreshSpots()
  }, [refreshSpots, token])

  useEffect(() => {
    let cancelled = false
    refresh().catch(() => { if (!cancelled) setSpots([]) })
    return () => { cancelled = true }
  }, [refresh])

  useEffect(() => {
    try { setSession(JSON.parse(localStorage.getItem('lc_ss') || 'null')) } catch { /* empty */ }
  }, [])

  /* ── Load gallery / news / events / bookmarks ── */
  useEffect(() => {
    let cancelled = false
    const loadAll = async () => {
      try {
        const g = await galleryAPI.getAll()
        if (!cancelled) setGalleryImages(Array.isArray(g.gallery) ? g.gallery : g)
      } catch { /* local fallback */ }

      try {
        const n = await (newsAPI.getAllAdmin?.(token) || newsAPI.getAll?.())
        if (!cancelled) setNewsItems(Array.isArray((n||{}).news) ? n.news : Array.isArray(n) ? n : [])
      } catch { setNewsItems([]) }

      try {
        const a = await activitiesAPI.getAll()
        if (!cancelled) setEventsList(Array.isArray(a.activities) ? a.activities : Array.isArray(a) ? a : [])
      } catch { setEventsList([]) }

      try {
        if (token) {
          const resp = await fetch('http://localhost:5000/api/bookmarks/all', { headers: { Authorization: `Bearer ${token}` } })
          const j = await resp.json()
          if (!cancelled) setSavedBookmarks(Array.isArray(j.bookmarks) ? j.bookmarks : [])
        }
      } catch { setSavedBookmarks([]) }
    }
    loadAll()
    return () => { cancelled = true }
  }, [token])

  const handleLogout = async () => {
    await logout()
    if (onExit) onExit()
  }

  /* ── Derived values ── */
  const totalReviews  = fbOverviewStats.totalReviews
  const avgRating     = fbOverviewStats.averageRating > 0 ? fbOverviewStats.averageRating.toFixed(1) : '–'
  const featuredCount = spots.filter(s => s.featured).length
  const recentFeedback = [...feedback].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6)

  /* ── Shared style helpers ── */
  const navItem = (tab) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 12px', borderRadius: 9,
    cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left',
    fontSize: '0.86rem', fontWeight: 500,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    transition: 'background 0.18s', marginBottom: 2,
    background: activeTab === tab ? 'rgba(255,255,255,0.18)' : 'transparent',
    color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.65)',
  })

  const th = {
    padding: '10px 18px', fontSize: '0.7rem', fontWeight: 700,
    color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em',
    textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--bg)',
  }
  const td = {
    padding: '12px 18px', fontSize: '0.86rem', color: 'var(--text)',
    borderBottom: '1px solid var(--border)', verticalAlign: 'middle',
  }

  const pill = (cat) => {
    const map = {
      Waterfall: ['rgba(59,130,246,0.12)','#2563eb'],
      Beach:     ['rgba(234,179,8,0.12)','#b45309'],
      Park:      ['rgba(34,197,94,0.12)','#15803d'],
      Heritage:  ['rgba(168,85,247,0.12)','#7c3aed'],
      Adventure: ['rgba(239,68,68,0.12)','#b91c1c'],
      Cave:      ['rgba(107,114,128,0.12)','#4b5563'],
    }
    const [bg, color] = map[cat] || ['rgba(26,107,74,0.1)', '#1a6b4a']
    return { display:'inline-flex', alignItems:'center', padding:'2px 10px', borderRadius:20, fontSize:'0.72rem', fontWeight:600, background:bg, color }
  }

  const stars = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n))

  const actionBtn = (color) => ({
    padding: '5px 12px', borderRadius: 7, border: 'none',
    background: `${color}18`, color, cursor: 'pointer',
    fontSize: '0.78rem', fontWeight: 600,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    transition: 'background 0.18s',
  })

  const section = {
    background: 'var(--card)', borderRadius: 14,
    border: '1px solid var(--border)', boxShadow: 'var(--sh-sm)',
    marginBottom: 22, overflow: 'hidden',
  }
  const sectionHead = {
    padding: '16px 20px', borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  }
  const sectionTitle = {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '1rem', fontWeight: 700, color: 'var(--text)',
  }
  const addBtn = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 16px', borderRadius: 8, border: 'none',
    background: 'linear-gradient(135deg, #1a6b4a 0%, #2d9e72 100%)',
    color: '#fff', fontSize: '0.82rem', fontWeight: 700,
    cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif",
    boxShadow: '0 3px 10px rgba(26,107,74,0.3)',
    transition: 'opacity 0.2s',
  }
  const inputSt = (hasErr) => ({
    width: '100%', padding: '10px 13px', borderRadius: 9,
    border: `1.5px solid ${hasErr ? '#fca5a5' : 'var(--border)'}`,
    background: 'var(--bg)', color: 'var(--text)',
    fontSize: '0.9rem', fontFamily: "'DM Sans', system-ui, sans-serif",
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  })
  const textareaSt = (hasErr) => ({ ...inputSt(hasErr), minHeight: 88, resize: 'vertical', lineHeight: 1.55 })
  const labelSt = {
    display: 'block', fontSize: '0.72rem', fontWeight: 700,
    color: 'var(--muted)', marginBottom: 5, letterSpacing: '0.05em', textTransform: 'uppercase',
  }
  const checkRow = {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22,
    padding: '10px 14px', borderRadius: 9, background: 'var(--bg)',
    border: '1.5px solid var(--border)', cursor: 'pointer',
  }

  const tabTitles = {
    overview:      '🏠 Overview',
    spots:         '📍 Manage Locations',
    gallery:       '🖼️ Gallery Management',
    events:        '📅 Events',
    news:          '📰 News & Announcements',
    reviews:       '💬 Reviews',
    messages:      '✉️ Messages',
    bookmarks:     '⭐ Bookmarks / Favorites',
    map:           '🗺️ Map Management',
    logs:          '📋 Activity Logs',
    settings:      '⚙️ Site Settings',
    notifications: '🔔 Notifications',
  }

  const navItems = [
    { id: 'overview',      icon: '🏠',  label: 'Overview'        },
    { id: 'spots',         icon: '📍',  label: 'Manage Locations' },
    { id: 'gallery',       icon: '🖼️',  label: 'Gallery'          },
    { id: 'events',        icon: '📅',  label: 'Events'           },
    { id: 'news',          icon: '📰',  label: 'News'             },
    { id: 'reviews',       icon: '💬',  label: 'Reviews'          },
    { id: 'messages',      icon: '✉️',  label: 'Messages'         },
    { id: 'bookmarks',     icon: '⭐',  label: 'Bookmarks'        },
    { id: 'map',           icon: '🗺️',  label: 'Map Management'   },
    { id: 'logs',          icon: '📋',  label: 'Activity Logs'    },
    { id: 'settings',      icon: '⚙️',  label: 'Site Settings'    },
    { id: 'notifications', icon: '🔔',  label: 'Notifications'    },
  ]

  return (
    <>
      <style>{`
        @keyframes lcSlideUp {
          from { opacity:0; transform:translateY(22px) scale(0.97) }
          to   { opacity:1; transform:none }
        }
        @keyframes fadeIn {
          from { opacity:0 } to { opacity:1 }
        }
        .nav-item:hover    { background:rgba(255,255,255,0.12)!important; color:#fff!important }
        .logout-btn:hover  { background:rgba(255,80,80,0.2)!important; color:#fca5a5!important }
        .back-btn:hover    { background:var(--bg)!important; color:var(--text)!important }
        .add-btn:hover     { opacity:0.88 }
        .action-edit:hover   { background:rgba(48,26,107,0.18)!important }
        .action-delete:hover { background:rgba(220,38,38,0.18)!important }
        .spot-row:hover td { background:var(--bg) }
        tr.spot-row td     { transition:background 0.15s }
        .lc-input-focus:focus { border-color:#1a6b4a!important; box-shadow:0 0 0 3px rgba(26,107,74,0.12)!important; outline:none }
        .collapse-btn { transition:background 0.18s,color 0.18s }
        .collapse-btn:hover { background:rgba(255,255,255,0.12)!important; color:#fff!important }
      `}</style>

      {/* ── Modals ── */}
      {formModal && (
        <SpotFormModal
          spot={formModal.spot}
          onClose={() => setFormModal(null)}
          onSaved={refresh}
          token={token}
        />
      )}
      {deleteModal && (
        <DeleteConfirmModal
          spot={deleteModal}
          token={token}
          onClose={() => setDeleteModal(null)}
          onDeleted={refresh}
        />
      )}

      <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', fontFamily:"'DM Sans',system-ui,sans-serif" }}>

        {/* ── Collapse / Expand toggle ── */}
        <div style={{ position:'fixed', top:12, left: collapsed ? 58 : 240, zIndex:200, transition:'left 0.3s ease' }}>
          <button
            onClick={() => setCollapsed(v => !v)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{ width:30, height:30, borderRadius:'50%', border:'none', background:'rgba(255,255,255,0.2)', color:'#fff', fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.18s', backdropFilter:'blur(4px)' }}
            className="collapse-btn"
          >
            {collapsed ? '◀' : '▶'}
          </button>
        </div>

        {/* ── Sidebar ── */}
        <aside style={{
          width: collapsed ? 58 : 240,
          background: 'linear-gradient(180deg,#0f4a32 0%,#1a6b4a 100%)',
          display:'flex', flexDirection:'column',
          position:'fixed', top:0, left:0, bottom:0, zIndex:100,
          boxShadow:'4px 0 20px rgba(0,0,0,0.18)',
          transition:'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          overflow:'hidden',
        }}>
          <div style={{ padding: collapsed ? '18px 8px' : '26px 18px 18px', borderBottom:'1px solid rgba(255,255,255,0.1)', display:'flex', flexDirection:'column', alignItems: collapsed ? 'center' : undefined }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
              <div style={{ width:36, height:36, borderRadius:9, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>🌿</div>
              {!collapsed && (
                <div>
                  <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:'0.94rem', fontWeight:700, color:'#fff' }}>Lakbay Calbayog</div>
                  <div style={{ fontSize:'0.64rem', color:'rgba(255,255,255,0.5)', letterSpacing:'0.07em' }}>ADMIN DASHBOARD</div>
                </div>
              )}
            </div>
            {session && !collapsed && (
              <div style={{ marginTop:12, background:'rgba(255,255,255,0.1)', borderRadius:8, padding:'8px 11px', display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:30, height:30, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#fff', fontWeight:700, flexShrink:0 }}>
                  {session.name?.[0] ?? 'A'}
                </div>
                <div>
                  <div style={{ fontSize:'0.79rem', color:'#fff', fontWeight:600, lineHeight:1.2 }}>{session.name}</div>
                  <div style={{ fontSize:'0.66rem', color:'rgba(255,255,255,0.5)' }}>{session.role}</div>
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <nav style={{ padding:'14px 10px', flex:1, overflowY:'auto' }}>
              <div style={{ fontSize:'0.63rem', color:'rgba(255,255,255,0.38)', letterSpacing:'0.1em', textTransform:'uppercase', padding:'0 10px', marginBottom:6, marginTop:10 }}>Menu</div>
              {navItems.map(item => (
                <button key={item.id} style={navItem(item.id)} className="nav-item" onClick={() => setActiveTab(item.id)}>
                  <span style={{ fontSize:15 }}>{item.icon}</span> {item.label}
                </button>
              ))}
            </nav>
          )}

          <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
            {!collapsed && (
              <button
                style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:9, cursor:'pointer', border:'none', width:'100%', textAlign:'left', fontSize:'0.85rem', fontWeight:500, fontFamily:"'DM Sans',system-ui,sans-serif", background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.65)', transition:'background 0.18s, color 0.18s' }}
                className="logout-btn"
                onClick={handleLogout}
              >
                <span>🚪</span> Log Out
              </button>
            )}
          </div>
        </aside>

        {/* ── Main ── */}
        <div style={{ marginLeft: collapsed ? 58 : 240, flex:1, display:'flex', flexDirection:'column', minHeight:'100vh', transition:'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)' }}>

          {/* Top bar */}
          <header style={{ background:'var(--card)', borderBottom:'1px solid var(--border)', padding:'0 28px', height:62, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50, boxShadow:'0 1px 0 var(--border)' }}>
            <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:'1.12rem', fontWeight:700, color:'var(--text)' }}>
              {tabTitles[activeTab]}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button
                onClick={toggleTheme}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', width:40, height:40, borderRadius:10, border:'1px solid var(--border)', background:'var(--bg)', cursor:'pointer', fontSize:'1.2rem', transition:'all 0.2s' }}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </header>

          <div style={{ padding:'26px 28px', flex:1, animation:'fadeIn 0.25s ease' }}>

            {/* ══ OVERVIEW ══ */}
            {activeTab === 'overview' && (
              <>
                {/* Welcome Banner */}
                <div style={{ background:'linear-gradient(135deg,#1a6b4a 0%,#0d4c32 100%)', borderRadius:16, padding:'28px 32px', marginBottom:24, color:'#fff', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'relative', zIndex:1 }}>
                    <h2 style={{ fontSize:'1.5rem', fontWeight:700, margin:'0 0 8px', fontFamily:"'Playfair Display',serif" }}>
                      Welcome to Lakbay Calbayog Admin 🚀
                    </h2>
                    <p style={{ margin:0, opacity:0.9, fontSize:'0.95rem' }}>
                      Manage your tourism destinations, track visitor feedback, and grow Calbayog's tourism sector.
                    </p>
                  </div>
                  <div style={{ position:'absolute', right:-20, top:-30, opacity:0.15, fontSize:'8rem', transform:'rotate(-15deg)' }}>🏝️</div>
                </div>

                {/* Stat cards */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:18, marginBottom:28 }}>
                  {[
                    { label:'Total Destinations', value:spots.length,  icon:'📍', gradient:'linear-gradient(135deg,#1a6b4a 0%,#0d4c32 100%)' },
                    { label:'Total Reviews',       value:totalReviews,  icon:'💬', gradient:'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)' },
                    { label:'Average Rating',      value:avgRating,     icon:'⭐', gradient:'linear-gradient(135deg,#10b981 0%,#059669 100%)' },
                    { label:'Featured Spots',      value:featuredCount, icon:'🌟', gradient:'linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)' },
                  ].map(({ label, value, icon, gradient }) => (
                    <div key={label} style={{ background:'var(--card)', borderRadius:16, padding:'22px 24px', border:'1px solid var(--border)', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', position:'relative', overflow:'hidden', transition:'transform 0.2s,box-shadow 0.2s' }}>
                      <div style={{ position:'absolute', top:12, right:12, fontSize:'2rem', opacity:0.15 }}>{icon}</div>
                      <div style={{ width:48, height:48, borderRadius:12, background:gradient, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', marginBottom:16 }}>{icon}</div>
                      <div style={{ fontSize:'2.2rem', fontWeight:800, color:'var(--text)', lineHeight:1.1, marginBottom:6 }}>{value}</div>
                      <div style={{ fontSize:'0.8rem', color:'var(--muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16, marginBottom:28 }}>
                  <div onClick={() => setActiveTab('spots')} style={{ background:'var(--card)', borderRadius:14, padding:'20px 24px', border:'1px solid var(--border)', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', gap:16 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:'rgba(26,107,74,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>📍</div>
                    <div>
                      <div style={{ fontWeight:700, color:'var(--text)', fontSize:'0.95rem' }}>Manage Destinations</div>
                      <div style={{ fontSize:'0.8rem', color:'var(--muted)' }}>Add, edit or remove tourist spots</div>
                    </div>
                  </div>
                  <div onClick={() => setActiveTab('reviews')} style={{ background:'var(--card)', borderRadius:14, padding:'20px 24px', border:'1px solid var(--border)', cursor:'pointer', transition:'all 0.2s', display:'flex', alignItems:'center', gap:16 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:'rgba(245,158,11,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>💬</div>
                    <div>
                      <div style={{ fontWeight:700, color:'var(--text)', fontSize:'0.95rem' }}>View All Reviews</div>
                      <div style={{ fontSize:'0.8rem', color:'var(--muted)' }}>See what visitors are saying</div>
                    </div>
                  </div>
                </div>

                {/* Recent reviews */}
                <div style={section}>
                  <div style={sectionHead}>
                    <div style={sectionTitle}>📝 Recent Reviews</div>
                    <span style={{ fontSize:'0.76rem', color:'var(--muted)' }}>Latest 6 entries</span>
                  </div>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr>
                        <th style={th}>Visitor</th>
                        <th style={th}>Spot</th>
                        <th style={th}>Rating</th>
                        <th style={th}>Comment</th>
                        <th style={th}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentFeedback.length === 0 ? (
                        <tr><td colSpan={5} style={{ ...td, textAlign:'center', color:'var(--muted)', padding:'40px' }}>No reviews yet</td></tr>
                      ) : (
                        recentFeedback.map(fb => (
                          <tr key={fb.id} className="spot-row">
                            <td style={{ ...td, fontWeight:600 }}>{fb.name}</td>
                            <td style={td}>{fb.spotName}</td>
                            <td style={{ ...td, color:'#e8a020', letterSpacing:1 }}>{stars(fb.rating)}</td>
                            <td style={{ ...td, color:'var(--muted)', maxWidth:240 }}>
                              <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{fb.comment || '–'}</div>
                            </td>
                            <td style={{ ...td, color:'var(--muted)' }}>{fb.date}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ══ MANAGE LOCATIONS ══ */}
            {activeTab === 'spots' && (
              <div style={section}>
                <div style={sectionHead}>
                  <div>
                    <div style={sectionTitle}>📍 Manage Locations</div>
                    <div style={{ fontSize:'0.76rem', color:'var(--muted)', marginTop:2 }}>{spots.length} destinations</div>
                  </div>
                  <button style={addBtn} className="add-btn" onClick={() => setFormModal({ spot: null })}>
                    + Add Location
                  </button>
                </div>
                {spots.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'40px', color:'var(--muted)' }}>
                    <div style={{ fontSize:'3rem', marginBottom:16 }}>📍</div>
                    <div style={{ fontSize:'1.1rem', fontWeight:600, marginBottom:8 }}>No locations yet</div>
                    <div style={{ fontSize:'0.85rem' }}>Click "Add Location" to get started.</div>
                  </div>
                ) : (
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <thead>
                        <tr>
                          <th style={th}>Name</th>
                          <th style={th}>Category</th>
                          <th style={th}>Location</th>
                          <th style={th}>Featured</th>
                          <th style={th}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {spots.map(spot => (
                          <tr key={spot.id} className="spot-row">
                            <td style={{ ...td, fontWeight:600 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                {spot.coverImage && (
                                  <img src={spot.coverImage} alt={spot.name} style={{ width:36, height:36, borderRadius:8, objectFit:'cover', flexShrink:0 }} />
                                )}
                                {spot.name}
                              </div>
                            </td>
                            <td style={td}><span style={pill(spot.category)}>{spot.category}</span></td>
                            <td style={{ ...td, color:'var(--muted)', maxWidth:200 }}>
                              <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{spot.location}</div>
                            </td>
                            <td style={td}>
                              {spot.featured
                                ? <span style={{ color:'#e8a020', fontWeight:700, fontSize:'0.82rem' }}>⭐ Yes</span>
                                : <span style={{ color:'var(--muted)', fontSize:'0.82rem' }}>No</span>}
                            </td>
                            <td style={td}>
                              <div style={{ display:'flex', gap:6 }}>
                                <button className="action-edit"   style={actionBtn('#1a6b4a')} onClick={() => setFormModal({ spot })}>Edit</button>
                                <button className="action-delete" style={actionBtn('#dc2626')} onClick={() => setDeleteModal(spot)}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ══ REVIEWS ══ */}
            {activeTab === 'reviews' && (
              <div style={section}>
                <div style={sectionHead}>
                  <div style={sectionTitle}>💬 All Reviews</div>
                  <span style={{ fontSize:'0.76rem', color:'var(--muted)' }}>{feedback.length} total</span>
                </div>
                {feedback.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'40px', color:'var(--muted)' }}>
                    <div style={{ fontSize:'3rem', marginBottom:16 }}>💬</div>
                    <div style={{ fontSize:'1.1rem', fontWeight:600, marginBottom:8 }}>No reviews yet</div>
                    <div style={{ fontSize:'0.85rem' }}>Visitor reviews will appear here.</div>
                  </div>
                ) : (
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr>
                        <th style={th}>Visitor</th>
                        <th style={th}>Spot</th>
                        <th style={th}>Rating</th>
                        <th style={th}>Comment</th>
                        <th style={th}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...feedback].sort((a,b) => new Date(b.date) - new Date(a.date)).map(fb => (
                        <tr key={fb.id} className="spot-row">
                          <td style={{ ...td, fontWeight:600 }}>{fb.name}</td>
                          <td style={td}>{fb.spotName}</td>
                          <td style={{ ...td, color:'#e8a020', letterSpacing:1 }}>{stars(fb.rating)}</td>
                          <td style={{ ...td, color:'var(--muted)', maxWidth:280 }}>
                            <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{fb.comment || '–'}</div>
                          </td>
                          <td style={{ ...td, color:'var(--muted)' }}>{fb.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ══ MESSAGES ══ */}
            {activeTab === 'messages' && (
              <div style={section}>
                <div style={sectionHead}>
                  <div style={sectionTitle}>✉️ Contact Messages</div>
                  <span style={{ fontSize:'0.76rem', color:'var(--muted)' }}>Visitor inquiries and messages</span>
                </div>

                {/* Stats */}
                <div style={{ display:'flex', gap:24, margin:'20px 20px 4px', flexWrap:'wrap' }}>
                  <div style={{ background:'rgba(26,107,74,0.08)', padding:'12px 20px', borderRadius:10, display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ fontSize:'1.5rem' }}>📨</span>
                    <div>
                      <div style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--text)' }}>{messages.length}</div>
                      <div style={{ fontSize:'0.7rem', color:'var(--muted)', textTransform:'uppercase' }}>Total Messages</div>
                    </div>
                  </div>
                  <div style={{ background:'rgba(59,130,246,0.08)', padding:'12px 20px', borderRadius:10, display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ fontSize:'1.5rem' }}>📧</span>
                    <div>
                      <div style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--text)' }}>{messages.filter(m => m.email).length}</div>
                      <div style={{ fontSize:'0.7rem', color:'var(--muted)', textTransform:'uppercase' }}>With Email</div>
                    </div>
                  </div>
                  <div style={{ background:'rgba(168,85,247,0.08)', padding:'12px 20px', borderRadius:10, display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ fontSize:'1.5rem' }}>📱</span>
                    <div>
                      <div style={{ fontSize:'1.3rem', fontWeight:700, color:'var(--text)' }}>{messages.filter(m => m.phone).length}</div>
                      <div style={{ fontSize:'0.7rem', color:'var(--muted)', textTransform:'uppercase' }}>With Phone</div>
                    </div>
                  </div>
                </div>

                {messages.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'40px', color:'var(--muted)' }}>
                    <div style={{ fontSize:'3rem', marginBottom:16 }}>📭</div>
                    <div style={{ fontSize:'1.1rem', fontWeight:600, marginBottom:8 }}>No messages yet</div>
                    <div style={{ fontSize:'0.85rem' }}>Messages from the contact form will appear here</div>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:16, padding:20 }}>
                    {[...messages].sort((a,b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)).map((msg, idx) => (
                      <div key={msg.id || idx} style={{ background:'var(--bg)', borderRadius:12, padding:20, border:'1px solid var(--border)', transition:'all 0.2s' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#1a6b4a,#0d4c32)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:'1.1rem' }}>
                              {(msg.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight:700, color:'var(--text)' }}>{msg.name || 'Unknown'}</div>
                              <div style={{ fontSize:'0.8rem', color:'var(--muted)' }}>{msg.createdAt || msg.date || 'Recently'}</div>
                            </div>
                          </div>
                        </div>

                        <div style={{ marginBottom:12 }}>
                          <span style={{ background:'rgba(59,130,246,0.1)', color:'#2563eb', fontSize:'0.75rem', fontWeight:600, padding:'4px 10px', borderRadius:6, marginRight:8 }}>
                            📧 {msg.email || 'No email'}
                          </span>
                          {msg.phone && (
                            <span style={{ background:'rgba(168,85,247,0.1)', color:'#7c3aed', fontSize:'0.75rem', fontWeight:600, padding:'4px 10px', borderRadius:6 }}>
                              📱 {msg.phone}
                            </span>
                          )}
                        </div>

                        {msg.subject && (
                          <div style={{ fontWeight:600, color:'var(--text)', marginBottom:8, fontSize:'0.95rem' }}>
                            📌 {msg.subject}
                          </div>
                        )}

                        <div style={{ color:'var(--muted)', lineHeight:1.6, fontSize:'0.9rem' }}>
                          {msg.message || msg.comment || 'No message content'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ GALLERY MANAGEMENT ══ */}
            {activeTab === 'gallery' && (
              <div style={section}>
                <div style={sectionHead}>
                  <div>
                    <div style={sectionTitle}>🖼️ Gallery Management</div>
                    <div style={{ fontSize:'0.76rem', color:'var(--muted)', marginTop:2 }}>{galleryImages.length} images</div>
                  </div>
                  <button style={addBtn} className="add-btn" onClick={() => {}}>+ Add Image</button>
                </div>
                {galleryImages.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'40px', color:'var(--muted)' }}>
                    <div style={{ fontSize:'3rem', marginBottom:16 }}>🖼️</div>
                    <div style={{ fontSize:'1.1rem', fontWeight:600, marginBottom:8 }}>No gallery images yet</div>
                    <div style={{ fontSize:'0.85rem' }}>Images attached to destinations appear here automatically.</div>
                  </div>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16, padding:16 }}>
                    {galleryImages.map((img) => (
                      <div key={img.id} style={{ borderRadius:12, overflow:'hidden', border:'1px solid var(--border)', background:'var(--card)', transition:'transform 0.2s,box-shadow 0.2s' }}>
                        <div style={{ height:150, background:'var(--bg)', overflow:'hidden', position:'relative' }}>
                          {img.image_url
                            ? <img src={img.image_url} alt={img.title || 'Gallery'} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                            : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontSize:'2.5rem', color:'var(--border)' }}>🖼️</div>}
                          {img.is_featured && <span style={{ position:'absolute', top:8, right:8, background:'#e8a020', color:'#fff', fontSize:'0.62rem', fontWeight:700, padding:'2px 7px', borderRadius:20, textTransform:'uppercase' }}>Featured</span>}
                        </div>
                        <div style={{ padding:'10px 12px' }}>
                          <div style={{ fontWeight:600, color:'var(--text)', fontSize:'0.85rem', marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{img.title || img.destination_name || 'Untitled'}</div>
                          <div style={{ fontSize:'0.73rem', color:'var(--muted)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{img.destination_name || 'Unassigned'}</div>
                        </div>
                        <div style={{ padding:'0 12px 10px', display:'flex', gap:6 }}>
                          <button style={{ ...actionBtn('#1a6b4a'), flex:1, fontSize:'0.74rem', padding:'4px 8px' }}>Edit</button>
                          <button style={{ ...actionBtn('#dc2626'), flex:1, fontSize:'0.74rem', padding:'4px 8px' }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ EVENTS ══ */}
            {activeTab === 'events' && (
              <div style={section}>
                <div style={sectionHead}>
                  <div>
                    <div style={sectionTitle}>📅 Events & Activities</div>
                    <div style={{ fontSize:'0.76rem', color:'var(--muted)', marginTop:2 }}>{eventsList.length} events</div>
                  </div>
                  <button style={addBtn} className="add-btn" onClick={() => {}}>+ Add Event</button>
                </div>
                {eventsList.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'40px', color:'var(--muted)' }}>
                    <div style={{ fontSize:'3rem', marginBottom:16 }}>📅</div>
                    <div style={{ fontSize:'1.1rem', fontWeight:600, marginBottom:8 }}>No events yet</div>
                    <div style={{ fontSize:'0.85rem' }}>Add attractions and seasonal events to showcase Calbayog.</div>
                  </div>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16, padding:16 }}>
                    {eventsList.map((ev) => (
                      <div key={ev.id} style={{ background:'var(--card)', borderRadius:14, border:'1px solid var(--border)', padding:'18px 20px', boxShadow:'var(--sh-sm)', transition:'transform 0.2s,box-shadow 0.2s' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                          <div style={{ fontSize:'2rem' }}>{ev.icon || '🎉'}</div>
                          <span style={{ background:ev.is_active?'rgba(26,107,74,0.1)':'rgba(220,220,220,0.2)', color:ev.is_active?'#1a6b4a':'var(--muted)', fontSize:'0.68rem', fontWeight:700, padding:'2px 8px', borderRadius:20, textTransform:'uppercase' }}>
                            {ev.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div style={{ fontWeight:700, color:'var(--text)', fontSize:'1rem', marginBottom:4 }}>{ev.name}</div>
                        <div style={{ fontSize:'0.78rem', color:'var(--muted)', marginBottom:8, lineHeight:1.5 }}>{ev.description || 'No description.'}</div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:8, borderTop:'1px solid var(--border)' }}>
                          <span style={{ fontSize:'0.72rem', color:'var(--muted)', textTransform:'uppercase', fontWeight:600 }}>{ev.category || 'General'}</span>
                          <div style={{ display:'flex', gap:6 }}>
                            <button style={{ ...actionBtn('#1a6b4a'), fontSize:'0.74rem', padding:'3px 8px' }}>Edit</button>
                            <button style={{ ...actionBtn('#dc2626'), fontSize:'0.74rem', padding:'3px 8px' }}>Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ NEWS & ANNOUNCEMENTS ══ */}
            {activeTab === 'news' && (
              <div style={section}>
                <div style={sectionHead}>
                  <div>
                    <div style={sectionTitle}>📰 News & Announcements</div>
                    <div style={{ fontSize:'0.76rem', color:'var(--muted)', marginTop:2 }}>{newsItems.length} articles</div>
                  </div>
                  <button style={addBtn} className="add-btn" onClick={() => {}}>+ New Article</button>
                </div>
                {newsItems.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'40px', color:'var(--muted)' }}>
                    <div style={{ fontSize:'3rem', marginBottom:16 }}>📰</div>
                    <div style={{ fontSize:'1.1rem', fontWeight:600, marginBottom:8 }}>No news yet</div>
                    <div style={{ fontSize:'0.85rem' }}>Publish announcements and news updates for visitors.</div>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:16, padding:16 }}>
                    {newsItems.map((item) => (
                      <div key={item.id} style={{ background:'var(--card)', borderRadius:14, border:'1px solid var(--border)', overflow:'hidden', display:'flex', transition:'transform 0.2s,box-shadow 0.2s' }}>
                        <div style={{ width:200, minHeight:120, background:'var(--bg)', flexShrink:0, position:'relative', overflow:'hidden' }}>
                          {item.coverImage || item.image
                            ? <img src={item.coverImage || item.image} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                            : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontSize:'2.5rem' }}>📰</div>}
                          {item.featured && <span style={{ position:'absolute', top:8, left:8, background:'#e8a020', color:'#fff', fontSize:'0.62rem', fontWeight:700, padding:'2px 7px', borderRadius:20 }}>Featured</span>}
                        </div>
                        <div style={{ flex:1, padding:'16px 20px', display:'flex', flexDirection:'column' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                            <span style={{ background:'rgba(59,130,246,0.1)', color:'#2563eb', fontSize:'0.66rem', fontWeight:700, padding:'2px 8px', borderRadius:20, textTransform:'uppercase' }}>{item.category || 'News'}</span>
                            {item.published
                              ? <span style={{ background:'rgba(26,107,74,0.1)', color:'#1a6b4a', fontSize:'0.66rem', fontWeight:700, padding:'2px 8px', borderRadius:20 }}>Published</span>
                              : <span style={{ background:'rgba(220,220,220,0.2)', color:'var(--muted)', fontSize:'0.66rem', fontWeight:700, padding:'2px 8px', borderRadius:20 }}>Draft</span>}
                          </div>
                          <div style={{ fontWeight:700, color:'var(--text)', fontSize:'1.02rem', marginBottom:6 }}>{item.title}</div>
                          <div style={{ fontSize:'0.78rem', color:'var(--muted)', lineHeight:1.55, flex:1, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.excerpt || item.content || ''}</div>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10, paddingTop:10, borderTop:'1px solid var(--border)' }}>
                            <span style={{ fontSize:'0.72rem', color:'var(--muted)' }}>{item.published_at || item.publishedDate || item.createdAt || '–'}</span>
                            <div style={{ display:'flex', gap:6 }}>
                              <button style={{ ...actionBtn('#1a6b4a'), fontSize:'0.74rem', padding:'3px 10px' }}>Edit</button>
                              <button style={{ ...actionBtn('#dc2626'), fontSize:'0.74rem', padding:'3px 10px' }}>Delete</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ BOOKMARKS ══ */}
            {activeTab === 'bookmarks' && (
              <div style={section}>
                <div style={sectionHead}>
                  <div>
                    <div style={sectionTitle}>⭐ Bookmarks & Favorites</div>
                    <div style={{ fontSize:'0.76rem', color:'var(--muted)', marginTop:2 }}>{savedBookmarks.length} saved</div>
                  </div>
                </div>
                {savedBookmarks.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'40px', color:'var(--muted)' }}>
                    <div style={{ fontSize:'3rem', marginBottom:16 }}>⭐</div>
                    <div style={{ fontSize:'1.1rem', fontWeight:600, marginBottom:8 }}>No bookmarks yet</div>
                    <div style={{ fontSize:'0.85rem' }}>When visitors bookmark destinations, they'll appear here.</div>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:16, padding:16 }}>
                    {savedBookmarks.map((bm) => (
                      <div key={bm.id} style={{ background:'var(--card)', borderRadius:14, border:'1px solid var(--border)', padding:'16px 20px', display:'flex', alignItems:'center', gap:16, transition:'transform 0.2s' }}>
                        <div style={{ width:60, height:60, borderRadius:10, overflow:'hidden', flexShrink:0, background:'var(--bg)' }}>
                          {bm.coverImage
                            ? <img src={bm.coverImage} alt={bm.destination_name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                            : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontSize:'1.5rem', color:'var(--border)' }}>📍</div>}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700, color:'var(--text)', fontSize:'0.95rem' }}>{bm.destination_name || 'Unknown destination'}</div>
                          <div style={{ fontSize:'0.76rem', color:'var(--muted)' }}>User ID: {bm.user_id} · {bm.category || ''} · {bm.location || ''}</div>
                        </div>
                        <div style={{ fontSize:'0.72rem', color:'var(--muted)' }}>
                          {bm.notes && <span style={{ color:'#2563eb', fontWeight:600 }}>📝 Note</span>}
                        </div>
                        <button style={{ ...actionBtn('#dc2626'), fontSize:'0.74rem', padding:'4px 10px' }}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ MAP MANAGEMENT ══ */}
            {activeTab === 'map' && (
              <div style={section}>
                <div style={sectionHead}>
                  <div>
                    <div style={sectionTitle}>🗺️ Map Management</div>
                    <div style={{ fontSize:'0.76rem', color:'var(--muted)', marginTop:2 }}>{spots.length} locations plotted</div>
                  </div>
                  <button style={addBtn} className="add-btn" onClick={() => setActiveTab('spots')}>+ Add Location</button>
                </div>
                <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, margin:16, overflow:'hidden', position:'relative' }}>
                  <div style={{ minHeight:400, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12, padding:40 }}>
                    <div style={{ fontSize:'3.5rem', opacity:0.6 }}>🗺️</div>
                    <div style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--text)' }}>Interactive Map</div>
                    <div style={{ fontSize:'0.85rem', color:'var(--muted)', textAlign:'center', maxWidth:360, lineHeight:1.6 }}>
                      Embed your Google Maps iframe in Settings, or point each destination to a Google Maps URL from <em>Manage Locations</em>.
                    </div>
                    <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center', marginTop:8 }}>
                      {spots.filter(s => s.mapUrl).length > 0
                        ? spots.filter(s => s.mapUrl).map(s => (
                            <a key={s.id} href={s.mapUrl} target="_blank" rel="noopener noreferrer" style={{ padding:'6px 14px', borderRadius:8, background:'rgba(26,107,74,0.08)', color:'#1a6b4a', fontSize:'0.8rem', fontWeight:600, textDecoration:'none', border:'1px solid rgba(26,107,74,0.18)' }}>
                              📍 {s.name}
                            </a>
                          ))
                        : <span style={{ fontSize:'0.78rem', color:'var(--muted)' }}>No map URLs set yet. Add one from Manage Locations → Edit.</span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ ACTIVITY LOGS ══ */}
            {activeTab === 'logs' && (
              <div style={section}>
                <div style={sectionHead}>
                  <div style={sectionTitle}>📋 Activity Logs</div>
                  <span style={{ fontSize:'0.76rem', color:'var(--muted)' }}>{activityLogs.length} entries</span>
                </div>
                {activityLogs.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'40px', color:'var(--muted)' }}>
                    <div style={{ fontSize:'3rem', marginBottom:16 }}>📭</div>
                    <div style={{ fontSize:'1.1rem', fontWeight:600, marginBottom:8 }}>No activity logs yet</div>
                    <div style={{ fontSize:'0.85rem' }}>CRUD operations from the dashboard will appear here automatically.</div>
                  </div>
                ) : (
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <thead>
                        <tr>
                          <th style={th}>🕐 Time</th>
                          <th style={th}>👤 User</th>
                          <th style={th}>⚡ Action</th>
                          <th style={th}>📦 Entity</th>
                          <th style={th}>📝 Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...activityLogs]
                          .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
                          .map(log => {
                            const actionColor = { create:'#15803d', update:'#1a6b4a', delete:'#dc2626' }[log.action] || 'var(--muted)'
                            return (
                              <tr key={log.id || log.created_at} className="spot-row">
                                <td style={{ ...td, color:'var(--muted)', fontSize:'0.81rem', whiteSpace:'nowrap' }}>
                                  {new Date(log.created_at || log.date || Date.now()).toLocaleString()}
                                </td>
                                <td style={{ ...td, fontWeight:600 }}>
                                  {log.user_name || log.user_fullname || `User #${log.user_id || '–'}`}
                                </td>
                                <td style={td}>
                                  <span style={{ padding:'2px 8px', borderRadius:20, fontSize:'0.72rem', fontWeight:700, background:`${actionColor}18`, color:actionColor, textTransform:'uppercase' }}>
                                    {log.action}
                                  </span>
                                </td>
                                <td style={{ ...td, fontSize:'0.81rem', textTransform:'capitalize' }}>
                                  {log.entity_type || '–'}
                                </td>
                                <td style={{ ...td, color:'var(--muted)', fontSize:'0.81rem', maxWidth:360 }}>
                                  <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                    {log.description || '–'}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ══ SITE SETTINGS ══ */}
            {activeTab === 'settings' && (
              <div style={section}>
                <div style={sectionHead}>
                  <div>
                    <div style={sectionTitle}>⚙️ Site Settings</div>
                    <div style={{ fontSize:'0.76rem', color:'var(--muted)', marginTop:2 }}>Global CMS configuration</div>
                  </div>
                  <button style={addBtn} className="add-btn" onClick={() => {}}>Save Changes</button>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, padding:20 }}>
                  {/* Site Identity */}
                  <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, padding:'20px 24px', boxShadow:'var(--sh-sm)' }}>
                    <div style={{ fontWeight:700, color:'var(--text)', fontSize:'0.95rem', marginBottom:14 }}>🌐 Site Identity</div>
                    <div style={{ marginBottom:14 }}>
                      <label style={labelSt}>Site Name</label>
                      <input style={inputSt(false)} defaultValue="Lakbay Calbayog" />
                    </div>
                    <div style={{ marginBottom:14 }}>
                      <label style={labelSt}>Tagline</label>
                      <input style={inputSt(false)} defaultValue="Discover the Hidden Gems of Calbayog" />
                    </div>
                    <div>
                      <label style={labelSt}>Site Description</label>
                      <textarea style={textareaSt(false)} defaultValue="Lakbay Calbayog is the official tourism management system showcasing the best tourist destinations in Calbayog City, Samar." rows={3} />
                    </div>
                  </div>

                  {/* Display & Behavior */}
                  <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, padding:'20px 24px', boxShadow:'var(--sh-sm)' }}>
                    <div style={{ fontWeight:700, color:'var(--text)', fontSize:'0.95rem', marginBottom:14 }}>🎨 Display & Behavior</div>
                    <div style={{ marginBottom:14 }}>
                      <label style={labelSt}>Dark Mode <span style={{ fontWeight:400, textTransform:'none', fontSize:'0.7rem' }}>(Default)</span></label>
                      <div style={{ display:'flex', gap:8 }}>
                        <button onClick={() => { setTheme('dark'); document.documentElement.setAttribute('data-theme','dark'); storage.setTheme('dark') }} style={{ flex:1, padding:'8px', borderRadius:8, border:theme==='dark'?'2px solid #1a6b4a':'2px solid var(--border)', background:theme==='dark'?'rgba(26,107,74,0.1)':'transparent', cursor:'pointer', fontSize:'0.84rem', fontWeight:600, color:theme==='dark'?'#1a6b4a':'var(--muted)' }}>🌙 Dark</button>
                        <button onClick={() => { setTheme('light'); document.documentElement.setAttribute('data-theme','light'); storage.setTheme('light') }} style={{ flex:1, padding:'8px', borderRadius:8, border:theme==='light'?'2px solid #1a6b4a':'2px solid var(--border)', background:theme==='light'?'rgba(26,107,74,0.1)':'transparent', cursor:'pointer', fontSize:'0.84rem', fontWeight:600, color:theme==='light'?'#1a6b4a':'var(--muted)' }}>☀️ Light</button>
                      </div>
                    </div>
                    <div style={{ marginBottom:14 }}>
                      <label style={labelSt}>Items per page</label>
                      <input style={inputSt(false)} type="number" defaultValue={10} min={5} max={50} />
                    </div>
                    <div>
                      <label style={labelSt}>Visitor can submit feedback</label>
                      <label style={{ ...checkRow, marginTop:8 }}>
                        <input type="checkbox" defaultChecked style={{ width:18, height:18, accentColor:'#1a6b4a', cursor:'pointer' }} />
                        <span style={{ fontSize:'0.84rem', color:'var(--text)', fontWeight:600 }}>Allow visitors to leave reviews</span>
                      </label>
                    </div>
                  </div>

                  {/* Contacts */}
                  <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, padding:'20px 24px', boxShadow:'var(--sh-sm)', gridColumn:'1 / -1' }}>
                    <div style={{ fontWeight:700, color:'var(--text)', fontSize:'0.95rem', marginBottom:14 }}>📬 Contact Information</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
                      <div>
                        <label style={labelSt}>Contact Email</label>
                        <input style={inputSt(false)} type="email" defaultValue="info@lakbaycalbayog.com" />
                      </div>
                      <div>
                        <label style={labelSt}>Phone</label>
                        <input style={inputSt(false)} defaultValue="+63 55 000 0000" />
                      </div>
                      <div>
                        <label style={labelSt}>Facebook Page URL</label>
                        <input style={inputSt(false)} placeholder="https://facebook.com/..." />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ margin:'0 20px 20px', padding:'14px 18px', background:'rgba(26,107,74,0.06)', border:'1px solid rgba(26,107,74,0.15)', borderRadius:10, fontSize:'0.8rem', color:'var(--muted)' }}>
                  ⚙️ Settings are stored in the browser session here. Connect this panel to a <code style={{ padding:'1px 5px', background:'rgba(0,0,0,0.08)', borderRadius:4 }}>settings</code> table via API for full persistence.
                </div>
              </div>
            )}

            {/* ══ NOTIFICATIONS ══ */}
            {activeTab === 'notifications' && (
              <div style={section}>
                <div style={sectionHead}>
                  <div>
                    <div style={sectionTitle}>🔔 Notifications</div>
                    <div style={{ fontSize:'0.76rem', color:'var(--muted)', marginTop:2 }}>System alerts & announcements</div>
                  </div>
                  <button style={{ ...addBtn, opacity:0.5, cursor:'not-allowed', boxShadow:'none' }} disabled>Mark All Read</button>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:12, padding:20 }}>
                  {[
                    { icon:'✉️', bg:'rgba(59,130,246,0.1)', title:'3 new messages received', sub:'Visitor contact form submissions awaiting reply', badge:'3', badgeColor:'#2563eb', time:null },
                    { icon:'⭐', bg:'rgba(245,158,11,0.1)',  title:'New 5-star review on Bangon Falls', sub:'A visitor just rated a destination 5 stars', badge:null, time:'2 hours ago' },
                    { icon:'📅', bg:'rgba(26,107,74,0.1)',   title:'Upcoming event: Calbayog Festival 2026', sub:'Schedule reminder – starts in 3 days', badge:null, time:'1 day ago' },
                    { icon:'🔒', bg:'rgba(168,85,247,0.1)',  title:'Admin password was reset', sub:'Password recovery was used successfully', badge:null, time:'5 days ago', dim:true },
                  ].map((n, i) => (
                    <div key={i} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 18px', display:'flex', alignItems:'center', gap:14, opacity:n.dim ? 0.66 : 1 }}>
                      <div style={{ width:38, height:38, borderRadius:10, background:n.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>{n.icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, color:'var(--text)', fontSize:'0.88rem' }}>{n.title}</div>
                        <div style={{ fontSize:'0.76rem', color:'var(--muted)' }}>{n.sub}</div>
                      </div>
                      {n.badge && <span style={{ background:n.badgeColor, color:'#fff', fontSize:'0.68rem', fontWeight:700, padding:'2px 9px', borderRadius:20, flexShrink:0 }}>{n.badge}</span>}
                      {n.time  && <span style={{ fontSize:'0.73rem', color:'var(--muted)', flexShrink:0 }}>{n.time}</span>}
                    </div>
                  ))}
                </div>
                <div style={{ margin:'0 20px 20px', padding:'14px 18px', background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.15)', borderRadius:10, fontSize:'0.8rem', color:'var(--muted)' }}>
                  🔔 Notifications are shown as a demo above. Connect to a <code style={{ padding:'1px 5px', background:'rgba(0,0,0,0.08)', borderRadius:4 }}>notifications</code> table via API for real-time alerts.
                </div>
              </div>
            )}

          </div>{/* end padding wrapper */}
        </div>{/* end main */}
      </div>{/* end flex root */}
    </>
  )
}