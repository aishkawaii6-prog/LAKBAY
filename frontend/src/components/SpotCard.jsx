// src/components/SpotCard.jsx — all styles inlined

const FALLBACK = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=70'

const CAT_COLORS = {
  Waterfall: { bg: 'rgba(45,158,114,0.85)',  color: '#fff' },
  Beach:     { bg: 'rgba(14,100,180,0.82)',  color: '#fff' },
  Heritage:  { bg: 'rgba(160,90,20,0.85)',   color: '#fff' },
  Park:      { bg: 'rgba(34,120,50,0.85)',   color: '#fff' },
  Adventure: { bg: 'rgba(120,30,30,0.85)',   color: '#fff' },
}

function renderStars(r) {
  const n = Math.round(+r)
  return '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n))
}

export default function SpotCard({ spot, avg, reviewCount, index, onViewDetails }) {
  const imgSrc   = spot.coverImage || spot.images?.[0] || FALLBACK
  const catStyle = CAT_COLORS[spot.category] || { bg: 'rgba(0,0,0,0.48)', color: '#fff' }

  const cardStyle = {
    borderRadius: 22, overflow: 'hidden', border: '1px solid #e4dfd5',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', background: 'var(--card)',
    cursor: 'pointer', transition: 'transform 0.38s cubic-bezier(0.4,0,0.2,1), box-shadow 0.38s cubic-bezier(0.4,0,0.2,1)',
    animationDelay: `${index * 0.07}s`, animation: 'fadeUp 0.5s ease both',
  }

  const photoStyle = {
    position: 'relative', height: 252, overflow: 'hidden', background: '#1a2e22',
  }

  const imgStyle = {
    width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block',
    transition: 'transform 0.65s cubic-bezier(0.4,0,0.2,1)',
  }

  const veilStyle = {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.82) 100%)',
    transition: 'opacity 0.35s',
  }

  const badgesStyle = {
    position: 'absolute', top: 13, left: 13, right: 13,
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2,
  }

  const badgeCatStyle = {
    backdropFilter: 'blur(8px)', fontSize: '0.63rem', fontWeight: 700,
    letterSpacing: '0.09em', textTransform: 'uppercase',
    padding: '4px 11px', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    background: catStyle.bg, color: catStyle.color,
  }

  const badgeRatStyle = {
    background: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(8px)',
    color: '#ffd166', fontSize: '0.76rem', fontWeight: 700,
    padding: '4px 10px', borderRadius: 6,
  }

  const photoFootStyle = {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: '24px 18px 16px', zIndex: 2,
  }

  const cardNameStyle = {
    fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.28rem',
    fontWeight: 700, color: '#fff', lineHeight: 1.2,
    textShadow: '0 2px 12px rgba(0,0,0,0.5)',
  }

  const cardLocStyle = {
    fontSize: '0.75rem', color: 'rgba(255,255,255,0.72)', marginTop: 4,
    display: 'flex', alignItems: 'center', gap: 3,
  }

  const bodyStyle = { padding: '16px 20px 20px' }

  const descStyle = {
    color: 'var(--muted)', fontSize: '0.855rem', lineHeight: 1.68,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
    overflow: 'hidden', marginBottom: 15,
  }

  const footStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 13, borderTop: '1px solid var(--border)', gap: 8,
  }

  const starsStyle = {
    fontSize: '0.78rem', color: 'var(--muted)',
    display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap',
  }

  const btnViewStyle = {
    flexShrink: 0, padding: '7px 16px', borderRadius: 8, border: 'none',
    background: 'rgba(26,107,74,0.1)', color: '#1a6b4a',
    fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
    transition: 'all 0.22s', fontFamily: "'DM Sans', system-ui, sans-serif",
    whiteSpace: 'nowrap',
  }

  return (
    <article
      style={cardStyle}
      tabIndex={0}
      role="button"
      aria-label={`View ${spot.name} details`}
      onClick={() => onViewDetails(spot.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onViewDetails(spot.id) }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 24px 64px rgba(0,0,0,0.18)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)' }}
    >
      <div style={photoStyle}>
        <img
          src={imgSrc}
          alt={spot.name}
          loading={index < 3 ? 'eager' : 'lazy'}
          style={imgStyle}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK }}
        />
        <div style={veilStyle} aria-hidden="true" />
        <div style={badgesStyle}>
          <span style={badgeCatStyle}>{spot.category}</span>
          {avg > 0 && <span style={badgeRatStyle}>★ {avg}</span>}
        </div>
        <div style={photoFootStyle}>
          <div style={cardNameStyle}>{spot.name}</div>
          <div style={cardLocStyle}>📍 {spot.location}</div>
        </div>
      </div>

      <div style={bodyStyle}>
        <p style={descStyle}>{spot.description}</p>
        <div style={footStyle}>
          <span style={starsStyle}>
            {reviewCount > 0
              ? <><span style={{ color: '#e8a020', letterSpacing: 1 }}>{renderStars(avg)}</span> {reviewCount} review{reviewCount > 1 ? 's' : ''}</>
              : 'No reviews yet'}
          </span>
          <button
            style={btnViewStyle}
            onClick={(e) => { e.stopPropagation(); onViewDetails(spot.id) }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1a6b4a'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(26,107,74,0.1)'; e.currentTarget.style.color = '#1a6b4a' }}
          >
            View Details
          </button>
        </div>
      </div>
    </article>
  )
}
