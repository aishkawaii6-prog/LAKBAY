// ═══════════════════════════════════════════════════════════
//  src/hooks/useStorage.js
//  Custom hook for all localStorage operations
//  Replaces the vanilla-JS "S" object from index.html
// ═══════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from 'react'
import { DEFAULT_SPOTS, DEFAULT_FEEDBACK, DEFAULT_ADMINS } from '../data/spots'
import { destinationsAPI, activitiesAPI } from '../services/api'

const DATA_VERSION = '11' // Bumped: normalised feedback spotIds ('s1'→'1') + ID normalisation in getFbFor/getAvg
const KEYS = {
  SPOTS:    'lc_sp_r',
  ADMINS:   'lc_ad_r',
  FEEDBACK: 'lc_fb_r',
  EVENTS:   'lc_ev_r',
  SESSION:  'lc_ss',
  THEME:    'lc_th',
  MAPS:     'lc_mp_r',
}

// ── One-time seed (called once at app start) ──────────────
export function seedStorage() {
  if (localStorage.getItem('lcv_r') !== DATA_VERSION) {
    localStorage.removeItem(KEYS.SPOTS)
    localStorage.removeItem(KEYS.ADMINS)
    localStorage.removeItem(KEYS.FEEDBACK)
    localStorage.setItem('lcv_r', DATA_VERSION)
  }
  if (!localStorage.getItem(KEYS.SPOTS))    localStorage.setItem(KEYS.SPOTS,    JSON.stringify(DEFAULT_SPOTS))
  if (!localStorage.getItem(KEYS.ADMINS))   localStorage.setItem(KEYS.ADMINS,   JSON.stringify(DEFAULT_ADMINS))
  if (!localStorage.getItem(KEYS.FEEDBACK)) localStorage.setItem(KEYS.FEEDBACK, JSON.stringify(DEFAULT_FEEDBACK))
}

// ── Pure read helpers (no hooks, safe to call anywhere) ───
export const storage = {
  getSpots:    ()  => { try { return JSON.parse(localStorage.getItem(KEYS.SPOTS) || '[]') } catch { return DEFAULT_SPOTS } },
  getSpot:     (id) => storage.getSpots().find(s => s.id === id) || null,
  getFeedback: ()  => { try { return JSON.parse(localStorage.getItem(KEYS.FEEDBACK) || '[]') } catch { return DEFAULT_FEEDBACK } },
  getFbFor:    (id) => {
    const key = typeof id === 'string' ? id.replace(/^s/, '') : String(id)
    return storage.getFeedback().filter(f => {
      const fk = typeof f.spotId === 'string' ? f.spotId.replace(/^s/, '') : String(f.spotId)
      return fk === key
    })
  },
  getAvg:      (id) => {
    const fb = storage.getFbFor(id)
    return fb.length ? (fb.reduce((sum, f) => sum + f.rating, 0) / fb.length).toFixed(1) : 0
  },
  getTheme:    ()  => localStorage.getItem(KEYS.THEME) || 'light',
  setTheme:    (t) => localStorage.setItem(KEYS.THEME, t),
  isLoggedIn:  ()  => !!localStorage.getItem(KEYS.SESSION),
  addFeedback: (fb) => {
    const all = storage.getFeedback()
    const entry = { ...fb, id: 'f' + Date.now(), date: new Date().toISOString().split('T')[0] }
    all.unshift(entry)
    localStorage.setItem(KEYS.FEEDBACK, JSON.stringify(all))
    return entry
  },
  // ── Spot CRUD (kept for backward-compat; primary path is API) ──
  addSpot: (spotData) => {
    const all = storage.getSpots()
    const entry = { ...spotData, id: 'sp' + Date.now(), createdAt: new Date().toISOString().split('T')[0] }
    all.push(entry)
    localStorage.setItem(KEYS.SPOTS, JSON.stringify(all))
    return entry
  },
  updateSpot: (id, updates) => {
    const all = storage.getSpots()
    const idx = all.findIndex(s => s.id === id)
    if (idx === -1) return null
    all[idx] = { ...all[idx], ...updates }
    localStorage.setItem(KEYS.SPOTS, JSON.stringify(all))
    return all[idx]
  },
  deleteSpot: (id) => {
    const all = storage.getSpots().filter(s => s.id !== id)
    localStorage.setItem(KEYS.SPOTS, JSON.stringify(all))
  },
  // ── Admin account CRUD ──
  getAdmins: () => { try { return JSON.parse(localStorage.getItem(KEYS.ADMINS) || '[]') } catch { return DEFAULT_ADMINS } },
  addAdmin: (adminData) => {
    const all = storage.getAdmins()
    const entry = { ...adminData, id: 'a' + Date.now(), createdAt: new Date().toISOString().split('T')[0] }
    all.push(entry)
    localStorage.setItem(KEYS.ADMINS, JSON.stringify(all))
    return entry
  },
  findAdminByEmail: (email) => storage.getAdmins().find(a => a.email === email) || null,
  updateAdminPassword: (email, newPassword) => {
    const all = storage.getAdmins()
    const idx = all.findIndex(a => a.email === email)
    if (idx === -1) return false
    all[idx].password = newPassword
    localStorage.setItem(KEYS.ADMINS, JSON.stringify(all))
    return true
  },
}

