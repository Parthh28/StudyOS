import { getFullMasteryHubData } from '@/lib/actions/data'
import { redirect } from 'next/navigation'
import { MasteryHubView } from '@/components/mastery-hub-view'
import { Target, AlertTriangle, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Mastery & Diagnostic Hub - StudyOS',
  description: 'Full hub for managing weak subjects, weak topics, and mastered sections across your courses.',
}

export default async function MasteryPage() {
  const { success, data } = await getFullMasteryHubData()

  if (!success || !data) {
    redirect('/login')
  }

  const { subjects, topics } = data

  return (
    <div className="flex-1 p-5 md:p-8 max-w-[1200px] w-full mx-auto space-y-6 animate-fade-in">
      {/* Precision SaaS Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              DIAGNOSTIC HUB
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Academic Mastery & Weak Sections Hub
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Comprehensive audit and targeted management for weak subjects, weak topics, and mastered sections across all enrolled courses.
          </p>
        </div>
      </div>

      <MasteryHubView subjects={subjects} initialTopics={topics} />
    </div>
  )
}
