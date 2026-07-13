import { getDashboardData } from '@/lib/actions/data'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PomodoroStudio } from '@/components/pomodoro-studio'
import { Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PomodoroPage() {
  const { success, data } = await getDashboardData()

  if (!success || !data) {
    redirect('/login')
  }

  const supabase = await createClient()
  const { data: topics } = await supabase
    .from('topics')
    .select('id, name, subject_id')
    .order('name')

  const subjects = data.subjectStats.map((st: any) => ({
    id: st.subject_id,
    name: st.subject_name,
    color: st.subject_color,
    code: st.subject_code,
  }))

  return (
    <div className="flex-1 p-5 md:p-10 max-w-[1300px] w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-primary">
              Deep Work Arena
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">
            Pomodoro Focus Studio
          </h1>
          <p className="text-sm text-text-muted mt-1.5 max-w-xl">
            Execute high-intensity study sprints, track your focus duration, and auto-log study sessions directly into your subject progress.
          </p>
        </div>
      </div>

      <PomodoroStudio subjects={subjects} topics={topics || []} />
    </div>
  )
}
