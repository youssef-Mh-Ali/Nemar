import { useLocation, Link } from 'react-router-dom'
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Home, Search, Users, Building2, MoreHorizontal, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function BottomNav() {
  const { t } = useTranslation()
  const location = useLocation()
  const currentPath = location.pathname

  const navItems = [
    { path: '/', label: t('common.home'), icon: Home },
    { path: '/search', label: t('common.search'), icon: Search },
    { path: '/about-us', label: t('common.aboutUs'), icon: Users },
    { path: '/achievements', label: t('common.achievements'), icon: Trophy },
    { path: '/community', label: t('common.community'), icon: Building2 },
    { path: '/contact', label: t('common.more'), icon: MoreHorizontal },
  ]

  return (
    <Paper
      sx={(theme) => ({
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: { xs: 'block', md: 'none' },
        backgroundColor: alpha(theme.palette.background.paper, 0.6),
        backdropFilter: 'blur(16px)',
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.05)',
      })}
      elevation={0}
      className="safe-bottom"
    >
      <BottomNavigation
        value={currentPath}
        sx={{
          backgroundColor: 'transparent',
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

