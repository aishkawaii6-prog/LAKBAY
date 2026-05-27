// src/components/EventsSection.jsx — Upcoming Events & Activities on the home page

// Format date for display: "12 Jan 2026"
const fmtDate = (d) => {
  if (!d) return null
  const [y, m, day] = String(d).split('-')
  return `${day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m) - 1]} ${y}`
}

// Format time from 24h to 12h: "14:30" → "2:30 PM"
const fmtTime = (t) => {
  if (!t) return null
  const [h, m] = String(t).split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function EventsSection({ events }) {
  const upcoming = events.length

  /* ── Styles ── */
  const sectionStyle = {
    padding: '76px 0 100px',
    background: 'var(--bg)',
  }

  const containerStyle = { maxWidth: 1280, margin: '0 auto', padding: '0 40px' }

  const headerWrapStyle = {
    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
    gap: 20, flexWrap: 'wrap', marginBottom: 36,
  }

  const tagPillStyle = {
    display: 'inline-block', fontSize: '0.7rem', fontWeight: 700,
    letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1a6b4a',
    background: 'rgba(26,107,74,0.09)', padding: '4px 14px',
    borderRadius: 50, marginBottom: 8,
  }

  const titleStyle = {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 'clamp(1.65rem, 3vw, 2.4rem)',
    fontWeight: 700, color: 'var(--text)', lineHeight: 1.1,
  }

  const countChipStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    background: 'rgba(26,107,74,0.1)', color: '#1a6b4a',
    fontSize: '0.82rem', fontWeight: 600, padding: '6px 16px',
    borderRadius: 50, flexShrink: 0,
  }

  // --- card styles ---
  const cardStyle = {
    background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)',
    overflow: 'hidden', boxShadow: 'var(--sh-sm)',
    transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s',
    display: 'flex', flexDirection: 'column',
  }

  const photoWrapStyle = {
    width: '100%', height: 200, background: 'var(--bg)',
    position: 'relative', overflow: 'hidden', flexShrink: 0,
  }

  const photoImgStyle = {
    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
    transition: 'transform 0.5s ease',
  }

  const photoFallbackStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%',
    fontSize: '3.5rem',
    background: 'linear-gradient(135deg, rgba(26,107,74,0.08), rgba(26,107,74,0.02))',
  }

  const legendStyle = {
    position: 'absolute', insetInline: 0, bottom: 0,
    padding: '28px 16px 14px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
  }

  const cardNameStyle = {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontWeight: 700, color: '#fff', fontSize: '1rem', lineHeight: 1.25,
  }

  const catChipStyle = {
    background: 'rgba(26,107,74,0.88)', color: '#fff',
    fontSize: '0.63rem', fontWeight: 700, padding: '2px 10px',
    borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em',
    flexShrink: 0,
  }

  const bodyStyle = { padding: '16px 18px' }

  const chip = (emoji, label, bg, color) => ({
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: '0.7rem', fontWeight: 600, padding: '3px 9px',
    borderRadius: 20, background: bg, color,
    marginBottom: 6, marginRight: 6,
  })

  const descStyle = {
    fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.55,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
    overflow: 'hidden', marginBottom: 4,
  }

  const emptyStyle = {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '68px 20px', color: 'var(--muted)', textAlign: 'center',
  }

  return (
    <section id="events" style={sectionStyle} aria-labelledby="events-heading">
      <div style={containerStyle}>
        <div style={headerWrapStyle}>
          <div>
            <div style={tagPillStyle}>📅 Upcoming Events</div>
            <h2 style={titleStyle} id="events-heading">Events &amp; Activities</h2>
          </div>
          {upcoming > 0 && (
            <span style={countChipStyle}>
              <span>🌟</span> {upcoming} upcoming
            </span>
          )}
        </div>

        {events.length === 0 ? (
          <div style={emptyStyle} role="status">
            <div style={{ fontSize: 48, marginBottom: 14 }}>📅</div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 6, color: 'var(--text)' }}>No upcoming events</h3>
            <p style={{ fontSize: '0.85rem' }}>Check back soon — new events and activities will appear here.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 22,
          }}>
            {events.map((ev) => (
              <article
                key={ev.id}
                style={cardStyle}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--sh-sm)' }}
              >
                {/* ── Event Image ── */}
                <div style={photoWrapStyle}>
                  {ev.event_image ? (
                    <img
                      src={ev.event_image}
                      alt={ev.name}
                      loading="lazy"
                      style={photoImgStyle}
                    />
                  ) : (
                    <div style={photoFallbackStyle}>📅</div>
                  )}
                  <div style={legendStyle}>
                    <div>
                      <div style={cardNameStyle}>{ev.name || 'Untitled Event'}</div>
                    </div>
                    <span style={catChipStyle}>{ev.category || 'General'}</span>
                  </div>
                </div>

                {/* ── Card Body ── */}
                <div style={bodyStyle}>
                  {/* Date / Time / Location chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, marginBottom: 10 }}>
                    {ev.event_date && (
                      <span style={chip('📆', null, 'rgba(26,107,74,0.09)', '#1a6b4a')}>
                        📆 {fmtDate(ev.event_date)}
                      </span>
                    )}
                    {ev.event_time && (
                      <span style={chip('🕐', null, 'rgba(245,158,11,0.09)', '#92400e')}>
                        🕐 {fmtTime(ev.event_time)}
                      </span>
                    )}
                    {ev.location && (
                      <span style={chip('📍', null, 'rgba(59,130,246,0.09)', '#1d4ed8')}>
                        📍 {ev.location.length > 30 ? ev.location.substring(0, 30) + '…' : ev.location}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {ev.description && (
                    <p style={descStyle}>{ev.description}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
