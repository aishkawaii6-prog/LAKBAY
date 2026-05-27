// src/components/SpotModal.jsx — all styles inlined

import { useState, useEffect, useRef } from 'react'
import { feedbackAPI, destinationsAPI } from '../services/api'
import { storage } from '../hooks/useStorage'

const FALLBACK = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=70'

function renderStars(r) {
  const n = Math.round(+r)
  return '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n))
}

function formatDate(d) {
  try { return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) }
  catch { return d }
}

const s = {
  panelHd: {
    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: '#1a6b4a', paddingBottom: 9, borderBottom: '1px solid var(--border)', marginBottom: 15,
  },
  panelSec: { marginBottom: 28, animation: 'fadeIn 0.3s ease' },
  p: { color: 'var(--muted)', lineHeight: 1.82, marginBottom: 14, fontSize: '0.93rem' },
}

function OverviewPanel({ spot }) {
  return (
    <div style={s.panelSec}>
      <div style={s.panelHd}>About</div>
      <p style={s.p}>{spot.description}</p>
    </div>
  )
}

function HistoryPanel({ spot }) {
  return (
    <>
      <div style={s.panelSec}>
        <div style={s.panelHd}>Historical Background</div>
        <p style={s.p}>{spot.history}</p>
      </div>
      <div style={s.panelSec}>
        <div style={s.panelHd}>How It Was Discovered</div>
        <p style={s.p}>{spot.discovery}</p>
      </div>
    </>
  )
}

function LocationPanel({ spot }) {
  const [mapError, setMapError] = useState(false)
  const [mapLoading, setMapLoading] = useState(true)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    // Treat database defaults (0, 0) as "no coordinates set"
    const hasCoords = spot.latitude && spot.longitude && spot.latitude !== 0 && spot.longitude !== 0
    if (!hasCoords) {
      setMapError(false)
      setMapLoading(false)
      return
    }

    setMapError(false)
    setMapLoading(true)

    const initMap = () => {
      if (!mapRef.current || mapInstanceRef.current) { setMapLoading(false); return }

      const position = { lat: spot.latitude, lng: spot.longitude }

      try {
        const map = new google.maps.Map(mapRef.current, {
          center: position,
          zoom: 17,
          mapTypeId: google.maps.MapTypeId.SATELLITE,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.TOP_RIGHT,
            mapTypeIds: [google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN]
          },
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
            style: google.maps.ZoomControlStyle.LARGE
          },
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: 'greedy',
          draggableCursor: 'grab',
          draggingCursor: 'grab'
        })

        new google.maps.Marker({
          position,
          map,
          title: spot.name,
          animation: google.maps.Animation.DROP
        })

        mapInstanceRef.current = map
      } catch {
        setMapError(true)
      }
      setMapLoading(false)
    }

    // If Google Maps already loaded, init immediately
    if (window.google && window.google.maps) {
      initMap()
      return
    }

    // If script is loading, wait for it
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      existingScript.addEventListener('load', initMap)
      return () => existingScript.removeEventListener('load', initMap)
    }

    // Load Google Maps script
    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!API_KEY) { setMapError(true); setMapLoading(false); return }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`
    script.async = true
    script.onerror = () => { setMapError(true); setMapLoading(false) }
    script.onload = () => { initMap() }
    document.head.appendChild(script)

    return () => {
      if (markerRef.current) markerRef.current.setMap(null)
    }
  }, [spot])

  const hasCoords = spot.latitude && spot.longitude && spot.latitude !== 0 && spot.longitude !== 0
  const searchHref = spot.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spot.name}, ${spot.location}`)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name)}`

  return (
    <div style={s.panelSec}>
      <div style={s.panelHd}>Location &amp; Directions</div>
      <p style={{ ...s.p, marginBottom: 16 }}>📍 {spot.location || 'Location not specified.'}</p>

      {/* Map error banner — shown when coordinates invalid or Google Maps failed to load */}
      {!hasCoords || mapError ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 14,
          fontSize: '0.82rem', color: '#78350f', lineHeight: 1.5,
        }}>
          <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>⚠️</span>
          <span>This destination does not have accurate map coordinates set yet. Open the map directly or ask the admin to add precise coordinates in <strong>Manage Locations</strong>.</span>
        </div>
      ) : null}

      {/* Map iframe — only rendered when we have valid coordinates */}
      {hasCoords && !mapError ? (
        <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16, height: 350, position: 'relative' }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          {mapLoading && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(255,255,255,0.8)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 5,
            }}>
              <div style={{ fontSize: '1.5rem', opacity: 0.5 }}>🗺️</div>
            </div>
          )}
        </div>
      ) : null}

      <a
        href={spot.mapUrl || (hasCoords
          ? `https://www.google.com/maps?q=${spot.latitude},${spot.longitude}&z=17`
          : searchHref)}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#1a6b4a', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
      >
        📍 Open in Google Maps
      </a>
    </div>
  )
}

