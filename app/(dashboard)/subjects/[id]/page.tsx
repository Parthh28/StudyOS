import { getSubjectDetails } from '@/lib/actions/data'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Play, Download, BarChart2, ArrowLeft } from 'lucide-react'
import { TopicList } from '@/components/topic-list'
import { SubjectMasterySelector } from '@/components/subject-mastery-selector'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { success, data: subject } = await getSubjectDetails(resolvedParams.id)

  if (!success || !subject) {
    redirect('/subjects')
  }

  // Calculate stats as a mixture of Syllabus, Notes, and Revision
  let totalTopics = 0
  let fullyCompletedTopics = 0
  let totalTasks = 0
  let completedTasks = 0
  
  subject.units?.forEach((unit: any) => {
    if (unit.topics) {
      totalTopics += unit.topics.length
      unit.topics.forEach((t: any) => {
        totalTasks += 3 // Syllabus + Notes + Revision

        let localCompleted = 0
        if (t.status === 'completed') localCompleted++
        if (t.notes_completed) localCompleted++
        if (t.revision_completed) localCompleted++

        completedTasks += localCompleted
        
        // A topic is only fully completed if all 3 study milestones are done
        if (localCompleted === 3) fullyCompletedTopics++
      })
    }
  })

  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const remainingTopics = totalTopics - fullyCompletedTopics
  
  // Calculate SVG Ring offset
  const syllabusRingOffset = 213 * (1 - (progressPct / 100))

  return (
    <div className="flex-1 p-5 md:p-10 max-w-[1200px] w-full mx-auto">
      <div className="bg-card rounded-2xl p-6 md:p-8 flex flex-col h-full border border-border shadow-lg">
        
        {/* Header Section */}
        <div className="mb-6 border-b border-border pb-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-text-muted hover:text-indigo transition-colors text-sm font-semibold mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
            <div className="flex items-center gap-3 mb-3">
              <span 
                className="px-3 py-1 rounded-full text-xs font-bold tracking-widest bg-opacity-20 border border-opacity-30"
                style={{ backgroundColor: `${subject.color}33`, color: subject.color, borderColor: subject.color }}
              >
                {subject.code}
              </span>
              <span className="flex items-center text-success text-xs font-bold tracking-widest gap-1">
                <CheckCircle2 className="w-4 h-4" /> Active
              </span>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-2">{subject.name}</h3>
            <p className="text-text-muted max-w-2xl">
              Master the curriculum for {subject.name}. Track your progress, mark topics as complete, and build your confidence score.
            </p>
          </div>
          
          <div className="hidden sm:flex shrink-0 w-20 h-20 rounded-full border-4 border-surface-2 relative items-center justify-center">
            {/* Circular Progress */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle className="text-surface-2" cx="36" cy="36" fill="transparent" r="34" stroke="currentColor" strokeWidth="4"></circle>
              <circle 
                className="transition-all duration-1000 ease-out" 
                cx="36" cy="36" fill="transparent" r="34" 
                stroke={subject.color} 
                strokeDasharray="213" 
                strokeDashoffset={syllabusRingOffset} 
                strokeLinecap="round" strokeWidth="4"
              ></circle>
            </svg>
            <span className="text-md font-bold" style={{ color: subject.color }}>{progressPct}%</span>
          </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface-2 p-4 rounded-xl text-center border border-border">
            <span className="block text-3xl font-bold text-foreground mb-1">{totalTopics}</span>
            <span className="text-xs font-semibold text-text-muted tracking-widest">TOTAL TOPICS</span>
          </div>
          <div className="bg-surface-2 p-4 rounded-xl text-center border border-border">
            <span className="block text-3xl font-bold text-primary mb-1">{fullyCompletedTopics}</span>
            <span className="text-xs font-semibold text-text-muted tracking-widest">MASTERED</span>
          </div>
          <div className="bg-surface-2 p-4 rounded-xl text-center border border-border">
            <span className="block text-3xl font-bold text-foreground mb-1">{remainingTopics}</span>
            <span className="text-xs font-semibold text-text-muted tracking-widest">REMAINING</span>
          </div>
          <div className="bg-surface-2 p-4 rounded-xl text-center border border-border">
            <span className="block text-3xl font-bold text-success mb-1">Active</span>
            <span className="text-xs font-semibold text-text-muted tracking-widest">STATUS</span>
          </div>
        </div>

        {/* Subject Mastery Level Classification Section */}
        <SubjectMasterySelector subjectId={subject.id} initialStatus={subject.mastery_status || 'normal'} />

        {/* Curriculum Accordion */}
        <div className="flex-grow mb-8">
          <TopicList units={subject.units || []} />
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-6 border-t border-border flex flex-wrap gap-4">
          <Link href={`/subjects/${subject.id}?timer=open&subjectId=${subject.id}`} scroll={false} className="flex-1 min-w-[200px] py-3 px-6 rounded-lg gradient-primary text-primary-foreground font-semibold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <Play className="w-5 h-5 fill-current" /> Resume Learning
          </Link>
          <button className="flex-1 min-w-[150px] py-3 px-6 rounded-lg bg-surface-2 border border-border text-foreground hover:bg-surface-2/80 font-semibold transition-all flex items-center justify-center gap-2">
            <Download className="w-5 h-5" /> Syllabus
          </button>
          <Link href="/analytics" className="p-3 rounded-lg border border-border bg-surface-2 text-foreground hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center">
            <BarChart2 className="w-6 h-6" />
          </Link>
        </div>
        
      </div>
    </div>
  )
}
