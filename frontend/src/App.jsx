// src/App.jsx — all styles inlined (App.css removed)

import { useState, useEffect, useCallback, Component } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { seedStorage, storage } from './hooks/useStorage'
import { useSpots, useEvents } from './hooks/useStorage'
import { useAuth } from './context/AuthContext'

import Navbar              from './components/Navbar'
import Hero                from './components/Hero'
import EventsSection       from './components/EventsSection'
import NewsSection         from './components/NewsSection'
import DestinationsSection from './components/DestinationsSection'
import FeaturesSection     from './components/FeaturesSection'
import AboutSection        from './components/AboutSection'
import Footer              from './components/Footer'
import SpotModal           from './components/SpotModal'
import AdminDashboard      from './components/AdminDashboard'
import { ToastProvider, useToast } from './components/Toast'
import NewsPage            from './pages/NewsPage'
import ContactPage         from './pages/ContactPage'
import AdminLoginPage      from './pages/AdminLoginPage'
import AdminForgotPassword from './pages/AdminForgotPassword'

// Global CSS kept for: CSS variables, reset, keyframe animations, curtain
import './index.css'

seedStorage()

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('Uncaught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          background: '#fee',
          color: '#c00',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap'
        }}>
          <h1>Something went wrong:</h1>
          <pre>{this.state.error?.toString()}</pre>
          <details style={{ marginTop: '20px' }}>
            <summary>Stack trace</summary>
            <pre>{this.state.errorInfo?.componentStack || 'No stack'}</pre>
          </details>
          <button onClick={() => window.location.reload()} style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#c00',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function AppInner() {
  const toast = useToast()
  const { user, isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [theme,     setTheme]     = useState(() => storage.getTheme())
  const [view,      setView]      = useState('site') // 'site' | 'dashboard'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    storage.setTheme(theme)
  }, [theme])

  // Redirect admin from public pages to dashboard
  useEffect(() => {
    if (loading) return
    
    // If admin is on any public page (except /admin/login), redirect to dashboard
    if (user && isAdmin() && view === 'site' && !location.pathname.includes('/admin')) {
      setView('dashboard')
    } else if (!user && view === 'dashboard') {
      setView('site')
    }
  }, [user, view, loading, location.pathname])

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

   const { spots, refreshSpots } = useSpots()
   const { events, refreshEvents } = useEvents()

   const [activeSpotId, setActiveSpotId] = useState(null)

   const activeSpot = activeSpotId ? spots.find(s => s.id === activeSpotId) ?? null : null
   const activeAvg   = activeSpotId ? activeSpot?.rating_average || 0 : 0

   const openModal  = useCallback((id) => setActiveSpotId(id), [])
   const closeModal = useCallback(() => setActiveSpotId(null), [])

   // Called when already logged in and clicking Dashboard button
   const handleOpenDashboard = useCallback(() => {
     if (isAdmin()) {
       setView('dashboard')
     }
   }, [isAdmin])

  // Redirect to dashboard if admin and viewing dashboard
  if (view === 'dashboard' && !isAdmin()) {
    setView('site')
  }

  if (view === 'dashboard') {
    return (
      <AdminDashboard
        onExit={() => {
          setView('site')
        }}
        refreshSpots={refreshSpots}
        refreshEvents={refreshEvents}
      />
    )
  }

  const appStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  }

  const mainStyle = { flex: 1 }

  return (
    <div style={appStyle}>
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenDashboard={handleOpenDashboard}
      />
      <main id="main-content" style={mainStyle}>
        <Routes>
          <Route path="/" element={
            <>
              <Hero spots={spots} />
              <EventsSection events={events} />
              <NewsSection />
              <DestinationsSection
                spots={spots}
                onViewDetails={openModal}
              />
              <FeaturesSection />
              <AboutSection />
            </>
          } />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/forgotpassword" element={<AdminForgotPassword />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      {activeSpot && (
        <SpotModal
          spot={activeSpot}
          avg={activeAvg}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <AppInner />
      </ErrorBoundary>
    </ToastProvider>
  )
}
