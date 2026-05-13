import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { BottomNavigation, BottomNavigationAction, Paper, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Home, Search, Users, Building2, MoreHorizontal, Trophy, MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function BottomNav() {
  const { t } = useTranslation()
  const location = useLocation()
  const currentPath = location.pathname

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleOpenMore = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMore = () => {
    setAnchorEl(null)
  }

  const visibleItems = [
    { path: '/', label: t('common.home'), icon: Home },
    { path: '/search', label: t('common.search'), icon: Search },
    { path: '/achievements', label: t('common.achievements'), icon: Trophy },
  ]

  const moreItems = [
    { path: '/community', label: t('common.community'), icon: Building2 },
    { path: '/about-us', label: t('common.aboutUs'), icon: Users },
    { path: '/contact', label: t('common.contact'), icon: MessageSquare },
  ]

  const isMoreActive = moreItems.some(item => item.path === currentPath)

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
        value={isMoreActive ? 'more' : currentPath}
        sx={{
          backgroundColor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            minWidth: 0,
            padding: '6px 0',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
        }}
      >
        {visibleItems.map((item) => {
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
        
        <BottomNavigationAction
          label={t('common.more')}
          icon={<MoreHorizontal size={20} />}
          value="more"
          onClick={handleOpenMore}
        />
      </BottomNavigation>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMore}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: (theme) => ({
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(16px)',
            borderRadius: '12px',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            minWidth: '200px',
            mb: 1,
            '& .MuiMenuItem-root': {
              py: 1.5,
              '&.active': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
              },
            },
          }),
        }}
      >
        {moreItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPath === item.path
          return (
            <MenuItem
              key={item.path}
              component={Link}
              to={item.path}
              onClick={handleCloseMore}
              selected={isActive}
              className={isActive ? 'active' : ''}
            >
              <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit' }}>
                <Icon size={20} />
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.95rem'
                }} 
              />
            </MenuItem>
          )
        })}
      </Menu>
    </Paper>
  )
}


