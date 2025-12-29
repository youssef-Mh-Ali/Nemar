"use client";

import { motion } from "framer-motion";
import { MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { Case } from "@/lib/types";

const statusConfig: Record<
  Case["status"],
  { label: string; variant: "default" | "info" | "warning" | "success"; icon: React.ElementType }
> = {
  New: { label: "جديد", variant: "info", icon: AlertCircle },
  InProgress: { label: "قيد المعالجة", variant: "warning", icon: Clock },
  Resolved: { label: "تم الحل", variant: "success", icon: CheckCircle2 },
  Closed: { label: "مغلق", variant: "default", icon: CheckCircle2 },
};

const categoryLabels: Record<string, string> = {
  Maintenance: "صيانة",
  Inquiry: "استفسار",
  Complaint: "شكوى",
  Documentation: "مستندات",
  Other: "أخرى",
};

interface CaseListProps {
  cases: Case[];
}

export function CaseList({ cases }: CaseListProps) {
  if (cases.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-[var(--color-border)] mx-auto mb-3" />
        <h3 className="font-semibold text-[var(--color-text)] mb-1">
          لا توجد طلبات
        </h3>
        <p className="text-sm text-[var(--color-text-muted)]">
          يمكنك فتح طلب جديد من الزر أعلاه
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-3">
      {cases.map((caseItem, index) => {
        const status = statusConfig[caseItem.status];
        const StatusIcon = status.icon;

        return (
          <motion.div
            key={caseItem.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-[var(--color-text)] truncate">
                    {caseItem.subject}
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {categoryLabels[caseItem.category]} • {formatDate(caseItem.createdAt)}
                  </p>
                </div>
                <Badge variant={status.variant}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
                {caseItem.description}
              </p>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

