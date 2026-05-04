import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import Header from './Header'
import SiteContactBar from './SiteContactBar'
import Footer from './Footer'
import BottomNav from './BottomNav'
import InstallBanner from './InstallBanner'

export default function Layout() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Box
        component="main"
        className="main-content"
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <Outlet />
        </Box>
        <SiteContactBar />
        <Footer />
      </Box>
      <BottomNav />
      <InstallBanner />
    </div>
  )
}

