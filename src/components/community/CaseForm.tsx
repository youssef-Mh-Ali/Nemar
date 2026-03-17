import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../lib/store'
import { Unit } from '../../lib/types'

interface CaseFormProps {
  isOpen: boolean
  onClose: () => void
  units: Unit[]
  onSuccess?: () => void
}

export default function CaseForm({ isOpen, onClose, units }: CaseFormProps) {
  const { t, i18n } = useTranslation()
  const { user } = useAuthStore()

  const handleClose = () => {
    onClose()
  }

  const categoryOptions = [
    { value: 'electricity request', label: i18n.language === 'ar' ? 'طلب كهرباء' : 'Electricity request' },
    { value: 'gardening request', label: i18n.language === 'ar' ? 'طلب بستنة' : 'Gardening request' },
    { value: 'house keeping request', label: i18n.language === 'ar' ? 'طلب تنظيف منزلي' : 'House keeping request' },
    { value: 'car cleaning request', label: i18n.language === 'ar' ? 'طلب تنظيف سيارة' : 'Car cleaning request' },
    { value: 'payment plan change', label: i18n.language === 'ar' ? 'طلب تغيير خطة الدفع' : 'Payment plan change' },
    { value: 'leasing', label: i18n.language === 'ar' ? 'طلب تأجير' : 'Leasing request' },
    { value: 'other', label: i18n.language === 'ar' ? 'أخرى' : 'Other' },
  ]

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">{t('cases.title')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('cases.subtitle')}
            </Typography>
          </Box>
          <Button onClick={handleClose} sx={{ minWidth: 'auto', p: 1 }}>
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/*
          Web-to-Case Form
          Posts directly to Salesforce endpoint as per user requirement.
        */}
        <form action="https://webto.salesforce.com/servlet/servlet.WebToCase?encoding=UTF-8&orgId=00DdM00000rH4of" method="POST">
          <input type="hidden" name="orgid" value="00DdM00000rH4of" />
          <input type="hidden" name="retURL" value="https://realestatesf.netlify.app" />

          {/* Hidden inputs to capture user details automatically */}
          <input type="hidden" name="name" value={`${user?.firstName || ''} ${user?.lastName || ''}`} />
          <input type="hidden" name="email" value={user?.email || ''} />
          <input type="hidden" name="phone" value={user?.phone || ''} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {units.length > 0 && (
              <TextField
                select
                label={t('cases.form.unit')}
                fullWidth
                name="00NdM00000somethingCustomMaybe" // Assuming custom mapping or keeping in description if standard isn't available
                defaultValue=""
              >
                <MenuItem value="">{t('cases.form.chooseUnit')}</MenuItem>
                {units.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.unitNumber} - {i18n.language === 'ar' ? u.projectNameAr : u.projectName}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              select
              label={t('cases.form.type')}
              fullWidth
              name="subject"
              required
              defaultValue=""
            >
              {categoryOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={t('cases.form.details')}
              placeholder={t('cases.form.detailsPlaceholder')}
              fullWidth
              multiline
              rows={4}
              name="description"
              required
            />
          </Box>

          <DialogActions sx={{ px: 0, pt: 2 }}>
            <Button onClick={handleClose}>
              {t('cases.form.cancel')}
            </Button>
            <Button type="submit" variant="contained" name="submit">
              {t('cases.form.submit')}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  )
}

