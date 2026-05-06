import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, useAppStore } from './lib/store'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Search from './pages/Search'
import UnitDetails from './pages/UnitDetails'
import Login from './pages/Login'
import Community from './pages/Community'
import Contact from './pages/Contact'
import Offline from './pages/Offline'
import ComingSoon from './pages/ComingSoon'
import Toast from './components/ui/Toast'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { isMaintenanceAuthorized } = useAppStore()
  
  if (!isMaintenanceAuthorized) {
    return <ComingSoon />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <MaintenanceGate>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="unit/:id" element={<UnitDetails />} />
          <Route path="contact" element={<Contact />} />
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
    </MaintenanceGate>
  )
}

export default App;
