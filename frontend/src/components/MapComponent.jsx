// src/components/MapComponent.jsx — landing page interactive map (all inline styles)

import { useEffect, useRef, useState, useCallback } from 'react'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// ─── Coordinate helpers ───────────────────────────────────────────────────────
function hasValidCoords(dest) {
  return (
    dest.latitude != null &&
    dest.longitude != null &&
    dest.latitude !== 0 &&
    dest.longitude !== 0
  )
}

async function resolveCoordinates(dest, geocoder, placesService) {
  // 1. Already has exact coords → use them directly
  if (hasValidCoords(dest)) {
    return { lat: dest.latitude, lng: dest.longitude }
  }

  // 2. Try Places text search (most accurate for named locations)
  if (placesService) {
    const placeResult = await new Promise((resolve) => {
      placesService.textSearch(
        {
          query: `${dest.name} ${dest.location || ''}`.trim(),
          fields: ['geometry', 'name', 'place_id'],
        },
        (results, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            results?.[0]?.geometry?.location
          ) {
            resolve(results[0].geometry.location)
          } else {
            resolve(null)
          }
        }
      )
    })

    if (placeResult) {
      return { lat: placeResult.lat(), lng: placeResult.lng() }
    }
  }

  // 3. Fallback: Geocoder with full address string
  if (geocoder && dest.location) {
    const geocodeResult = await new Promise((resolve) => {
      geocoder.geocode(
        { address: `${dest.name}, ${dest.location}` },
        (results, status) => {
          if (status === 'OK' && results?.[0]?.geometry?.location) {
            resolve(results[0].geometry.location)
          } else {
            resolve(null)
          }
        }
      )
    })

    if (geocodeResult) {
      return { lat: geocodeResult.lat(), lng: geocodeResult.lng() }
    }
  }

  return null
}

