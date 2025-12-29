import { useLocation, Link } from 'react-router-dom'
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material'
import { Home, Search, Building2, MoreHorizontal } from 'lucide-react'

const navItems = [
  { path: '/', label: 'الرئيسية', icon: Home },
  { path: '/search', label: 'البحث', icon: Search },
  { path: '/community', label: 'مجتمعي', icon: Building2 },
  { path: '/contact', label: 'المزيد', icon: MoreHorizontal },
]

export default function BottomNav() {
  const location = useLocation()
  const currentPath = location.pathname

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: { xs: 'block', md: 'none' },
      }}
      elevation={3}
      className="safe-bottom"
    >
      <BottomNavigation
        value={currentPath}
        sx={{
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <BottomNavigationAction
              key={item.path}
              component={Link}
              to={item.path}
              label={item.label}
              icon={<Icon size={20} />}
              value={item.path}
            />
          )
        })}
      </BottomNavigation>
    </Paper>
  )
}

