import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Phone, CheckCircle2, Building2, Layout, Database, MessageCircle } from 'lucide-react'
import { Box, Container, Typography, Button, Grid, styled } from '@mui/material'
import { useTranslation } from 'react-i18next'
import LanguageToggle from '../components/ui/LanguageToggle'

const HeroSection = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(4, 0),
}))

const GradientBackground = styled(Box)({
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    opacity: 0.2,
    '&::before': {
        content: '""',
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(184, 146, 64, 0.4) 0%, transparent 70%)',
        filter: 'blur(120px)',
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '-10%',
        left: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 70%)',
        filter: 'blur(120px)',
    }
})

const FeatureCard = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
    transition: 'transform 0.3s ease-in-out',
    height: '100%',
    '&:hover': {
        transform: 'translateY(-5px)',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    }
}))

const GoldBadge = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: '8px 16px',
    borderRadius: '100px',
    backgroundColor: 'rgba(184, 146, 64, 0.1)',
    border: '1px solid rgba(184, 146, 64, 0.2)',
    color: '#d4af37',
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: theme.spacing(4),
}))

const OwnershipCard = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: '24px',
    backgroundColor: '#d4af37',
    color: '#0a0a0a',
    textAlign: 'center',
    minWidth: '300px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
}))

const BrokerLanding = () => {
    const { t, i18n } = useTranslation()
    const isRtl = i18n.language.startsWith('ar')

    const features = [
        {
            icon: <Database style={{ color: '#d4af37' }} />,
            title: t('brokerLanding.features.salesforce.title'),
            desc: t('brokerLanding.features.salesforce.desc')
        },
        {
            icon: <Layout style={{ color: '#d4af37' }} />,
            title: t('brokerLanding.features.pwa.title'),
            desc: t('brokerLanding.features.pwa.desc')
        },
        {
            icon: <CheckCircle2 style={{ color: '#d4af37' }} />,
            title: t('brokerLanding.features.ready.title'),
            desc: t('brokerLanding.features.ready.desc')
        }
    ]

    return (
        <HeroSection>
            <GradientBackground />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
                <Box textAlign="center" maxWidth="800px" mx="auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <GoldBadge>
                            <Building2 size={16} />
                            <span>{t('brokerLanding.badge')}</span>
                        </GoldBadge>

                        <Box sx={{ position: 'absolute', top: 20, right: isRtl ? 'auto' : 20, left: isRtl ? 20 : 'auto' }}>
                            <LanguageToggle />
                        </Box>

                        <Typography
                            variant="h1"
                            sx={{
                                fontSize: { xs: '2.5rem', md: '4rem' },
                                fontWeight: 800,
                                mb: 3,
                                background: 'linear-gradient(to bottom, #ffffff, #888888)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                lineHeight: 1.1
                            }}
                        >
                            {t('brokerLanding.title')}
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                fontSize: '1.25rem',
                                color: 'rgba(255, 255, 255, 0.6)',
                                mb: 6,
                                lineHeight: 1.6
                            }}
                        >
                            {t('brokerLanding.description')}
                        </Typography>

                        <Grid container spacing={3} sx={{ mb: 8 }}>
                            {features.map((feature, i) => (
                                <Grid key={i} size={{ xs: 12, md: 4 }}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + i * 0.1 }}
                                    >
                                        <FeatureCard>
                                            <Box mb={2}>{feature.icon}</Box>
                                            <Typography variant="h6" fontWeight="600" mb={1}>
                                                {feature.title}
                                            </Typography>
                                            <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
                                                {feature.desc}
                                            </Typography>
                                        </FeatureCard>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>

                        <Box
                            display="flex"
                            flexDirection={{ xs: 'column', md: 'row' }}
                            alignItems="center"
                            justifyContent="center"
                            gap={4}
                        >
                            <OwnershipCard>
                                <Typography variant="overline" fontWeight="700" letterSpacing={2}>
                                    {t('brokerLanding.ownershipRights')}
                                </Typography>
                                <Typography variant="h2" fontWeight="900" mt={1} sx={{ direction: 'ltr' }}>
                                    {t('brokerLanding.priceUSD')}<Typography component="span" variant="h5" fontWeight="400" sx={{ ml: 0.5 }}>{t('brokerLanding.perMonth')}</Typography>
                                </Typography>
                                <Typography variant="h6" fontWeight="600" mb={2} sx={{ opacity: 0.9, color: 'rgba(10, 10, 10, 0.7)' }}>
                                    ≈ {t('brokerLanding.priceSAR')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                                    <Button
                                        component="a"
                                        href="tel:+201069239231"
                                        variant="contained"
                                        sx={{
                                            bgcolor: '#0a0a0a',
                                            color: 'white',
                                            borderRadius: '100px',
                                            padding: '12px 32px',
                                            fontWeight: 700,
                                            '&:hover': { bgcolor: '#1a1a1a' }
                                        }}
                                        startIcon={<Phone size={18} />}
                                    >
                                        <Box component="span" sx={{ direction: 'ltr', display: 'inline-block', ml: -0.5 }}>
                                            +20 106 923 9231
                                        </Box>
                                    </Button>
                                    <Button
                                        component="a"
                                        href="https://wa.me/201069239231"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="contained"
                                        sx={{
                                            bgcolor: '#25D366',
                                            color: 'white',
                                            borderRadius: '100px',
                                            padding: '12px 32px',
                                            fontWeight: 700,
                                            '&:hover': { bgcolor: '#128C7E' },
                                            '& .MuiButton-startIcon': {
                                                marginRight: isRtl ? 0 : 1,
                                                marginLeft: isRtl ? 1 : 0
                                            }
                                        }}
                                        startIcon={<MessageCircle size={18} />}
                                    >
                                        {t('brokerLanding.whatsapp')}
                                    </Button>
                                </Box>
                            </OwnershipCard>

                            <Box display="flex" flexDirection="column" gap={2}>
                                <Button
                                    component={Link}
                                    to="/demo"
                                    variant="outlined"
                                    sx={{
                                        color: 'white',
                                        borderColor: 'white',
                                        borderRadius: '100px',
                                        padding: '16px 40px',
                                        fontSize: '1.125rem',
                                        fontWeight: 700,
                                        '&:hover': {
                                            bgcolor: 'white',
                                            color: '#0a0a0a',
                                            boxShadow: '0 0 30px rgba(255,255,255,0.2)'
                                        }
                                    }}
                                >
                                    {t('brokerLanding.viewDemo')}
                                </Button>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontStyle: 'italic' }}>
                                    {t('brokerLanding.demoDesc')}
                                </Typography>
                            </Box>
                        </Box>
                    </motion.div>
                </Box>
            </Container>

            <Box
                component="footer"
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    py: 4,
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    textAlign: 'center'
                }}
            >
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                    &copy; {new Date().getFullYear()} {t('brokerLanding.copyright')}
                </Typography>
            </Box>
        </HeroSection>
    )
}

export default BrokerLanding
