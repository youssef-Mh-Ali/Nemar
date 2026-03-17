import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material'
import { Language } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useState, MouseEvent } from 'react'

interface LanguageToggleProps {
  sx?: object
  color?: 'inherit' | 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
}

export default function LanguageToggle({ sx, color = 'inherit' }: LanguageToggleProps) {
  const { i18n } = useTranslation()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    // Update HTML lang attribute
    document.documentElement.lang = lng
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'
    handleClose()
  }

  const currentLang = i18n.language || 'ar'
  const languages = [
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'English' },
  ]

  return (
    <>
      <Tooltip title="اللغة / Language">
        <IconButton onClick={handleClick} size="small" sx={sx} color={color}>
          <Language />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            selected={currentLang === lang.code}
            sx={{
              fontWeight: currentLang === lang.code ? 'bold' : 'normal',
            }}
          >
            {lang.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

