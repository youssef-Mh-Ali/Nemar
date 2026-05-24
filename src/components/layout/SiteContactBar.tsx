import { Box, Container, IconButton, Typography } from '@mui/material'
import { Mail, MapPin, Instagram, Linkedin, Facebook, Phone, Youtube } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const TikTokIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.04 2C6.55 2 2.08 6.47 2.08 11.96c0 1.77.46 3.5 1.33 5.02L2 22l5.15-1.35a9.9 9.9 0 0 0 4.89 1.25h.01c5.49 0 9.96-4.47 9.96-9.96C22.01 6.47 17.54 2 12.04 2Zm0 17.99h-.01a8.3 8.3 0 0 1-4.22-1.16l-.3-.18-3.06.8.82-2.98-.2-.31a8.26 8.26 0 0 1-1.26-4.4c0-4.58 3.73-8.3 8.31-8.3 4.58 0 8.31 3.72 8.31 8.3 0 4.58-3.73 8.3-8.39 8.3Zm4.82-6.2c-.26-.13-1.53-.75-1.77-.84-.24-.09-.41-.13-.58.13-.17.26-.67.84-.82 1.01-.15.17-.3.2-.56.07-.26-.13-1.08-.4-2.06-1.27-.76-.68-1.27-1.52-1.42-1.78-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.39-.79-1.9-.21-.5-.43-.43-.58-.44h-.5c-.17 0-.45.06-.69.32-.24.26-.9.88-.9 2.15 0 1.27.92 2.5 1.05 2.68.13.17 1.81 2.76 4.38 3.87.61.26 1.08.42 1.45.54.61.19 1.16.16 1.6.1.49-.07 1.53-.62 1.75-1.22.22-.6.22-1.12.15-1.22-.06-.1-.23-.16-.49-.29Z" />
  </svg>
)

const SnapchatIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" />
  </svg>
)

export default function SiteContactBar() {
  const { t } = useTranslation()

  const socialLinks = [
    {
      icon: Instagram,
      href: 'https://www.instagram.com/faisalsaedanco?igsh=MXBvazg2d3lnNDQ4bQ==',
      label: t('share.instagram'),
      color: '#E4405F',
    },
    {
      icon: XIcon,
      href: 'https://x.com/FaisalSaedanCo',
      label: t('share.twitter'),
      color: '#000000',
    },
    {
      icon: Linkedin,
      href: 'https://www.linkedin.com/company/faisal-binsaedan/',
      label: t('share.linkedin'),
      color: '#0077B5',
    },
    {
      icon: WhatsAppIcon,
      href: 'https://wa.me/966920024010',
      label: t('share.whatsapp'),
      color: '#25D366',
    },
    {
      icon: Facebook,
      href: 'https://www.facebook.com/faisalsaedanco/',
      label: t('share.facebook'),
      color: '#1877F2',
    },
    {
      icon: SnapchatIcon,
      href: 'https://www.snapchat.com/@binsaedanco',
      label: t('share.snapchat'),
      color: '#FFFC00',
    },
    {
      icon: TikTokIcon,
      href: 'https://www.tiktok.com/@fbs.c?_r=1&_t=ZS-95iiXSKM2iI ',
      label: t('share.tiktok'),
      color: '#000000',
    },
    {
      icon: Youtube,
      href: 'https://www.youtube.com/@faisal-binsaedan',
      label: t('share.youtube', 'YouTube'),
      color: '#FF0000',
    },
  ]

  return (
    <Box
      component="aside"
      aria-label={t('siteContactBar.label')}
      sx={{ py: 6, px: { xs: 2, md: 3 }, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
          <Box
            component="a"
            href="tel:+966920024010"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <Phone size={20} />
            <Typography variant="body2" dir="ltr">
              {t('home.phone')}
            </Typography>
          </Box>
          <Box
            component="a"
            href={`mailto:${t('home.email')}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <Mail size={20} />
            <Typography variant="body2">{t('home.email')}</Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              color: 'text.secondary',
            }}
          >
            <MapPin size={20} />
            <Typography variant="body2">{t('home.address')}</Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <IconButton
                  key={social.label}
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderColor: social.color || 'primary.main',
                      '& svg': {
                        color: social.color || 'primary.main',
                      },
                    },
                  }}
                  aria-label={social.label}
                  title={social.label}
                >
                  <Icon size={20} />
                </IconButton>
              )
            })}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
