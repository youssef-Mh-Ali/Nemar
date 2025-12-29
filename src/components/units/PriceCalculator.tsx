import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Slider,
  Paper,
  Grid,
  Divider,
} from '@mui/material'
import { Calculator, X } from 'lucide-react'
import { Unit } from '../../lib/types'

interface PriceCalculatorProps {
  unit: Unit
  isOpen: boolean
  onClose: () => void
}

export default function PriceCalculator({ unit, isOpen, onClose }: PriceCalculatorProps) {
  const [downPayment, setDownPayment] = useState(20)
  const [loanTerm, setLoanTerm] = useState(20)
  const [interestRate, setInterestRate] = useState(4.5)

  const loanAmount = unit.price * (1 - downPayment / 100)
  const monthlyRate = interestRate / 100 / 12
  const numberOfPayments = loanTerm * 12

  const monthlyPayment =
    loanAmount > 0 && monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      : 0

  const totalInterest = monthlyPayment * numberOfPayments - loanAmount
  const totalAmount = unit.price + totalInterest

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calculator size={24} />
            <Typography variant="h6">حاسبة التمويل</Typography>
          </Box>
          <Button onClick={onClose} sx={{ minWidth: 'auto', p: 1 }}>
            <X size={20} />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            سعر الوحدة
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            {formatCurrency(unit.price)}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Down Payment */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" gutterBottom>
              الدفعة الأولى: {downPayment}%
            </Typography>
            <Slider
              value={downPayment}
              onChange={(_, value) => setDownPayment(value as number)}
              min={10}
              max={50}
              step={5}
              marks
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {formatCurrency(unit.price * (downPayment / 100))}
            </Typography>
          </Grid>

          {/* Loan Term */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" gutterBottom>
              مدة القرض: {loanTerm} سنة
            </Typography>
            <Slider
              value={loanTerm}
              onChange={(_, value) => setLoanTerm(value as number)}
              min={5}
              max={30}
              step={5}
              marks
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value} سنة`}
            />
          </Grid>

          {/* Interest Rate */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="معدل الفائدة (%)"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
              fullWidth
              inputProps={{ min: 0, max: 10, step: 0.1 }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Results */}
        <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                مبلغ القرض
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {formatCurrency(loanAmount)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                القسط الشهري
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {formatCurrency(monthlyPayment)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                إجمالي الفوائد
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {formatCurrency(totalInterest)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" color="text.secondary">
                إجمالي المبلغ
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {formatCurrency(totalAmount)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>إغلاق</Button>
        <Button variant="contained" onClick={onClose}>
          طباعة
        </Button>
      </DialogActions>
    </Dialog>
  )
}

