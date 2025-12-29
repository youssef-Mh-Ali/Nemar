import { Card, CardContent, Typography, Chip, Box } from '@mui/material'
import { motion } from 'framer-motion'
import { MessageSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Case } from '../../lib/types'

const statusConfig: Record<
  Case['status'],
  { label: string; color: 'info' | 'warning' | 'success' | 'default'; icon: React.ElementType }
> = {
  New: { label: 'جديد', color: 'info', icon: AlertCircle },
  InProgress: { label: 'قيد المعالجة', color: 'warning', icon: Clock },
  Resolved: { label: 'تم الحل', color: 'success', icon: CheckCircle2 },
  Closed: { label: 'مغلق', color: 'default', icon: CheckCircle2 },
}

const categoryLabels: Record<string, string> = {
  Maintenance: 'صيانة',
  Inquiry: 'استفسار',
  Complaint: 'شكوى',
  Documentation: 'مستندات',
  Other: 'أخرى',
}

interface CaseListProps {
  cases: Case[]
}

export default function CaseList({ cases }: CaseListProps) {
  if (cases.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <MessageSquare size={48} color="#e2e8f0" style={{ margin: '0 auto 12px', display: 'block' }} />
        <Typography variant="h6" fontWeight="semibold" gutterBottom>
          لا توجد طلبات
        </Typography>
        <Typography variant="body2" color="text.secondary">
          يمكنك فتح طلب جديد من الزر أعلاه
        </Typography>
      </Box>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {cases.map((caseItem, index) => {
        const status = statusConfig[caseItem.status]
        const StatusIcon = status.icon

        return (
          <motion.div
            key={caseItem.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" fontWeight="medium" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {caseItem.subject}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {categoryLabels[caseItem.category]} • {formatDate(caseItem.createdAt)}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<StatusIcon size={12} />}
                    label={status.label}
                    color={status.color}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {caseItem.description}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </Box>
  )
}

