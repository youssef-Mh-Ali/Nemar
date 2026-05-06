import { Box, Typography, Button, Container } from '@mui/material'
import { Handshake } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function CollaborationComingSoon() {
  const { t } = useTranslation()

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 }, px: { xs: 2, md: 3 } }}>
      <Box sx={{ textAlign: 'center', width: '100%' }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'grey.100',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            color: 'primary.main',
          }}
        >
          <Handshake sx={{ fontSize: 40 }} />
        </Box>

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('collaboration.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
          {t('collaboration.description')}
        </Typography>

        <Button component={Link} to="/" variant="contained" size="large">
          {t('collaboration.backToHome')}
        </Button>
      </Box>
    </Container>
  )
}
