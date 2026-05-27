// src/components/Footer.jsx — all styles inlined

import { useState, useEffect } from 'react'

export default function Footer() {
  const scrollTo = (id) => (e) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const footerStyle = {
    background: '#060f09', color: 'rgba(255,255,255,0.55)', padding: '60px 0 30px',
  }
  const innerStyle = { maxWidth: 1280, margin: '0 auto', padding: '0 40px' }
  const gridStyle = {
    display: 'grid', 
    gridTemplateColumns: 'repeat(4, 1fr)', 
    gap: 40, 
    marginBottom: 40,
  }
  const nameStyle = { fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.18rem', color: '#fff', marginBottom: 3 }
  const subStyle = { fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.09em', textTransform: 'uppercase' }
  const descStyle = { fontSize: '0.82rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.72, marginTop: 13 }
  const hdStyle = { fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#f5c35a', marginBottom: 14 }
  const linkStyle = { fontSize: '0.82rem', color: 'rgba(255,255,255,0.42)', display: 'block', padding: '3px 0', transition: 'color 0.2s', textDecoration: 'none' }
  const botStyle = {
    borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 22,
    display: 'flex', justifyContent: 'space-between',
    fontSize: '0.78rem', color: 'rgba(255,255,255,0.28)', flexWrap: 'wrap', gap: 8,
  }

  // Responsive styles
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const responsiveGridStyle = isMobile ? {
    gridTemplateColumns: '1fr',
    gap: 24,
    textAlign: 'center',
  } : gridStyle

  const responsiveInnerStyle = isMobile ? {
    ...innerStyle,
    padding: '0 20px',
  } : innerStyle

  return (
    <footer style={footerStyle}>
      <div style={responsiveInnerStyle}>
        <div style={responsiveGridStyle}>
          <section aria-label="About Lakbay Calbayog">
            <div style={nameStyle}>Lakbay Calbayog</div>
            <div style={subStyle}>Tourism Management System</div>
            <p style={descStyle}>Your digital guide to the waterfalls, beaches, heritage sites, and hidden gems of Calbayog City, Western Samar.</p>
          </section>
          <nav aria-label="Destinations">
            <div style={hdStyle}>Destinations</div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {['Waterfalls','Beaches','Heritage Sites','Cave Adventures'].map(l => (
                <li key={l}><a href="#destinations" style={linkStyle} onClick={scrollTo('destinations')}>{l}</a></li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Information">
            <div style={hdStyle}>Information</div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              <li><a href="#about" style={linkStyle} onClick={scrollTo('about')}>About Calbayog</a></li>
              <li><a href="#about" style={linkStyle} onClick={scrollTo('about')}>City History</a></li>
            </ul>
          </nav>
          <nav aria-label="Admin Portal">
            <div style={hdStyle}>Admin Portal</div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              <li><a href="/login" style={linkStyle}>Admin Login</a></li>
              <li><a href="/signup" style={linkStyle}>Create Account</a></li>
            </ul>
          </nav>
        </div>
        <div style={botStyle}>
          <span>© 2024 Lakbay Calbayog Tourism Management System. All rights reserved.</span>
          <span>Made with ❤️ for <a href="#about" style={{ color: '#f5c35a' }} onClick={scrollTo('about')}>Calbayog City</a></span>
        </div>
      </div>
    </footer>
  )
}
