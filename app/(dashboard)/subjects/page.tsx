import { getDashboardData } from '@/lib/actions/data'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen,
  Calculator,
  Cpu,
  Binary,
  Gauge,
  FlaskConical,
  Microscope,
  Zap,
} from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Map icon string from DB to actual Lucide component
const IconMap: Record<string, any> = {
  BookOpen,
  Calculator,
  Cpu,
  Binary,
  Gauge,
  FlaskConical,
  Microscope,
  Zap,
}

export default async function SubjectsPage() {
  const { success, data } = await getDashboardData()

  if (!success || !data) {
    redirect('/login')
  }

  const { subjectStats } = data

  return (
    <div className="flex-1 p-5 md:p-10 max-w-[1200px] w-full mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text gradient-text">Subjects</h2>
        <p className="text-text-muted mt-2">Manage and track your curriculum progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjectStats.map((stat: any) => {
          const IconComponent = IconMap[stat.subject_icon] || BookOpen
          const progressPct = stat.completion_pct ?? (stat.total_topics > 0 ? Math.round((stat.completed_topics / stat.total_topics) * 100) : 0)
          
          return (
            <Link href={`/subjects/${stat.subject_id}`} key={stat.subject_id}>
              <div className="bg-card rounded-xl p-6 border border-border border-l-4 hover:shadow-lg transition-all cursor-pointer group h-full flex flex-col justify-between"
                   style={{ borderLeftColor: stat.subject_color }}>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block px-2.5 py-1 rounded-md bg-surface-2 text-text-muted text-xs font-semibold tracking-widest mb-2 border border-border">
                        {stat.subject_code}
                      </span>
                      <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {stat.subject_name}
                      </h4>
                    </div>
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-border/50"
                      style={{ backgroundColor: `${stat.subject_color}1a`, color: stat.subject_color }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mt-6">
                  <div className="flex justify-between text-xs font-semibold text-text-muted">
                    <span>Progress</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden border border-border/40">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${progressPct}%`, backgroundColor: stat.subject_color }}
                    ></div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
