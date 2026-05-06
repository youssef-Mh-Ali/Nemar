import { Link as RouterLink } from 'react-router-dom'
import { Box, Container, Link, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import BrandLogo from './BrandLogo'

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  const links = [
    { path: '/', label: t('common.home') },
    { path: '/about-us', label: t('common.aboutUs') },
    { path: '/achievements', label: t('common.achievements') },
    { path: '/community', label: t('common.community') },
    { path: '/contact', label: t('common.contact') },
    { path: '/search', label: t('common.search') },
  ]

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        borderTop: 1,
        borderColor: 'divider',
        py: { xs: 2, md: 2},
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <RouterLink to="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <BrandLogo variant="footer" />
          </RouterLink>

          <Box
            component="nav"
            aria-label={t('footer.nav')}
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 1.5, sm: 2 },
              justifyContent: 'center',
            }}
          >
            {links.map((item) => (
              <Link
                key={item.path}
                component={RouterLink}
                to={item.path}
                underline="hover"
                color="text.secondary"
                variant="body2"
                sx={{ fontWeight: 500 }}
              >
                {item.label}
              </Link>
            ))}
          </Box>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          component="p"
          sx={{ textAlign: 'center', mt: 2.5, mb: 0 }}
        >
          {t('footer.copyright', { year })}
        </Typography>
      </Container>
    </Box>
  )
}