// ─── Custom SVG marker icon ───────────────────────────────────────────────────
function createMarkerIcon(color = '#1a6b4a', index = null) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">
    <filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/></filter>
    <path filter="url(#shadow)"
      d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z"
      fill="${color}"/>
    <circle cx="18" cy="18" r="9" fill="white" opacity="0.92"/>
    ${index !== null
      ? `<text x="18" y="23" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${color}" text-anchor="middle">${index + 1}</text>`
      : `<circle cx="18" cy="18" r="4" fill="${color}"/>`}
  </svg>`
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(36, 48),
    anchor: new google.maps.Point(18, 48),
  }
}

export default function MapComponent({ destinations = [] }) {
  const mapRef      = useRef(null)
  const mapInstance = useRef(null)
  const geocoderRef = useRef(null)
  const placesRef   = useRef(null)
  const markersRef  = useRef([])
  const infoWindows = useRef([])
  const scriptRef   = useRef(null)

  const [error,     setError]     = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [resolving, setResolving] = useState(false)

  // ── Initialize map after API loads ──────────────────────────────────────────
  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = new google.maps.Map(mapRef.current, {
      center:     { lat: 12.0674, lng: 124.5964 },
      zoom:       12,
      mapTypeId:  google.maps.MapTypeId.HYBRID,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style:      google.maps.MapTypeControlStyle.DROPDOWN_MENU,
        position:   google.maps.ControlPosition.TOP_RIGHT,
        mapTypeIds: [
          google.maps.MapTypeId.SATELLITE,
          google.maps.MapTypeId.HYBRID,
          google.maps.MapTypeId.ROADMAP,
          google.maps.MapTypeId.TERRAIN,
        ],
      },
      zoomControl:        true,
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
      streetViewControl:  true,
      fullscreenControl:  true,
      gestureHandling:    'greedy',
    })

    mapInstance.current = map
    geocoderRef.current = new google.maps.Geocoder()
    placesRef.current   = new google.maps.places.PlacesService(map)
    setLoading(false)
  }, [])

  // ── Load Google Maps script ─────────────────────────────────────────────────
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key not configured. Set VITE_GOOGLE_MAPS_API_KEY in your .env file.')
      setLoading(false)
      return
    }

    if (window.google?.maps) {
      initMap()
      return
    }

    const existing = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existing) {
      existing.addEventListener('load', initMap)
      return
    }

    const script = document.createElement('script')
    script.src   = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`
    script.async = true
    script.defer = true
    script.onerror = () => {
      setError('Failed to load Google Maps. Check your API key and enable billing in Google Cloud Console.')
      setLoading(false)
    }
    script.onload = initMap
    document.head.appendChild(script)
    scriptRef.current = script

    return () => {
      markersRef.current.forEach(m => m.setMap(null))
    }
  }, [initMap])

  // ── Place / refresh markers whenever destinations change ─────────────────────
  useEffect(() => {
    if (!mapInstance.current || loading || !destinations.length) return

    // Clear previous markers + info windows
    markersRef.current.forEach(m => m.setMap(null))
    infoWindows.current.forEach(iw => iw.close())
    markersRef.current = []
    infoWindows.current = []

    setResolving(true)

    const COLORS = [
      '#1a6b4a', '#c0392b', '#2980b9', '#8e44ad',
      '#d35400', '#16a085', '#c0392b', '#2c3e50',
    ]

    ;(async () => {
      const bounds  = new google.maps.LatLngBounds()
      let   resolved = 0

      for (let i = 0; i < destinations.length; i++) {
        const dest  = destinations[i]
        const color = COLORS[i % COLORS.length]

        const coords = await resolveCoordinates(dest, geocoderRef.current, placesRef.current)

        if (!coords) {
          console.warn(`⚠️ Could not resolve location for: ${dest.name}`)
          continue
        }

        resolved++
        const position = new google.maps.LatLng(coords.lat, coords.lng)
        bounds.extend(position)

        const marker = new google.maps.Marker({
          position,
          map:       mapInstance.current,
          title:     dest.name,
          icon:      createMarkerIcon(color, destinations.length > 1 ? i : null),
          animation: google.maps.Animation.DROP,
          zIndex:    i + 1,
        })

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding:14px 16px;max-width:260px;font-family:system-ui,sans-serif;border-top:4px solid ${color}">
              ${destinations.length > 1
                ? `<span style="display:inline-block;background:${color};color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;margin-bottom:8px;letter-spacing:.5px">STOP ${i + 1}</span>`
                : ''}
              <h3 style="margin:0 0 4px;font-size:15px;font-weight:700;color:#111;line-height:1.25">${dest.name}</h3>
              ${dest.category
                ? `<p style="margin:0 0 6px;font-size:11px;font-weight:600;color:${color};text-transform:uppercase;letter-spacing:.6px">${dest.category}</p>`
                : ''}
              ${dest.location
                ? `<p style="margin:0 0 6px;font-size:12px;color:#555;display:flex;align-items:center;gap:4px">📍 ${dest.location}</p>`
                : ''}
              ${dest.description
                ? `<p style="margin:8px 0 0;font-size:12px;color:#666;line-height:1.5;border-top:1px solid #eee;padding-top:8px">${dest.description.substring(0, 120)}${dest.description.length > 120 ? '…' : ''}</p>`
                : ''}
              <a href="${dest.mapUrl || `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}"
                 target="_blank" rel="noopener noreferrer"
                 style="display:inline-block;margin-top:10px;padding:6px 14px;background:${color};color:#fff;font-size:12px;font-weight:600;border-radius:6px;text-decoration:none">🧭 Get Directions</a>
            </div>`,
          maxWidth: 280,
        })

        marker.addListener('click', () => {
          infoWindows.current.forEach(iw => iw.close())
          infoWindow.open({ map: mapInstance.current, anchor: marker })
          mapInstance.current.panTo(position)
          if (mapInstance.current.getZoom() < 16) mapInstance.current.setZoom(16)
        })

        marker.infoWindow = infoWindow
        markersRef.current.push(marker)
        infoWindows.current.push(infoWindow)
      }

      // ── Fit map to all resolved markers ─────────────────────────────────────
      if (resolved === 1 && markersRef.current[0]) {
        mapInstance.current.panTo(markersRef.current[0].getPosition())
        mapInstance.current.setZoom(17)
      } else if (resolved > 1) {
        mapInstance.current.fitBounds(bounds, { padding: 60 })
        const cap = google.maps.event.addListener(
          mapInstance.current, 'zoom_changed', () => {
            if (mapInstance.current.getZoom() > 16) mapInstance.current.setZoom(16)
          }
        )
        google.maps.event.addListenerOnce(mapInstance.current, 'idle', () => {
          google.maps.event.removeListener(cap)
        })
      }

      setResolving(false)
    })()
  }, [destinations, loading])

  // ─── Render ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{
        padding: '20px', background: 'rgba(220,38,38,0.06)', border: '1.5px solid rgba(220,38,38,0.2)',
        borderRadius: 14, color: '#991b1b', fontSize: '0.9rem',
      }}
        role="alert"
      >
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Map Error</div>
        <div>{error}</div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Map canvas */}
      <div
        ref={mapRef}
        style={{
          width:        '100%', height: 480,
          borderRadius: 14, border: '1.5px solid var(--border)',
          overflow: 'hidden', background: '#e5ebe6',
        }}
      />

      {/* Loading overlay */}
      {(loading || resolving) && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255,255,255,0.72)', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 12, borderRadius: 14, zIndex: 10,
        }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '3px solid #e5e7eb',
            borderTopColor: '#1a6b4a',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--muted)' }}>
            {loading ? 'Loading map…' : 'Pinpointing destinations…'}
          </p>
        </div>
      )}

      {/* Stops legend — only visible after pins are resolved */}
      {!loading && !resolving && destinations.length > 1 && (
        <div style={{
          position: 'absolute', bottom: 12, left: 12,
          background: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(6px)',
          borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          padding: '10px 14px', maxWidth: 220, zIndex: 10,
        }}
        >
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Stops</p>
          {destinations.map((d, i) => (
            <button
              key={d.id || i}
              onClick={() => {
                const marker = markersRef.current[i]
                if (!marker) return
                infoWindows.current.forEach(iw => iw.close())
                marker.infoWindow?.open({ map: mapInstance.current, anchor: marker })
                mapInstance.current.panTo(marker.getPosition())
                mapInstance.current.setZoom(16)
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '4px 6px', border: 'none', background: 'none',
                cursor: 'pointer', marginBottom: 2, borderRadius: 6,
                transition: 'background 0.15s', fontSize: '0.78rem', color: '#374151',
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,107,74,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.62rem', fontWeight: 700, color: '#fff',
                background: ['#1a6b4a','#c0392b','#2980b9','#8e44ad','#d35400','#16a085'][i % 6],
              }}>{i + 1}</span>
              <span style={{
                overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap', textAlign: 'left',
              }}>{d.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
