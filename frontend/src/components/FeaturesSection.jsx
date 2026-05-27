// src/components/FeaturesSection.jsx — all styles inlined

const FEATURES = [
  { icon: '💦', title: 'Majestic Waterfalls', desc: 'Tarangban, Bangon, and dozens more hidden in lush rainforests.' },
  { icon: '🏖️', title: 'Pristine Beaches',    desc: "Malajog's thrilling 912-meter sea zipline and crystal Samar Sea waters." },
  { icon: '⛪', title: 'Rich Heritage',        desc: 'Centuries-old Spanish-era churches — the largest in all of Samar island.' },
  { icon: '🦇', title: 'Cave Adventures',      desc: 'Mysterious limestone caves with ancient formations and bat colonies.' },
]

export default function FeaturesSection() {
  const secStyle = {
    background: 'linear-gradient(135deg, #061e0e 0%, #1a6b4a 100%)',
    padding: '92px 0',
  }

  const containerStyle = { maxWidth: 1280, margin: '0 auto', padding: '0 40px' }

  const hdrStyle = { textAlign: 'center', marginBottom: 52 }

  const tagStyle = {
    display: 'inline-block', fontSize: '0.7rem', fontWeight: 700,
    letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f5c35a',
    background: 'rgba(255,255,255,0.14)', padding: '4px 14px',
    borderRadius: 50, marginBottom: 8,
  }

  const titleStyle = {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 'clamp(1.65rem, 3vw, 2.4rem)',
    fontWeight: 700, color: '#fff', lineHeight: 1.1,
  }

  const descStyle = {
    color: 'rgba(255,255,255,0.62)', fontSize: '0.93rem',
    margin: '8px auto 0', maxWidth: 500,
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 18,
  }

  const cardStyle = {
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 14, padding: '30px 22px', textAlign: 'center',
    transition: 'all 0.3s', backdropFilter: 'blur(8px)',
  }

  return (
    <section style={secStyle} aria-labelledby="why-heading">
      <div style={containerStyle}>
        <div style={hdrStyle}>
          <div style={tagStyle}>✨ Why Visit</div>
          <h2 style={titleStyle} id="why-heading">An Unforgettable Destination</h2>
          <p style={descStyle}>What makes Calbayog City truly extraordinary in Eastern Visayas.</p>
        </div>
        <div style={gridStyle}>
          {FEATURES.map(f => (
            <div key={f.title} style={cardStyle}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.transform = 'translateY(-5px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = '' }}
            >
              <span style={{ fontSize: 36, marginBottom: 13, display: 'block' }}>{f.icon}</span>
              <div style={{ color: '#fff', fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.02rem', fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.83rem', lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
