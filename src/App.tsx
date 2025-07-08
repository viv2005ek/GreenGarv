import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Navigation } from './components/Navigation'
import { Home } from './pages/Home'
import { Auth } from './pages/Auth'
import { Dashboard } from './pages/Dashboard'
import { CarbonTracker } from './pages/CarbonTracker'
import { ProductScanner } from './pages/ProductScanner'
import { RecyclingGuide } from './pages/RecyclingGuide'
import { useAuth } from './hooks/useAuth'
import { LoadingScreen } from './pages/LoadingScreen'


function App() {
  const { user, loading } = useAuth()
  const [showLoading, setShowLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        setShowLoading(false)
      }
    }, 5000) // 5 seconds minimum

    if (!loading) {
      // If loading becomes false before 5 seconds, still wait
      const wait = setTimeout(() => setShowLoading(false), 5000)
      return () => clearTimeout(wait)
    }

    return () => clearTimeout(timer)
  }, [loading])

  if (loading || showLoading) {
    return <LoadingScreen />
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />
       
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
          <Route path="/tracker" element={user ? <CarbonTracker /> : <Navigate to="/auth" />} />
          <Route path="/scan" element={user ? <ProductScanner /> : <Navigate to="/auth" />} />
          <Route path="/recycle" element={user ? <RecyclingGuide /> : <Navigate to="/auth" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