// ── React hook — gives reactive spots + feedback state ────
export function useSpots() {
  const [spots,    setSpots]    = useState(() => storage.getSpots())
  const [feedback, setFeedback] = useState(() => storage.getFeedback())

  // Load spots from backend API on mount
  useEffect(() => {
    let cancelled = false
    const loadFromAPI = async () => {
      try {
        const { destinations } = await destinationsAPI.getAll()
        if (!cancelled && destinations?.length) {
          setSpots(destinations)
        }
      } catch (err) {
        // API unavailable — fall back to localStorage silently
        console.warn('Could not fetch destinations from API, using localStorage.')
      }
    }
    loadFromAPI()
    return () => { cancelled = true }
  }, [])

  const addFeedback = useCallback((fb) => {
    const entry = storage.addFeedback(fb)
    setFeedback(storage.getFeedback())
    return entry
  }, [])

  const refreshSpots = useCallback(async () => {
    // Primary: fetch from API (reflects any changes made in phpMyAdmin or elsewhere)
    try {
      const { destinations } = await destinationsAPI.getAll()
      setSpots(destinations)
    } catch {
      // Fallback: refresh from localStorage
      setSpots(storage.getSpots())
    }
    setFeedback(storage.getFeedback())
  }, [])

  const getFbFor = useCallback(
    (id) => {
      const key = typeof id === 'string' ? id.replace(/^s/, '') : String(id)
      return feedback.filter(f => {
        const fk = typeof f.spotId === 'string' ? f.spotId.replace(/^s/, '') : String(f.spotId)
        return fk === key
      })
    },
    [feedback]
  )

  const getAvg = useCallback(
    (id) => {
      const fb = getFbFor(id)
      return fb.length ? (fb.reduce((s, f) => s + f.rating, 0) / fb.length).toFixed(1) : 0
    },
    [getFbFor]
  )

  return { spots, feedback, addFeedback, refreshSpots, getFbFor, getAvg }
}

// ── React hook — reactive events state for the landing page ───
export function useEvents() {
  const [events, setEvents] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEYS.EVENTS) || '[]') }
    catch { return [] }
  })

  // Load active events from backend API on mount
  useEffect(() => {
    let cancelled = false
    const loadFromAPI = async () => {
      try {
        const { activities } = await activitiesAPI.getAll()
        if (!cancelled) {
          const activeEvents = (activities || []).filter(
            a => a.is_active !== false && a.is_active !== 0
          )
          setEvents(activeEvents)
          localStorage.setItem(KEYS.EVENTS, JSON.stringify(activeEvents))
        }
      } catch {
        // API unavailable — use localStorage silently
        console.warn('Could not fetch events from API, using localStorage.')
      }
    }
    loadFromAPI()
    return () => { cancelled = true }
  }, [])

  const refreshEvents = useCallback(async () => {
    try {
      const { activities } = await activitiesAPI.getAll()
      const activeEvents = (activities || []).filter(
        a => a.is_active !== false && a.is_active !== 0
      )
      setEvents(activeEvents)
      localStorage.setItem(KEYS.EVENTS, JSON.stringify(activeEvents))
    } catch {
      setEvents([])
    }
  }, [])

  return { events, refreshEvents }
}
