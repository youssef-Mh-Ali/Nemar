import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Box, Button, IconButton } from '@mui/material'
import { LogOut, User, Search, ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../lib/store'
import { logout } from '../../lib/api-client'
import LanguageToggle from '../ui/LanguageToggle'

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
          <Box
            component="img"
            src="/FBS%20logo%20acronim.svg"
            alt={t('home.title')}
            sx={{
              height: { xs: 22, sm: 30 },
              width: 'auto',
            }}
          />
          </Link>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              sx={{
                color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                bgcolor: location.pathname === item.path ? 'primary.main' + '10' : 'transparent',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            component={Link}
            to="/search"
            size="small"
            title={t('common.search')}
            aria-label={t('common.search')}
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

