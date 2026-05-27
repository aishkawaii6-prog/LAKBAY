// src/components/DestinationsSection.jsx — all styles inlined

import { useState, useMemo, useEffect, useCallback } from 'react'
import SpotCard from './SpotCard'
import MapComponent from './MapComponent'
import { feedbackAPI } from '../services/api'
import { storage } from '../hooks/useStorage'

export default function DestinationsSection({ spots, onViewDetails }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchTerm,     setSearchTerm]     = useState('')
  const [showMap, setShowMap] = useState(false)
  const [dbRatingMap, setDbRatingMap] = useState({})   // { [spotId]: avg }
  const [dbCountMap,  setDbCountMap]  = useState({})   // { [spotId]: count }

  // Load DB-backed average+count for each destination so home-page cards reflect DB data
  useEffect(() => {
    let cancelled = false
    feedbackAPI.overviewStatsByDestination()
      .then(data => {
        if (cancelled || !data?.destinations) return
        const avgMap = {}
        const cntMap = {}
        ;(data.destinations || []).forEach(d => {
          const key = String(d.id)
          avgMap[key] = d.averageRating || d.rating_average || 0
          cntMap[key] = d.reviewCount || 0
        })
        setDbRatingMap(avgMap)
        setDbCountMap(cntMap)
      })
      .catch(() => { /* leave maps empty — localStorage fallback still works */ })
    return () => { cancelled = true }
  }, [])

  const avgFor = useCallback((id) => {
    const db = dbRatingMap[String(id)]
    if (db && Number(db) > 0) return db
    return storage.getAvg(id)
  }, [dbRatingMap])

  const cntFor = useCallback((id) => {
    const db = dbCountMap[String(id)]
    if (db > 0) return db
    return storage.getFbFor(id).length
  }, [dbCountMap])

  const categories = useMemo(() => ['All', ...new Set(spots.map(s => s.category))], [spots])

  const filtered = useMemo(() => {
    let list = spots
    if (activeCategory !== 'All') list = list.filter(s => s.category === activeCategory)
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q)
      )
    }
    return list
  }, [spots, activeCategory, searchTerm])

  const secStyle = { padding: '76px 0 104px' }

  const containerStyle = { maxWidth: 1280, margin: '0 auto', padding: '0 40px' }

  const hdrStyle = {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    gap: 20, flexWrap: 'wrap', marginBottom: 24,
  }

  const tagPillStyle = {
    display: 'inline-block', fontSize: '0.7rem', fontWeight: 700,
    letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1a6b4a',
    background: 'rgba(26,107,74,0.09)', padding: '4px 14px',
    borderRadius: 50, marginBottom: 8,
  }

  const secTitleStyle = {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 'clamp(1.65rem, 3vw, 2.4rem)',
    fontWeight: 700, color: 'var(--text)', lineHeight: 1.1,
  }

  const searchWrapStyle = { position: 'relative' }

  const searchInStyle = {
    padding: '10px 14px 10px 37px', border: '1.5px solid var(--border)',
    borderRadius: 11, background: 'var(--card)', color: 'var(--text)',
    fontSize: '0.875rem', width: 220, transition: 'all 0.25s', outline: 'none',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  }

  const filterRowStyle = {
    display: 'flex', alignItems: 'center', gap: 8,
    flexWrap: 'wrap', marginBottom: 36,
  }

  const filterLblStyle = {
    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: '#9ca3af', marginRight: 4,
  }

  const fbtnBase = {
    padding: '7px 17px', borderRadius: 50, border: '1.5px solid var(--border)',
    background: 'var(--card)', color: 'var(--muted)', fontSize: '0.8rem',
    fontWeight: 600, cursor: 'pointer', transition: 'all 0.22s',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  }

  const mapBtnStyle = {
    ...fbtnBase,
    background: '#1a6b4a',
    color: 'white',
    borderColor: '#1a6b4a',
    marginLeft: 'auto'
  }

  const fbtnActive = {
    ...fbtnBase,
    borderColor: '#1a6b4a', color: '#1a6b4a',
    background: 'rgba(26,107,74,0.07)',
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 28,
  }

  const emptyStyle = {
    gridColumn: '1 / -1', textAlign: 'center',
    padding: '72px 20px', color: 'var(--muted)',
  }

  return (
    <section id="destinations" style={secStyle} aria-labelledby="dest-heading">
      <div style={containerStyle}>
        <div style={hdrStyle}>
          <div>
            <div style={tagPillStyle}>📍 All Destinations</div>
            <h2 style={secTitleStyle} id="dest-heading">Explore Calbayog's Wonders</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', paddingTop: 10, gap: 10 }}>
            <div style={searchWrapStyle}>
              <svg viewBox="0 0 24 24" aria-hidden="true" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, stroke: 'var(--muted)', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                style={searchInStyle}
                type="search"
                placeholder="Search destinations…"
                aria-label="Search destinations"
                autoComplete="off"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              style={mapBtnStyle}
              onClick={() => setShowMap(!showMap)}
            >
              {showMap ? '📋 Hide Map' : '🗺️ Show Map'}
            </button>
          </div>
        </div>

        {showMap && (
          <div style={{ marginBottom: 36 }}>
            <MapComponent destinations={filtered} />
          </div>
        )}

        <div style={filterRowStyle} role="group" aria-label="Filter by category">
          <span style={filterLblStyle}>Filter:</span>
          {categories.map(cat => (
            <button
              key={cat}
              style={cat === activeCategory ? fbtnActive : fbtnBase}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={emptyStyle} role="status">
            <div style={{ fontSize: 48, marginBottom: 14 }}>🏝️</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 6, color: 'var(--text)' }}>No destinations found</h3>
            <p>Try a different search or filter.</p>
          </div>
        ) : (
          <div style={gridStyle} role="list" aria-label="Tourist destinations">
            {filtered.map((spot, i) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                avg={avgFor(spot.id)}
                reviewCount={cntFor(spot.id)}
                index={i}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
