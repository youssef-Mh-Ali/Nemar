import { useLocation, Link } from 'react-router-dom'
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material'
import { Home, Search, Building2, MoreHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function BottomNav() {
  const { t } = useTranslation()
  const location = useLocation()
  const currentPath = location.pathname

  const navItems = [
    { path: '/', label: t('common.home'), icon: Home },
    { path: '/search', label: t('common.search'), icon: Search },
    { path: '/community', label: t('common.community'), icon: Building2 },
    { path: '/contact', label: t('common.more'), icon: MoreHorizontal },
  ]

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

