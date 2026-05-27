// ═══════════════════════════════════════════════════════════
//  src/components/Navbar.jsx  — all styles inlined
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { storage } from '../hooks/useStorage'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ theme, onToggleTheme, onOpenDashboard }) {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [loggedIn,  setLoggedIn]  = useState(() => storage.isLoggedIn())
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  // Responsive breakpoint
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768
    }
    return false
  })

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth > 768) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.navbar')) setMenuOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setLoggedIn(false)
  }

  const navStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 1000,
    transition: 'background 0.35s, box-shadow 0.35s',
    ...(scrolled && {
      background: 'rgba(255,255,255,0.94)',
      backdropFilter: 'blur(22px)',
      boxShadow: '0 1px 0 #e4dfd5, 0 2px 12px rgba(0,0,0,0.07)',
    }),
  }

  const navInnerStyle = {
    maxWidth: 1280,
    margin: '0 auto',
    padding: isMobile ? '0 16px' : '0 40px',
    height: isMobile ? 56 : 68,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const brandStyle = {
    display: 'flex', alignItems: 'center', gap: 12,
    textDecoration: 'none', color: 'inherit',
  }

  const logoStyle = {
    width: isMobile ? 32 : 40, height: isMobile ? 32 : 40, borderRadius: 10,
    background: scrolled ? 'rgba(26,107,74,0.1)' : 'rgba(255,255,255,0.16)',
    border: `1px solid ${scrolled ? 'transparent' : 'rgba(255,255,255,0.28)'}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: isMobile ? 14 : 18, flexShrink: 0, transition: 'background 0.3s',
  }

  const titleStyle = {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: isMobile ? '0.85rem' : '1.02rem', fontWeight: 700,
    color: scrolled ? '#1a6b4a' : '#fff',
    transition: 'color 0.3s', lineHeight: 1.2,
  }

  const subStyle = {
    fontSize: '0.64rem',
    color: scrolled ? '#6b7280' : 'rgba(255,255,255,0.55)',
    letterSpacing: '0.07em', transition: 'color 0.3s',
    display: isMobile ? 'none' : 'block',
  }

  const linksStyle = {
    display: isMobile ? (menuOpen ? 'flex' : 'none') : 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'flex-start' : 'center',
    gap: isMobile ? 0 : 4,
    listStyle: 'none', margin: 0,
    padding: isMobile ? '20px' : 0,
    position: isMobile ? 'absolute' : 'static',
    top: isMobile ? (scrolled ? 56 : 68) : 'auto',
    left: 0,
    right: 0,
    background: isMobile ? (scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(15,74,50,0.98)') : 'transparent',
    backdropFilter: isMobile ? 'blur(10px)' : 'none',
    boxShadow: isMobile ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
  }

  const linkBase = {
    padding: '7px 14px', borderRadius: 8,
    fontSize: '0.875rem', fontWeight: 500,
    color: scrolled ? '#6b7280' : 'rgba(255,255,255,0.85)',
    transition: 'all 0.25s', background: 'none', border: 'none',
    cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif",
    textDecoration: 'none',
  }

  const actionsStyle = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 10,
    zIndex: 1001,
  }

  const btnThemeStyle = {
    width: 36, height: 36, borderRadius: 8,
    background: scrolled ? '#e4dfd5' : 'rgba(255,255,255,0.14)',
    border: `1px solid ${scrolled ? '#e4dfd5' : 'rgba(255,255,255,0.25)'}`,
    color: scrolled ? '#6b7280' : '#fff',
    fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.25s', cursor: 'pointer',
  }

  const btnAdminStyle = {
    padding: '8px 18px', borderRadius: 8,
    border: `1.5px solid ${scrolled ? '#1a6b4a' : 'rgba(255,255,255,0.55)'}`,
    color: scrolled ? '#1a6b4a' : '#fff',
    fontSize: '0.83rem', fontWeight: 600, transition: 'all 0.25s',
    textDecoration: 'none', background: 'none', cursor: 'pointer',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  }

  const hamburgerStyle = {
    display: isMobile ? 'flex' : 'none',
    flexDirection: 'column',
    justifyContent: 'space-around',
    width: 24,
    height: 20,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    zIndex: 1001,
  }

  const hamburgerLineStyle = {
    width: '100%',
    height: 2,
    backgroundColor: scrolled ? '#1a6b4a' : '#fff',
    borderRadius: 2,
    transition: 'all 0.3s ease',
    transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
  }

  return (
    <header className="navbar" style={navStyle}>
      <div style={navInnerStyle}>
        <a href="/" style={brandStyle} aria-label="Lakbay Calbayog Home">
          <div style={logoStyle}>🌿</div>
          <div>
            <div style={titleStyle}>Lakbay Calbayog</div>
            <div style={subStyle}>Tourism Management System</div>
          </div>
        </a>

        {/* Mobile hamburger button */}
        <button 
          style={hamburgerStyle} 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span style={hamburgerLineStyle}></span>
          <span style={{...hamburgerLineStyle, opacity: menuOpen ? 0 : 1}}></span>
          <span style={{...hamburgerLineStyle, transform: menuOpen ? 'rotate(-45deg) translate(-5px, 5px)' : 'none'}}></span>
        </button>

        <nav aria-label="Main navigation">
          <ul style={linksStyle}>
            <li><Link to="/" style={{ ...linkBase, color: scrolled ? '#1a6b4a' : '#fff' }}>Home</Link></li>
            <li><button style={linkBase} onClick={() => scrollTo('destinations')}>Destinations</button></li>
            <li><Link to="/news" style={linkBase}>News</Link></li>
            <li><Link to="/contact" style={linkBase}>Contact</Link></li>
            <li><button style={linkBase} onClick={() => scrollTo('about')}>About</button></li>
          </ul>
        </nav>

         <div style={actionsStyle}>
           <button style={btnThemeStyle} onClick={onToggleTheme} aria-label="Toggle dark mode">
             {theme === 'dark' ? '☀️' : '🌙'}
           </button>
           {user ? (
             <>
               {isAdmin() && (
                 <button
                   onClick={onOpenDashboard}
                   style={btnAdminStyle}
                 >
                   🛡️ Dashboard
                 </button>
               )}
               <button
                 onClick={handleLogout}
                 style={{ ...btnAdminStyle, color: '#dc2626' }}
               >
                 Logout
               </button>
             </>
           ) : null}
         </div>
       </div>
     </header>
   )
 }
