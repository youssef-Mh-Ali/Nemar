import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

/** Public asset: vertical FBS + Arabic wordmark (use PNG with alpha for transparent background) */
export const BRAND_LOGO_SRC = '/FBS_Logo_Vertical_AR.png'

type BrandLogoVariant = 'header' | 'footer' | 'login'

type BrandLogoProps = { variant: BrandLogoVariant }

/** Renders the brand logo with no wrapper background so transparent PNGs show correctly. */
export default function BrandLogo({ variant }: BrandLogoProps) {
  const { t } = useTranslation()

  const height =
    variant === 'header'
      ? { xs: 44, sm: 52 }
      : variant === 'footer'
        ? { xs: 40, sm: 48 }
        : { xs: 64, sm: 72 }

  const img = (
    <Box
      component="img"
      src={BRAND_LOGO_SRC}
      alt={t('home.title')}
      sx={{
        height,
        width: 'auto',
        display: 'block',
        mx: variant === 'login' ? 'auto' : undefined,
      }}
    />
  )

  if (variant === 'login') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        {img}
      </Box>
    )
  }

  return img
}
