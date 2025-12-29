import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import InstallBanner from './InstallBanner'

export default function Layout() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }} className="main-content">
        <Outlet />
      </main>
      <BottomNav />
      <InstallBanner />
    </div>
  )
}

