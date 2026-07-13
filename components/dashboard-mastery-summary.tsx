'use client'

import React from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, ArrowRight, Award, BookOpen } from 'lucide-react'

export function DashboardMasterySummary({
  subjectStats = [],
  recentSessions = [],
  weakTopics = [],
}: {
  subjectStats: any[]
  recentSessions: any[]
  weakTopics?: any[]
}) {
  const weakSubjectIds = new Set(weakTopics?.map((wt: any) => wt.subject_id))
  const weakSubjectsList = subjectStats.filter((s) => {
    const pct = s.total_topics > 0 ? (s.completed_topics / s.total_topics) * 100 : 0
    return pct < 60 || weakSubjectIds.has(s.subject_id)
  })

  const masteredSubjects = subjectStats.filter(
    (s) => s.total_topics > 0 && s.completed_topics >= s.total_topics
  )

  const masteredTopicsCount = subjectStats.reduce(
    (acc, s) => acc + (Number(s.completed_topics) || 0),
    0
  )

  const weakTopicsCount = weakTopics?.length || 0

  return (
    <div className="bg-card/90 border border-border/70 rounded-xl p-5 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-wider text-primary uppercase px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
            DIAGNOSTIC AUDIT
          </span>
          <h2 className="text-lg font-bold text-foreground mt-1.5">
            Weak & Mastered Gateway
          </h2>
          <p className="text-xs text-text-muted">
            Explicit tracking of weak subjects, weak topics, mastered subjects, and mastered topics.
          </p>
        </div>

        <Link
          href="/mastery"
          className="shrink-0 px-4 py-2 rounded-lg gradient-primary text-white text-xs font-semibold hover:opacity-90 transition-all inline-flex items-center gap-1.5 shadow-xs"
        >
          <span>Open Full Mastery Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/mastery"
          className="p-3.5 rounded-xl bg-surface/80 border border-border/70 hover:border-danger/60 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider">
              WEAK SUBJECTS
            </span>
            <AlertTriangle className="w-4 h-4 text-danger group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-mono font-bold text-danger mt-2">
            {weakSubjectsList.length}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Courses needing action</p>
        </Link>

        <Link
          href="/mastery"
          className="p-3.5 rounded-xl bg-surface/80 border border-border/70 hover:border-danger/60 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider">
              WEAK TOPICS
            </span>
            <BookOpen className="w-4 h-4 text-danger group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-mono font-bold text-danger mt-2">{weakTopicsCount}</div>
          <p className="text-[11px] text-text-muted mt-1">Specific topics flagged</p>
        </Link>

        <Link
          href="/mastery"
          className="p-3.5 rounded-xl bg-surface/80 border border-border/70 hover:border-success/60 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider">
              MASTERED SUBJECTS
            </span>
            <Award className="w-4 h-4 text-success group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-mono font-bold text-success mt-2">
            {masteredSubjects.length}
          </div>
          <p className="text-[11px] text-text-muted mt-1">100% completed courses</p>
        </Link>

        <Link
          href="/mastery"
          className="p-3.5 rounded-xl bg-surface/80 border border-border/70 hover:border-success/60 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider">
              MASTERED TOPICS
            </span>
            <CheckCircle2 className="w-4 h-4 text-success group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-mono font-bold text-success mt-2">
            {masteredTopicsCount}
          </div>
          <p className="text-[11px] text-text-muted mt-1">Completed topics</p>
        </Link>
      </div>
    </div>
  )
}