function GalleryPanel({ spot }) {
  const imgs = (spot.images || [spot.coverImage]).filter(Boolean)
  const [selectedImg, setSelectedImg] = useState(null)
  
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 11 }}>
        {imgs.map((img, i) => (
          <div 
            key={i} 
            style={{ borderRadius: 10, overflow: 'hidden', aspectRatio: '1', cursor: 'zoom-in', transition: 'transform 0.25s' }}
            onClick={() => setSelectedImg(img)}
          >
            <img src={img} alt={`${spot.name} photo ${i + 1}`} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.currentTarget.parentElement.style.display = 'none' }} />
          </div>
        ))}
      </div>
      
      {/* Lightbox Modal */}
      {selectedImg && (
        <div 
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            cursor: 'zoom-out'
          }}
          onClick={() => setSelectedImg(null)}
        >
          <button 
            onClick={() => setSelectedImg(null)}
            style={{
              position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.2)',
              border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer',
              color: '#fff', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            ✕
          </button>
          <img 
            src={selectedImg} 
            alt={spot.name}
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: 8 }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}

function ReviewsPanel({ spot, avg, onClose }) {
  const [name,    setName]    = useState('')
  const [rating,  setRating]  = useState(0)
  const [comment, setComment] = useState('')
  const [error,   setError]   = useState('')
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch reviews for this destination from the backend on mount / spot change
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    feedbackAPI.getByDestination(spot.id)
      .then(data => {
        if (!cancelled) {
          setReviews(data.feedback || [])
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Fallback: merge localStorage reviews matching this spot
          setReviews(storage.getFbFor(spot.id))
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [spot?.id])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !rating || !comment.trim()) {
      setError('Please fill in all fields and select a rating.'); return
    }
    setError('')

    const newEntry = {
      spot_id:   spot.id,
      spot_name: spot.name,
      name:      name.trim(),
      rating,
      comment:   comment.trim(),
      date:      new Date().toISOString().split('T')[0],
    }

    const token = localStorage.getItem('token') || null

    // Always try to save feedback via API first
    feedbackAPI.create(token, newEntry)
      .then(async () => {
        // Update destination average rating — only if we have an admin token
        if (token) {
          try { await destinationsAPI.rate(token, spot.id, rating) }
          catch (rateErr) { console.warn('Could not update destination rating:', rateErr.message) }
        }
        // Re-fetch reviews from DB to reflect the new entry
        const [{ feedback: updated } = {}] = await Promise.all([
          feedbackAPI.getByDestination(spot.id),
        ])
        setReviews(updated || [])
        setName(''); setRating(0); setComment(''); setError('')
      })
      .catch(async () => {
        // API failed — fall back to localStorage
        const entry = storage.addFeedback({
          spotId: spot.id, spotName: spot.name,
          name: name.trim(), rating, comment: comment.trim(),
        })
        // Read-back from storage so the displayed entry is the saved one
        const fromStorage = storage.getFbFor(spot.id)
        setReviews(fromStorage.length ? fromStorage : [entry])
        setName(''); setRating(0); setComment(''); setError('')
      })
  }

  const inStyle = {
    width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)',
    borderRadius: 9, background: 'var(--bg)', color: 'var(--text)',
    fontSize: '0.875rem', transition: 'border-color 0.22s',
    fontFamily: "'DM Sans', system-ui, sans-serif", outline: 'none',
  }

  return (
    <>
      <div style={s.panelSec}>
        <div style={s.panelHd}>Leave a Review</div>
        {error && <div style={{ marginBottom: 12, background: 'rgba(229,62,62,0.1)', color: '#c53030', fontSize: '0.83rem', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(229,62,62,0.25)' }} role="alert">{error}</div>}
        <form style={{ display: 'flex', flexDirection: 'column', gap: 15 }} onSubmit={handleSubmit} noValidate>
          <div>
            <label style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 5 }} htmlFor="fbName">Your Name *</label>
            <input style={inStyle} id="fbName" type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 5 }}>Rating *</label>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 5 }} role="group" aria-label="Select rating">
              {[5,4,3,2,1].map(n => (
                <button key={n} type="button"
                  style={{ fontSize: 28, color: rating >= n ? '#e8a020' : 'var(--border)', cursor: 'pointer', transition: 'color 0.15s', lineHeight: 1, background: 'none', border: 'none', padding: 0 }}
                  onClick={() => setRating(n)} aria-label={`${n} star${n>1?'s':''}`} aria-pressed={rating===n}>★</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 5 }} htmlFor="fbComment">Your Experience *</label>
            <textarea style={{ ...inStyle, resize: 'vertical', minHeight: 88 }} id="fbComment" rows={3} placeholder="Share your experience…" value={comment} onChange={e => setComment(e.target.value)} required />
          </div>
          <button type="submit" style={{ padding: '11px 26px', borderRadius: 9, background: '#1a6b4a', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.22s', alignSelf: 'flex-start', fontFamily: "'DM Sans', system-ui, sans-serif", border: 'none' }}>Submit Review</button>
        </form>
      </div>
      <div style={s.panelSec}>
        <div style={s.panelHd}>Visitor Reviews {`${typeof avg === 'number' && avg > 0 ? `· ★ ${avg}` : ''} (${reviews.length})`}</div>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 30, fontSize: '0.9rem' }}>Loading reviews…</div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 30, fontSize: '0.9rem' }}>No reviews yet — be the first!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {reviews.map(f => (
              <div key={f.id} style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>{f.name || f.user_name || 'Anonymous'}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--subtle)' }}>{f.date ? formatDate(f.date) : ''}</span>
                </div>
                <div style={{ color: '#e8a020', fontSize: '0.85rem', marginBottom: 5 }}>{renderStars(f.rating || f.rating_average || 0)}</div>
                <div style={{ fontSize: '0.855rem', color: 'var(--muted)', lineHeight: 1.62 }}>{f.comment}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'history',  label: 'History'  },
  { key: 'location', label: 'Location' },
  { key: 'gallery',  label: 'Gallery'  },
  { key: 'reviews',  label: 'Reviews'  },
]

