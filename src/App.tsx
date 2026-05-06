import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './lib/store'
import { getCurrentUser } from './lib/api-client'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Search from './pages/Search'
import UnitDetails from './pages/UnitDetails'
import ProjectDetails from './pages/ProjectDetails'
import Login from './pages/Login'
import Community from './pages/Community'
import Contact from './pages/Contact'
import Offline from './pages/Offline'
import AboutUs from './pages/AboutUs'
import Achievements from './pages/Achievements'
import CollaborationComingSoon from './pages/CollaborationComingSoon'
import Toast from './components/ui/Toast'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return null
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  const { setAuth, clearAuth, setLoading } = useAuthStore()

  useEffect(() => {
    let mounted = true
    async function hydrate() {
      setLoading(true)
      try {
        const res = await getCurrentUser()
        if (!mounted) return
        if (res.success && res.data) {
          setAuth(res.data, null)
        } else {
          clearAuth()
        }
      } catch {
        if (mounted) clearAuth()
      } finally {
        if (mounted) setLoading(false)
      }
    }
    hydrate()
    return () => {
      mounted = false
    }
  }, [setAuth, clearAuth, setLoading])

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="project/:id" element={<ProjectDetails />} />
          <Route path="unit/:id" element={<UnitDetails />} />
          <Route path="contact" element={<Contact />} />
          <Route path="about-us" element={<AboutUs />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="collaboration-coming-soon" element={<CollaborationComingSoon />} />
          <Route
            path="community"
            element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/offline" element={<Offline />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </>
  )
}

export default App;
