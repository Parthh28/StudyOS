'use client'

import { useState, useTransition } from 'react'
import { AlertTriangle, CheckCircle2, Sliders, Loader2 } from 'lucide-react'
import { updateSubjectMasteryLevel } from '@/lib/actions/data'

export function SubjectMasterySelector({
  subjectId,
  initialStatus = 'normal',
}: {
  subjectId: string
  initialStatus?: 'weak' | 'normal' | 'mastered'
}) {
  const [status, setStatus] = useState<'weak' | 'normal' | 'mastered'>(initialStatus)
  const [isPending, startTransition] = useTransition()

  const handleSelect = (newStatus: 'weak' | 'normal' | 'mastered') => {
    setStatus(newStatus)
    startTransition(async () => {
      await updateSubjectMasteryLevel(subjectId, newStatus)
    })
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-2.5">
        <Sliders className="w-4 h-4 text-primary shrink-0" />
        <div>
          <h4 className="text-xs font-bold text-foreground">
            Subject Mastery Classification
          </h4>
          <p className="text-[11px] text-text-muted">
            Mark this subject to adjust your diagnostic recommendations
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => handleSelect('weak')}
          disabled={isPending}
          className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all border ${
            status === 'weak'
              ? 'bg-red-500/10 text-red-500 border-red-500/30 shadow-sm'
              : 'bg-surface-2 text-text-muted border-border hover:text-foreground'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Weak
        </button>

        <button
          type="button"
          onClick={() => handleSelect('normal')}
          disabled={isPending}
          className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all border ${
            status === 'normal'
              ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
              : 'bg-surface-2 text-text-muted border-border hover:text-foreground'
          }`}
        >
          Normal
        </button>

        <button
          type="button"
          onClick={() => handleSelect('mastered')}
          disabled={isPending}
          className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all border ${
            status === 'mastered'
              ? 'bg-success/10 text-success border-success/30 shadow-sm'
              : 'bg-surface-2 text-text-muted border-border hover:text-foreground'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
        </button>
      </div>
    </div>
  )
}
