import { Link, useLocation } from 'react-router-dom'
import { AppBar, Toolbar, Box, Button, IconButton } from '@mui/material'
import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '../../lib/store'

export default function Header() {
  const location = useLocation()
  const { user, clearAuth } = useAuthStore()

  const navItems = [
    { path: '/', label: 'الرئيسية' },
    { path: '/search', label: 'البحث' },
    { path: '/community', label: 'مجتمعي' },
    { path: '/contact', label: 'تواصل معنا' },
  ]

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
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px',
            }}
          >
            ب
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Box sx={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.2 }}>فيصل بن سعيدان</Box>
            <Box sx={{ fontSize: '10px', color: 'text.secondary', lineHeight: 1.2 }}>Faisal Bin Saedan</Box>
          </Box>
        </Link>

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
          {user ? (
            <>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '14px', color: 'text.secondary' }}>
                {user.firstName}
              </Box>
              <IconButton onClick={clearAuth} size="small" title="تسجيل الخروج">
                <LogOut size={20} />
              </IconButton>
            </>
          ) : (
            <Button component={Link} to="/login" variant="outlined" size="small" startIcon={<User size={16} />}>
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                تسجيل الدخول
              </Box>
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

