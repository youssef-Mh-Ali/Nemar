import { useState, useEffect } from 'react'
import {
  Box,
  Dialog,
  DialogContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  alpha,
  Divider,
} from '@mui/material'
import { X, ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const SAKANI_LOGO = '/SakaniLogo.jpg'

export const SakaniMathIcon = ({ color = 'currentColor', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <line x1="7" y1="17" x2="17" y2="7" />
    <line x1="7" y1="9" x2="11" y2="9" />
    <line x1="9" y1="7" x2="9" y2="11" />
    <line x1="13" y1="15" x2="17" y2="15" />
  </svg>
)

interface FinanceCalculatorModalProps {
  isOpen: boolean
  onClose: () => void
  propertyPrice: number
  onBookClick?: () => void
}

export default function FinanceCalculatorModal({
  isOpen,
  onClose,
  propertyPrice: initialPropertyPrice,
  onBookClick,
}: FinanceCalculatorModalProps) {
  const { i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'

  // Form Inputs State
  const [propertyPrice, setPropertyPrice] = useState<string>('')
  const [monthlyIncome, setMonthlyIncome] = useState<string>('')
  const [obligations, setObligations] = useState<string>('')
  const [period, setPeriod] = useState<string>('20')
  const [interestRate, setInterestRate] = useState<string>('4.5')
  const [downPayment, setDownPayment] = useState<string>('10')
  const [isFirstHome, setIsFirstHome] = useState<boolean>(true)
  const [isSupported, setIsSupported] = useState<boolean>(true)

  // View State (0 = Form, 1 = Results)
  const [viewState, setViewState] = useState<number>(0)

  // Calculations Results State
  const [results, setResults] = useState<{
    monthlyInstallment: string
    totalFinancing: string
    totalInterest: string
    endDateLabel: string
    isExempt: boolean
    downPaymentAmount: string
    originalPrincipal: string
    subsidyAmount: string
  } | null>(null)

  // Prefill price when prop changes or modal opens
  useEffect(() => {
    if (isOpen && initialPropertyPrice) {
      setPropertyPrice(String(initialPropertyPrice))
      // Reset views
      setViewState(0)
      setMonthlyIncome('')
      setObligations('')
      setPeriod('20')
      setInterestRate('4.5')
      setDownPayment('10')
      setIsFirstHome(true)
      setIsSupported(true)
    }
  }, [isOpen, initialPropertyPrice])

  const handleClear = () => {
    setPropertyPrice(initialPropertyPrice ? String(initialPropertyPrice) : '')
    setMonthlyIncome('')
    setObligations('')
    setPeriod('20')
    setInterestRate('4.5')
    setDownPayment('10')
    setIsFirstHome(true)
    setIsSupported(true)
  }

  const handleCalculate = () => {
    const price = parseFloat(propertyPrice) || 0
    const income = parseFloat(monthlyIncome) || 0
    const bankObligations = parseFloat(obligations) || 0
    const years = parseFloat(period) || 20
    const rate = parseFloat(interestRate) || 0
    const downPaymentPct = parseFloat(downPayment) || 10

    // Core mortgage calculations
    const downAmt = price * (downPaymentPct / 100)
    const principal = Math.max(0, price - downAmt)
    const totalMonths = years * 12
    const monthlyRate = (rate / 100) / 12

    let rawMonthlyPayment = 0
    if (monthlyRate > 0) {
      rawMonthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
    } else {
      rawMonthlyPayment = principal / totalMonths
    }

    const rawTotalFinancing = rawMonthlyPayment * totalMonths
    const rawTotalInterest = Math.max(0, rawTotalFinancing - principal)

    // Sakani interest subsidy tiered logic
    let subsidyPct = 0
    if (isSupported) {
      if (income <= 14000) {
        subsidyPct = 100
      } else if (income <= 15000) {
        subsidyPct = 95
      } else if (income <= 16000) {
        subsidyPct = 90
      } else if (income <= 17000) {
        subsidyPct = 85
      } else if (income <= 18000) {
        subsidyPct = 80
      } else if (income <= 19000) {
        subsidyPct = 75
      } else if (income <= 20000) {
        subsidyPct = 70
      } else if (income <= 25000) {
        subsidyPct = 60
      } else if (income <= 30000) {
        subsidyPct = 50
      } else {
        subsidyPct = 35
      }
    }

    // Subsidy covers a portion of interest
    const averageMonthlyInterest = rawTotalInterest / totalMonths
    const monthlySubsidy = averageMonthlyInterest * (subsidyPct / 100)

    const finalMonthlyPayment = Math.max(0, rawMonthlyPayment - monthlySubsidy)
    const finalTotalFinancing = finalMonthlyPayment * totalMonths
    const finalTotalInterest = Math.max(0, finalTotalFinancing - principal)

    // Exemption from RETT (Real Estate Transaction Tax) for first home up to 1M SAR
    const isExemptFromTax = isFirstHome && price <= 1000000

    // Dynamic end date formatted
    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + Math.round(years))
    const formattedEndDate = endDate.toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })

    const formatCurr = (v: number) =>
      new Intl.NumberFormat(isRtl ? 'ar-SA' : 'en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(v)

    setResults({
      monthlyInstallment: formatCurr(finalMonthlyPayment),
      totalFinancing: formatCurr(finalTotalFinancing),
      totalInterest: formatCurr(finalTotalInterest),
      endDateLabel: formattedEndDate,
      isExempt: isExemptFromTax,
      downPaymentAmount: formatCurr(downAmt),
      originalPrincipal: formatCurr(principal),
      subsidyAmount: formatCurr(monthlySubsidy * totalMonths),
    })

    setViewState(1) // Transition to results
  }

  // Local translations
  const labels = {
    financialInfo: isRtl ? 'المعلومات المالية' : 'Financial Information',
    calcTitle: isRtl ? 'حاسبة التمويل العقاري' : 'Real Estate Finance Calculator',
    propPrice: isRtl ? 'سعر العقار' : 'Property Price',
    monthlyIncome: isRtl ? 'الدخل الشهري' : 'Monthly Income',
    obligations: isRtl ? 'الالتزامات الشهرية' : 'Monthly Obligations',
    period: isRtl ? 'فترة التمويل' : 'Financing Period',
    interestRate: isRtl ? 'نسبة الفائدة السنوية' : 'Annual Interest Rate',
    downPayment: isRtl ? 'نسبة الدفعة الأولى' : 'Down Payment Percentage',
    firstHome: isRtl ? 'هل هذا هو منزلك الأول؟' : 'Is this your first home?',
    supported: isRtl ? 'هل أنت مستفيد؟' : 'Are you supported?',
    calculate: isRtl ? 'احسب' : 'Calculate',
    clear: isRtl ? 'مسح' : 'Clear',
    monthlyInstallmentLabel: isRtl ? 'القسط الشهري' : 'Monthly Installment',
    disclaimer: isRtl
      ? 'هذه النتيجة هي تقديرية ولا تضمن الموافقة على القرض أو الشروط النهائية'
      : 'This result is an estimate and does not guarantee loan approval or final terms',
    totalFinancing: isRtl ? 'إجمالي مبلغ التمويل' : 'Total Financing Amount',
    totalInterest: isRtl ? 'إجمالي الفائدة' : 'Total Interest',
    originalPrincipalLabel: isRtl ? 'مبلغ التمويل الأساسي' : 'Original Loan Principal',
    downPaymentAmtLabel: isRtl ? 'قيمة الدفعة الأولى' : 'Down Payment Value',
    subsidyLabel: isRtl ? 'الدعم التمويلي (سكني)' : 'Subsidized Amount (Sakani)',
    editData: isRtl ? 'تعديل البيانات' : 'Edit Data',
    bookUnit: isRtl ? 'احجز وحدة' : 'Book a Unit',
    yes: isRtl ? 'نعم' : 'Yes',
    no: isRtl ? 'لا' : 'No',
    exemptNotice: isRtl
      ? '🎉 تهانينا! مسكنك الأول معفى بالكامل من ضريبة التصرفات العقارية (5٪) لخصائص أقل من 1,000,000 ريال.'
      : '🎉 Congratulations! Your first home is fully exempt from the 5% Real Estate Transaction Tax for properties under 1,000,000 SAR.',
    bankObligations: isRtl ? 'الالتزامات البنكية' : 'Bank Obligations',
    interestRateLabel: isRtl ? 'سعر الفائدة' : 'Interest Rate',
    downPaymentLabelPct: isRtl ? 'نسبة الدفعة الأولى' : 'Down Payment Percentage',
    durationLabel: isRtl ? 'مدة التمويل' : 'Financing Duration',
    durationUntil: isRtl ? 'حتى ' : 'Until ',
    sar: isRtl ? '﷼' : 'SAR',
    years: isRtl ? 'سنة' : 'years',
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="body"
      sx={{
        direction: isRtl ? 'rtl' : 'ltr',
        '& .MuiDialog-paper': {
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
        },
      }}
    >
      {/* Modal Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {viewState === 1 && (
            <IconButton onClick={() => setViewState(0)} size="small" sx={{ color: 'text.secondary' }}>
              {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
            </IconButton>
          )}
          <Box component="img" src={SAKANI_LOGO} alt="Sakani" sx={{ height: 28, objectFit: 'contain' }} />
          <Typography variant="h6" fontWeight="700" color="primary.main" sx={{ fontSize: '1.15rem' }}>
            {viewState === 0 ? labels.financialInfo : labels.calcTitle}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <X size={20} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 4 }}>
        {viewState === 0 ? (
          /* STATE 1: Financial Information Form */
          <Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: 'text.secondary' }}>
                  {labels.propPrice} *
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary', fontWeight: 'bold' }}>
                          {labels.sar}
                        </Typography>
                      ),
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: 'text.secondary' }}>
                  {labels.monthlyIncome} *
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary', fontWeight: 'bold' }}>
                          {labels.sar}
                        </Typography>
                      ),
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: 'text.secondary' }}>
                  {labels.obligations}
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={obligations}
                  onChange={(e) => setObligations(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary', fontWeight: 'bold' }}>
                          {labels.sar}
                        </Typography>
                      ),
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: 'text.secondary' }}>
                  {labels.period} *
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="20"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary', fontWeight: 'bold' }}>
                          {labels.years}
                        </Typography>
                      ),
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: 'text.secondary' }}>
                  {labels.downPayment} *
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="10"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary', fontWeight: 'bold' }}>
                          %
                        </Typography>
                      ),
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: 'text.secondary' }}>
                  {labels.interestRate} *
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="4.5"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary', fontWeight: 'bold' }}>
                          %
                        </Typography>
                      ),
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              {/* Radio Group: Is first home */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: 'text.secondary' }}>
                  {labels.firstHome} *
                </Typography>
                <RadioGroup
                  row
                  value={isFirstHome ? 'yes' : 'no'}
                  onChange={(e) => setIsFirstHome(e.target.value === 'yes')}
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio color="primary" />}
                    label={labels.yes}
                    sx={{ mr: isRtl ? 0 : 3, ml: isRtl ? 3 : 0 }}
                  />
                  <FormControlLabel value="no" control={<Radio color="primary" />} label={labels.no} />
                </RadioGroup>
              </Grid>

              {/* Radio Group: Is Sakani beneficiary */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: 'text.secondary' }}>
                  {labels.supported} *
                </Typography>
                <RadioGroup
                  row
                  value={isSupported ? 'yes' : 'no'}
                  onChange={(e) => setIsSupported(e.target.value === 'yes')}
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio color="primary" />}
                    label={labels.yes}
                    sx={{ mr: isRtl ? 0 : 3, ml: isRtl ? 3 : 0 }}
                  />
                  <FormControlLabel value="no" control={<Radio color="primary" />} label={labels.no} />
                </RadioGroup>
              </Grid>
            </Grid>

            {/* Form Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 5, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleClear}
                sx={{
                  px: 4,
                  py: 1.25,
                  borderRadius: 2.5,
                  borderColor: 'divider',
                  color: 'text.secondary',
                  fontWeight: 'semibold',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: 'grey.50',
                    borderColor: 'text.secondary',
                  },
                }}
              >
                {labels.clear}
              </Button>
              <Button
                variant="contained"
                onClick={handleCalculate}
                disabled={!propertyPrice}
                sx={{
                  px: 5,
                  py: 1.25,
                  borderRadius: 2.5,
                  bgcolor: '#00a3a3',
                  color: 'white',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#008a8a',
                    boxShadow: 'none',
                  },
                }}
              >
                {labels.calculate}
              </Button>
            </Stack>
          </Box>
        ) : (
          /* STATE 2: Calculator Results View */
          results && (
            <Box>
              {/* Installment Badge Banner */}
              <Box
                sx={{
                  bgcolor: '#f2f9f9',
                  borderRadius: 4,
                  p: 4,
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: alpha('#00a3a3', 0.15),
                  boxShadow: '0 4px 20px rgba(0, 163, 163, 0.03)',
                  mb: 4,
                }}
              >
                <Typography variant="body2" color="text.secondary" fontWeight="600" sx={{ mb: 1 }}>
                  {labels.monthlyInstallmentLabel}
                </Typography>
                <Typography variant="h3" fontWeight="900" color="#1a365d" sx={{ mb: 1, letterSpacing: -0.5 }}>
                  {results.monthlyInstallment} <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#4a5568' }}>{labels.sar} / {labels.perMonth}</span>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8 }}>
                  {labels.disclaimer}
                </Typography>
              </Box>

              {/* Taxation Exemption Warning Banner */}
              {results.isExempt && (
                <Box
                  sx={{
                    bgcolor: '#e6fffa',
                    border: '1px solid #b2f5ea',
                    borderRadius: 3,
                    p: 2,
                    mb: 4,
                  }}
                >
                  <Typography variant="body2" color="teal.800" fontWeight="600" textAlign="center">
                    {labels.exemptNotice}
                  </Typography>
                </Box>
              )}

              {/* Graphical Breakdown Bar */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ height: 10, borderRadius: 5, overflow: 'hidden', display: 'flex', bgcolor: 'grey.200', mb: 2 }}>
                  <Box
                    sx={{
                      width: `${(parseFloat(results.originalPrincipal.replace(/,/g, '')) / parseFloat(results.totalFinancing.replace(/,/g, ''))) * 100}%`,
                      bgcolor: '#1a365d',
                    }}
                  />
                  <Box sx={{ flexGrow: 1, bgcolor: '#00a3a3' }} />
                </Box>
                <Stack direction="row" spacing={4} justifyContent="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#1a365d' }} />
                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                      {labels.totalFinancing}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#00a3a3' }} />
                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                      {labels.totalInterest}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Details List/Table */}
              <Box sx={{ bgcolor: 'grey.50', borderRadius: 3, p: 3, mb: 4 }}>
                <Stack spacing={2.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="600">
                      {labels.totalFinancing}
                    </Typography>
                    <Typography variant="body2" fontWeight="700" color="primary.main">
                      {results.totalFinancing} {labels.sar}
                    </Typography>
                  </Box>
                  <Divider />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="600">
                      {labels.totalInterest}
                    </Typography>
                    <Typography variant="body2" fontWeight="700" color="primary.main">
                      {results.totalInterest} {labels.sar}
                    </Typography>
                  </Box>
                  <Divider />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="600">
                      {labels.downPaymentAmtLabel}
                    </Typography>
                    <Typography variant="body2" fontWeight="700" color="primary.main">
                      {results.downPaymentAmount} {labels.sar}
                    </Typography>
                  </Box>
                  <Divider />

                  {isSupported && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" fontWeight="600">
                          {labels.subsidyLabel}
                        </Typography>
                        <Typography variant="body2" fontWeight="700" color="success.main">
                          - {results.subsidyAmount} {labels.sar}
                        </Typography>
                      </Box>
                      <Divider />
                    </>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="600">
                      {labels.monthlyIncome}
                    </Typography>
                    <Typography variant="body2" fontWeight="700" color="primary.main">
                      {parseFloat(monthlyIncome) ? new Intl.NumberFormat(isRtl ? 'ar-SA' : 'en-US').format(parseFloat(monthlyIncome)) : '0'} {labels.sar}
                    </Typography>
                  </Box>
                  <Divider />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="600">
                      {labels.bankObligations}
                    </Typography>
                    <Typography variant="body2" fontWeight="700" color="primary.main">
                      {parseFloat(obligations) ? new Intl.NumberFormat(isRtl ? 'ar-SA' : 'en-US').format(parseFloat(obligations)) : '0'} {labels.sar}
                    </Typography>
                  </Box>
                  <Divider />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="600">
                      {labels.interestRateLabel}
                    </Typography>
                    <Typography variant="body2" fontWeight="700" color="primary.main">
                      {interestRate}%
                    </Typography>
                  </Box>
                  <Divider />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="600">
                      {labels.downPaymentLabelPct}
                    </Typography>
                    <Typography variant="body2" fontWeight="700" color="primary.main">
                      {downPayment}%
                    </Typography>
                  </Box>
                  <Divider />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="600">
                      {labels.durationLabel}
                    </Typography>
                    <Typography variant="body2" fontWeight="700" color="primary.main">
                      {labels.durationUntil} {results.endDateLabel} ({period} {labels.years})
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => setViewState(0)}
                  sx={{
                    px: 4,
                    py: 1.25,
                    borderRadius: 2.5,
                    borderColor: 'divider',
                    color: 'text.secondary',
                    fontWeight: 'semibold',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'grey.50',
                      borderColor: 'text.secondary',
                    },
                  }}
                >
                  {labels.editData}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    onClose()
                    onBookClick?.()
                  }}
                  sx={{
                    px: 5,
                    py: 1.25,
                    borderRadius: 2.5,
                    bgcolor: '#00a3a3',
                    color: 'white',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#008a8a',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {labels.bookUnit}
                </Button>
              </Stack>
            </Box>
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
