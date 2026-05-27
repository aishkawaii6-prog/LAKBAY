// src/components/Hero.jsx — all styles inlined

import { useState, useEffect, useRef, useMemo } from 'react'

const styles = {
  hero: {
    position: 'relative', height: '100vh', minHeight: 580, maxHeight: 920,
    display: 'flex', alignItems: 'flex-end', overflow: 'hidden',
  },
  slide: (show) => ({
    position: 'absolute', inset: 0, backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat', opacity: show ? 1 : 0,
    transition: 'opacity 1.6s ease',
    animation: 'kzoom 22s ease-in-out infinite alternate',
  }),
  veil: {
    position: 'absolute', inset: 0, zIndex: 1,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.04) 28%, rgba(0,0,0,0.48) 68%, rgba(0,0,0,0.82) 100%)',
  },
  content: {
    position: 'relative', zIndex: 2, width: '100%', maxWidth: 1280,
    margin: '0 auto', padding: '0 40px 68px',
  },
  pill: {
    display: 'inline-flex', alignItems: 'center', gap: 9,
    background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(8px)', borderRadius: 50, padding: '5px 16px',
    marginBottom: 16, fontSize: '0.72rem', fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.9)', animation: 'fadeUp 0.6s ease 0.1s both',
  },
  pillDot: {
    width: 6, height: 6, borderRadius: '50%',
    background: '#f5c35a', flexShrink: 0,
  },
  h1: {
    fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900,
    fontSize: 'clamp(2.6rem, 6.5vw, 5rem)', color: '#fff',
    lineHeight: 1.04, marginBottom: 16,
    textShadow: '0 4px 30px rgba(0,0,0,0.35)',
    animation: 'fadeUp 0.65s ease 0.2s both',
  },
  em: { fontStyle: 'italic', color: '#f5c35a' },
  p: {
    fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)', color: 'rgba(255,255,255,0.76)',
    maxWidth: 520, lineHeight: 1.72, marginBottom: 30,
    animation: 'fadeUp 0.65s ease 0.3s both',
  },
  btns: {
    display: 'flex', gap: 12, flexWrap: 'wrap',
    animation: 'fadeUp 0.65s ease 0.4s both',
  },
  btnGold: {
    padding: '14px 30px', borderRadius: 11, background: '#e8a020',
    color: '#fff', fontWeight: 700, fontSize: '0.9rem',
    transition: 'all 0.25s', boxShadow: '0 8px 28px rgba(232,160,32,0.38)',
    display: 'inline-block', textDecoration: 'none',
  },
  btnOutline: {
    padding: '14px 30px', borderRadius: 11, border: '2px solid rgba(255,255,255,0.4)',
    color: '#fff', fontWeight: 600, fontSize: '0.9rem',
    transition: 'all 0.25s', display: 'inline-block', textDecoration: 'none',
  },
  dots: {
    position: 'absolute', bottom: 30, right: 40, zIndex: 3,
    display: 'flex', gap: 9, alignItems: 'center',
  },
  dot: (active) => ({
    width: 8, height: 8, borderRadius: '50%',
    background: active ? '#fff' : 'rgba(255,255,255,0.35)',
    cursor: 'pointer', transition: 'all 0.3s', border: 'none',
    transform: active ? 'scale(1.4)' : 'scale(1)',
  }),
  caption: {
    position: 'absolute', bottom: 32, left: 40, zIndex: 3,
    color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', letterSpacing: '0.07em',
  },
}

export default function Hero({ spots = [] }) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)

  // Build slide config from API data — picks featured spots first, falls back to all spots
  const slides = useMemo(() => {
    const featured = spots.filter(s => s.featured && s.coverImage)
    const pool     = featured.length >= 2 ? featured : (spots.filter(s => s.coverImage) || spots)
    if (pool.length === 0) return []
    return pool.slice(0, 6).map(s => ({
      image:  s.coverImage,
      position: 'center 30%',
      label:   s.name,
    }))
  }, [spots])

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 5200)
  }

  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current) }, [slides.length])

  const goTo = (i) => {
    clearInterval(timerRef.current)
    setCurrent(i)
    startTimer()
  }

  // Disable nav dots if no slides
  const activeStyle = {
    width: 8, height: 8, borderRadius: '50%',
    background: '#fff', cursor: 'pointer', transition: 'all 0.3s',
    border: 'none', transform: 'scale(1.4)',
  }
  const dotStyle = {
    width: 8, height: 8, borderRadius: '50%',
    background: 'rgba(255,255,255,0.35)', cursor: 'pointer',
    transition: 'all 0.3s', border: 'none', transform: 'scale(1)',
  }

  const scrollTo = (id) => (e) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section style={styles.hero} aria-label="Calbayog destinations showcase">
      {slides.map((slide, i) => (
        <div key={i} style={{ ...styles.slide(i === current), backgroundImage: `url(${slide.image})`, backgroundPosition: slide.position }} aria-hidden={i !== current} />
      ))}

      <div style={styles.veil} aria-hidden="true" />
      <div style={styles.content}>
        <div style={styles.pill}>
          <span style={styles.pillDot} />
          <span>{slides[current]?.label || 'Explore Destinations'}</span>
        </div>

        <h1 style={styles.h1}>
          Explore the beauty of Calbayog City<br />
        </h1>

        <p style={styles.p}>
          Welcome to Calbayog City — Western Samar's crown jewel of majestic
          waterfalls, pristine beaches, ancient caves, and centuries of living
          Waray heritage.
        </p>

        <div style={styles.btns}>
          <a href="#destinations" style={styles.btnGold} onClick={scrollTo('destinations')}>Explore Destinations</a>
          <a href="#about" style={styles.btnOutline} onClick={scrollTo('about')}>About the City</a>
        </div>
      </div>

      <div style={styles.dots} role="group" aria-label="Slide navigation">
        {slides.map((slide, i) => (
          <button key={i} style={i === current ? activeStyle : dotStyle} onClick={() => goTo(i)} aria-label={slide.label} aria-current={i === current} />
        ))}
      </div>

      <div style={styles.caption} aria-live="polite">
        Now showing: <b style={{ color: 'rgba(255,255,255,0.85)' }}>{slides[current]?.label || '—'}</b>
      </div>
    </section>
  )
}
