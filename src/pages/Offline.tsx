import { Box, Typography, Button, Container } from '@mui/material'
import { WifiOff, RefreshCcw } from 'lucide-react'

export default function Offline() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', py: 4 }}>
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
          }}
        >
          <WifiOff size={40} color="#718096" />
        </Box>

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          لا يوجد اتصال بالإنترنت
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          يبدو أنك غير متصل بالإنترنت. تحقق من اتصالك وحاول مرة أخرى.
        </Typography>

        <Button variant="contained" size="large" onClick={handleRefresh} startIcon={<RefreshCcw size={20} />}>
          إعادة المحاولة
        </Button>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: 'block' }}>
          فيصل بن سعيدان | Faisal Bin Saedan
        </Typography>
      </Box>
    </Container>
  )
}

