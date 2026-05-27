// src/components/AboutSection.jsx — all styles inlined
// Images moved to public/assets/images for proper loading
const malajogImg   = '/assets/images/malajog-beach.jpg'
const cathedralImg = '/assets/images/cathedral.jpg'
const caveImg      = '/assets/images/longsob-cave.jpg'
const nijagaImg    = '/assets/images/nijaga-park.webp'

const HIGHLIGHTS = [
  { icon: '🌿', name: 'Eco-Tourism Haven',  sub: 'Rich biodiversity & nature'  },
  { icon: '📜', name: 'Cultural Heritage',  sub: 'Centuries of Waray history'  },
  { icon: '🎣', name: 'Fishing Capital',    sub: 'Vibrant maritime culture'     },
  { icon: '🤝', name: 'Warm Hospitality',   sub: 'Proud Waray welcome'          },
]

export default function AboutSection() {
  const scrollToDest = (e) => {
    e.preventDefault()
    document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })
  }

  const secStyle = { padding: '100px 0', background: 'var(--bg)' }
  const containerStyle = { maxWidth: 1280, margin: '0 auto', padding: '0 40px' }
  const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }
  const collageStyle = { position: 'relative', height: 520 }

  const colMain = {
    position: 'absolute', top: 0, left: 0, width: '68%', height: '70%',
    borderRadius: 18, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', zIndex: 1,
  }
  const colBr = {
    position: 'absolute', bottom: 0, right: 0, width: '52%', height: '50%',
    borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
    border: '4px solid var(--bg)', zIndex: 2,
  }
  const colMid = {
    position: 'absolute', top: '50%', left: '50%', width: '42%', height: '34%',
    borderRadius: 13, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    border: '4px solid var(--bg)', transform: 'rotate(-2.5deg)', zIndex: 3,
  }
  const colMini = {
    position: 'absolute', bottom: '12%', left: 0, width: '34%', height: '26%',
    borderRadius: 11, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    border: '4px solid var(--bg)', transform: 'rotate(1.5deg)', zIndex: 3,
  }
  const imgFill = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }

  const badgeBase = {
    position: 'absolute', zIndex: 5, background: 'rgba(0,0,0,0.56)',
    backdropFilter: 'blur(10px)', color: '#fff', fontSize: '0.63rem',
    fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
    padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.18)',
    whiteSpace: 'nowrap',
  }

  const tagPillStyle = {
    display: 'inline-block', fontSize: '0.7rem', fontWeight: 700,
    letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1a6b4a',
    background: 'rgba(26,107,74,0.09)', padding: '4px 14px', borderRadius: 50, marginBottom: 8,
  }

  const secTitleStyle = {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 'clamp(1.65rem, 3vw, 2.4rem)',
    fontWeight: 700, color: 'var(--text)', lineHeight: 1.1, marginTop: 8,
  }

  const pStyle = { color: 'var(--muted)', lineHeight: 1.8, marginBottom: 14, fontSize: '0.94rem' }

  const hlsStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, margin: '28px 0 32px' }

  const ahlStyle = {
    background: 'var(--card)', border: '1px solid var(--border)',
    borderRadius: 12, padding: 14, display: 'flex', gap: 10, alignItems: 'flex-start',
  }

  const btnGreenStyle = {
    display: 'inline-block', padding: '13px 30px', borderRadius: 11,
    background: '#1a6b4a', color: '#fff', fontWeight: 700, fontSize: '0.9rem',
    transition: 'all 0.25s', textDecoration: 'none',
  }

  return (
    <section id="about" style={secStyle} aria-labelledby="about-heading">
      <div style={containerStyle}>
        <div style={gridStyle}>
          {/* Photo Collage */}
          <div style={collageStyle} aria-hidden="true">
            <div style={colMain}>
              <img src={cathedralImg} alt="Sts. Peter & Paul Cathedral" loading="lazy" style={imgFill} />
              <div style={{ ...badgeBase, top: 10, left: 10 }}>Sts. Peter &amp; Paul Cathedral</div>
            </div>
            <div style={colBr}>
              <img src={malajogImg} alt="Malajog Beach" loading="lazy" style={imgFill} />
              <div style={{ ...badgeBase, bottom: 10, left: 10 }}>Malajog Beach</div>
            </div>
            <div style={colMid}>
              <img src={caveImg} alt="Longsob Cave" loading="lazy" style={{ ...imgFill, objectPosition: 'center 40%' }} />
              <div style={{ ...badgeBase, top: 8, left: 8 }}>Longsob Cave</div>
            </div>
            <div style={colMini}>
              <img src={nijagaImg} alt="Nijaga Park" loading="lazy" style={{ ...imgFill, objectPosition: 'center 20%' }} />
              <div style={{ ...badgeBase, top: 8, left: 8 }}>Nijaga Park</div>
            </div>
          </div>

          {/* Text Block */}
          <div>
            <div style={{ marginBottom: 22 }}>
              <div style={tagPillStyle}>🏙️ About Calbayog City</div>
              <h2 style={secTitleStyle} id="about-heading">The City of Waterfalls</h2>
            </div>

            <p style={pStyle}>
              Calbayog City is the largest city by land area in Eastern Visayas,
              Philippines, on the northwestern coast of Samar Island. Known as the{' '}
              <em>"City of Waterfalls,"</em> it is home to the spectacular Tarangban
              Falls — ranked #1 on TripAdvisor Calbayog — and the dramatic Bangon
              Falls with its wide, silky cascade.
            </p>
            <p style={pStyle}>
              Beyond its waterfalls, Calbayog boasts Malajog Beach's thrilling
              912-meter sea zipline, the majestic Sts. Peter &amp; Paul Cathedral,
              mysterious Longsob Cave, the peaceful Nijaga Park, and the legendary
              warmth of the Waray people.
            </p>

            <div style={hlsStyle}>
              {HIGHLIGHTS.map(h => (
                <div key={h.name} style={ahlStyle}>
                  <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{h.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>{h.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: 2 }}>{h.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <a href="#destinations" style={btnGreenStyle} onClick={scrollToDest}
              onMouseEnter={e => { e.currentTarget.style.background = '#0f4a32'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1a6b4a'; e.currentTarget.style.transform = '' }}
            >
              Explore All Destinations →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
