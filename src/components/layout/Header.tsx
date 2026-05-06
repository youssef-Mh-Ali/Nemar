import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Box, Button, IconButton } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { LogOut, User, Search, ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../lib/store'
import { logout } from '../../lib/api-client'
import LanguageToggle from '../ui/LanguageToggle'
import BrandLogo from './BrandLogo'

/** True when this nav item should show as the current page (nested routes included; home is exact). */
function isNavPathActive(pathname: string, itemPath: string): boolean {
  if (itemPath === '/') return pathname === '/'
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`)
}

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'

  const navItems = [
    { path: '/', label: t('common.home') },
    { path: '/about-us', label: t('common.aboutUs') },
    { path: '/achievements', label: t('common.achievements') },
    { path: '/community', label: t('common.community') },
    { path: '/contact', label: t('common.contact') },
  ]

  const canShowBack = location.pathname !== '/'
  const onBack = () => {
    // If the user landed directly (no prior in-app history), fallback to home.
    if (window.history.length <= 1) {
      navigate('/')
      return
    }
    navigate(-1)
  }

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 1px 0 0 rgba(0,0,0,0.1)',
      }}
      className="safe-top"
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {canShowBack && (
            <IconButton
              onClick={onBack}
              size="small"
              title={t('common.back')}
              aria-label={t('common.back')}
              sx={{
                color: 'text.secondary',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1.5,
                '&:hover': {
                  bgcolor: 'action.hover',
                  color: 'primary.main',
                  borderColor: 'primary.main',
                },
              }}
            >
              {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            </IconButton>
          )}

          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <BrandLogo variant="header" />
          </Link>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center' }}>
          {navItems.map((item) => {
            const active = isNavPathActive(location.pathname, item.path)
            return (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                sx={(theme) => ({
                  color: active ? 'primary.main' : 'text.secondary',
                  fontWeight: active ? 600 : 500,
                  bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                  borderRadius: 2,
                  px: 1.5,
                  '&:hover': {
                    bgcolor: active ? alpha(theme.palette.primary.main, 0.18) : 'action.hover',
                  },
                })}
              >
                {item.label}
              </Button>
            )
          })}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            component={Link}
            to="/search"
            size="small"
            title={t('common.search')}
            aria-label={t('common.search')}
            aria-current={location.pathname.startsWith('/search') ? 'page' : undefined}
            sx={(theme) => {
              const onSearch = location.pathname.startsWith('/search')
              return {
                color: onSearch ? 'primary.main' : 'text.secondary',
                bgcolor: onSearch ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                border: 1,
                borderColor: onSearch ? 'primary.main' : 'divider',
                borderRadius: 1.5,
                '&:hover': {
                  bgcolor: onSearch ? alpha(theme.palette.primary.main, 0.18) : 'action.hover',
                  color: 'primary.main',
                  borderColor: 'primary.main',
                },
              }
            }}
          >
            <Search size={18} />
          </IconButton>
          <LanguageToggle />
          {user ? (
            <>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '14px', color: 'text.secondary' }}>
                {user.firstName}
              </Box>
              <IconButton
                onClick={async () => {
                  try {
                    await logout()
                  } finally {
                    clearAuth()
                  }
                }}
                size="small"
                title={t('common.logout')}
              >
                <LogOut size={20} />
              </IconButton>
            </>
          ) : (
            <Button
              component={Link}
              to="/login"
              variant="outlined"
              size="small"
              startIcon={<User size={18} />}
              sx={{
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.75, sm: 0.875 },
                minWidth: { xs: 'auto', sm: 'auto' },
                gap: 0.5,
                borderRadius: 1.5,
                borderWidth: 1.5,
                fontWeight: 500,
                '& .MuiButton-startIcon': {
                  margin: 0,
                  marginRight: { xs: 0, sm: 0.5 },
                  display: 'flex',
                  alignItems: 'center',
                },
                '&:hover': {
                  borderWidth: 1.5,
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  display: { xs: 'none', sm: 'inline' },
                  lineHeight: 1.5,
                }}
              >
                {t('common.login')}
              </Box>
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