export default function SpotModal({ spot, avg, onClose }) {
  const [activeTab, setActiveTab] = useState('overview')
  const modalRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => { setActiveTab('overview') }, [spot?.id])

  if (!spot) return null

  const reviewLabel = (avg && Number(avg) > 0)
    ? `★ ${avg}`
    : 'No ratings yet'

  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 2000,
    background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(12px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  }

  const modalStyle = {
    background: 'var(--card)', borderRadius: 22, width: '100%', maxWidth: 860,
    maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
    scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent',
  }

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-labelledby="mod-name"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={modalStyle} ref={modalRef}>
        <div style={{ position: 'relative', height: 310, overflow: 'hidden' }}>
          <img src={spot.coverImage || spot.images?.[0] || FALLBACK} alt={spot.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.currentTarget.src = FALLBACK }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)' }} aria-hidden="true" />
          <button onClick={onClose} aria-label="Close modal"
            style={{ position: 'absolute', top: 14, right: 14, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(6px)', transition: 'all 0.2s', border: 'none' }}>✕</button>
        </div>

        <div style={{ padding: '28px 34px 34px' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
            <span style={{ background: 'rgba(26,107,74,0.1)', color: '#1a6b4a', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '3px 10px', borderRadius: 6 }}>{spot.category}</span>
            <span style={{ background: 'rgba(232,160,32,0.12)', color: '#996b00', fontSize: '0.82rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6 }}>{reviewLabel}</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.4rem,3vw,2rem)', marginBottom: 6, color: 'var(--text)' }} id="mod-name">{spot.name}</h2>
          <p style={{ fontSize: '0.87rem', color: 'var(--muted)', marginBottom: 24 }}>📍 {spot.location}</p>

          <div style={{ display: 'flex', gap: 2, borderBottom: '2px solid var(--border)', marginBottom: 24 }} role="tablist">
            {TABS.map(tab => (
              <button key={tab.key}
                style={{ padding: '9px 20px', fontSize: '0.875rem', fontWeight: 600, borderRadius: '8px 8px 0 0', cursor: 'pointer', transition: 'all 0.22s', border: 'none', background: 'none', fontFamily: "'DM Sans', system-ui, sans-serif", borderBottom: `2px solid ${activeTab === tab.key ? '#1a6b4a' : 'transparent'}`, marginBottom: -2, color: activeTab === tab.key ? '#1a6b4a' : 'var(--muted)' }}
                role="tab" aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>

          <div role="tabpanel">
            {activeTab === 'overview' && <OverviewPanel spot={spot} />}
            {activeTab === 'history'  && <HistoryPanel  spot={spot} />}
            {activeTab === 'location' && <LocationPanel spot={spot} />}
            {activeTab === 'gallery'  && <GalleryPanel  spot={spot} />}
            {activeTab === 'reviews'  && <ReviewsPanel spot={spot} avg={avg} />}
          </div>
        </div>
      </div>
    </div>
  )
}
