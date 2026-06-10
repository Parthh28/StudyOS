import { getDashboardData, getWeakTopics } from '@/lib/actions/data'
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
import { TodoList } from '@/components/todo-list'
import { ExamCountdownWidget } from '@/components/exam-countdown-widget'

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

export default async function DashboardPage() {
  const { success, data } = await getDashboardData()

  if (!success || !data) {
    redirect('/login')
  }

  const { data: weakTopics } = await getWeakTopics()

  const { profile, subjectStats, recentSessions, hoursStudiedThisWeek, todos, exams } = data
  const firstName = profile?.full_name?.split(' ')[0] || 'Student'

  // Weekly Goal Calculation
  const weeklyGoal = profile?.weekly_goal_hours || 20
  const weeklyGoalProgress = Math.min(hoursStudiedThisWeek / weeklyGoal, 1)
  const weeklyRingOffset = 264 * (1 - weeklyGoalProgress)

  // Overall Syllabus Calculation
  const totalTopics = subjectStats.reduce((acc: number, curr: any) => acc + (curr.total_topics || 0), 0)
  const completedTopics = subjectStats.reduce((acc: number, curr: any) => acc + (curr.completed_topics || 0), 0)
  const syllabusProgress = totalTopics === 0 ? 0 : completedTopics / totalTopics
  const syllabusRingOffset = 264 * (1 - syllabusProgress)

  // Find a "Next Up" topic (just picking the first subject with incomplete topics for now, or a random one)
  const nextSubject = subjectStats.find((s: any) => s.completed_topics < s.total_topics)

  return (
    <div className="flex-1 p-5 md:p-10 max-w-[1200px] w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8">
        
        {/* Left Column (Focus & Subjects) */}
        <div className="lg:col-span-8 flex flex-col gap-5 lg:gap-8">
          
          {/* Mobile Greeting */}
          <div className="md:hidden animate-fade-in-up mb-2">
            <h1 className="text-3xl font-bold text-white">Welcome back, {firstName}</h1>
            <p className="text-text-muted mt-1">Here is what's happening with your studies today.</p>
          </div>

          {/* Focus Zone */}
          <section className="glass rounded-2xl p-6 lg:p-8 relative overflow-hidden animate-fade-in-up border border-indigo/20 shadow-2xl">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="text-xs font-semibold tracking-widest text-violet px-3 py-1 bg-violet/10 rounded-full border border-violet/20 inline-block mb-4">
                  NEXT UP
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {nextSubject ? nextSubject.subject_name : 'All caught up!'}
                </h2>
                <p className="text-text-muted max-w-md">
                  {nextSubject 
                    ? `Continue working on ${nextSubject.subject_name}. You have completed ${nextSubject.completed_topics} out of ${nextSubject.total_topics} topics.`
                    : 'You have completed all topics in your current subjects. Great job!'}
                </p>
              </div>
              <button className="shrink-0 px-6 py-3 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-all transform active:scale-95 duration-200 glow-primary">
                Start Study Session
              </button>
            </div>
          </section>

          {/* Exam Countdown & Pacing Engine */}
          <ExamCountdownWidget exams={exams || []} subjectStats={subjectStats} />

          {/* Subject Grid */}
          <section className="animate-fade-in-up delay-100 mt-2">
            <h3 className="text-xl font-semibold text-white mb-4">Current Subjects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {subjectStats.map((stat: any) => {
                const IconComponent = IconMap[stat.subject_icon] || BookOpen
                const progressPct = stat.total_topics > 0 ? Math.round((stat.completed_topics / stat.total_topics) * 100) : 0
                
                return (
                  <Link href={`/subjects/${stat.subject_id}`} key={stat.subject_id}>
                    <div className="glass rounded-xl p-5 hover:bg-surface-2/40 transition-all cursor-pointer group h-full flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center bg-opacity-20"
                            style={{ backgroundColor: `${stat.subject_color}33`, color: stat.subject_color }}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-semibold tracking-wider text-text-muted">{stat.subject_code}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-white mb-4 group-hover:text-indigo transition-colors line-clamp-2">
                          {stat.subject_name}
                        </h4>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-xs text-text-muted">
                          <span>Progress</span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
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
          </section>
        </div>

        {/* Right Column (Stats & Activity) */}
        <div className="lg:col-span-4 flex flex-col gap-5 lg:gap-8">
          
          {/* Progress Rings */}
          <section className="glass rounded-2xl p-6 animate-fade-in-up delay-200">
            <h3 className="text-xl font-semibold text-white mb-6 text-center lg:text-left">Overview</h3>
            <div className="flex gap-4 sm:gap-6 justify-center">
              
              {/* Ring 1: Weekly Goal */}
              <div className="flex flex-col items-center gap-2 md:gap-3">
                <div className="relative w-24 h-24">
                  {/* Background circle */}
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="none" r="42" stroke="#1E293B" strokeWidth="8"></circle>
                  </svg>
                  {/* Progress circle */}
                  <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="indigoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366F1"></stop>
                        <stop offset="100%" stopColor="#8B5CF6"></stop>
                      </linearGradient>
                    </defs>
                    <circle 
                      className="progress-ring__circle" 
                      cx="50" 
                      cy="50" 
                      fill="none" 
                      r="42" 
                      stroke="url(#indigoGradient)" 
                      strokeDasharray="264" 
                      strokeDashoffset={weeklyRingOffset}
                      strokeLinecap="round" 
                      strokeWidth="8"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {Math.floor(hoursStudiedThisWeek)}h {Math.round((hoursStudiedThisWeek % 1) * 60)}m
                    </span>
                    <span className="text-xs text-text-muted mt-1">/ {weeklyGoal}h</span>
                  </div>
                </div>
                <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">Weekly Goal</span>
              </div>

              {/* Ring 2: Syllabus Progress */}
              <div className="flex flex-col items-center gap-2 md:gap-3">
                <div className="relative w-24 h-24">
                  {/* Background circle */}
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="none" r="42" stroke="#1E293B" strokeWidth="8"></circle>
                  </svg>
                  {/* Progress circle */}
                  <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="violetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06B6D4"></stop>
                        <stop offset="100%" stopColor="#6366F1"></stop>
                      </linearGradient>
                    </defs>
                    <circle 
                      className="progress-ring__circle" 
                      cx="50" 
                      cy="50" 
                      fill="none" 
                      r="42" 
                      stroke="url(#violetGradient)" 
                      strokeDasharray="264" 
                      strokeDashoffset={syllabusRingOffset}
                      strokeLinecap="round" 
                      strokeWidth="8"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{Math.round(syllabusProgress * 100)}%</span>
                  </div>
                </div>
                <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">Syllabus</span>
              </div>

            </div>
          </section>

          {/* Needs Revision Widget */}
          {weakTopics && weakTopics.length > 0 && (
            <div className="animate-fade-in-up delay-250">
              <section className="glass rounded-2xl p-6 border border-red-500/20 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.05)] relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-[50px] pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                    <span className="text-red-500 text-sm font-bold">!</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Needs Revision</h3>
                    <p className="text-xs text-red-400/80 mt-0.5">Topics you marked as weak</p>
                  </div>
                </div>
                <div className="space-y-2 relative z-10">
                  {weakTopics.map((topic: any) => (
                    <Link href={`/subjects/${topic.subject_id}`} key={topic.id}>
                      <div className="flex items-center justify-between p-3 bg-surface-2/30 hover:bg-surface-2/80 rounded-lg border border-red-500/10 cursor-pointer transition-colors group">
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-1">{topic.name}</p>
                          <p className="text-xs text-text-muted mt-0.5">{topic.subject?.name}</p>
                        </div>
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded shadow-sm">Review</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Daily To-Do List */}
          <div className="animate-fade-in-up delay-300">
            <TodoList initialTodos={todos || []} />
          </div>

          {/* Activity Feed */}
          <section className="glass rounded-2xl p-6 flex-1 animate-fade-in-up delay-400">
            <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
            
            {recentSessions && recentSessions.length > 0 ? (
              <div className="relative pl-4 border-l border-surface-2 space-y-6">
                {recentSessions.map((session: any, i: number) => {
                  // Format time (e.g. "2 hours ago")
                  const sessionDate = new Date(session.started_at)
                  const diffHours = Math.round((new Date().getTime() - sessionDate.getTime()) / (1000 * 60 * 60))
                  const timeString = diffHours < 1 
                    ? 'Just now' 
                    : diffHours < 24 
                      ? `${diffHours} hours ago` 
                      : diffHours < 48 ? 'Yesterday' : `${Math.floor(diffHours/24)} days ago`

                  return (
                    <div key={session.id} className="relative">
                      <div 
                        className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border border-surface-2 ${i === 0 ? 'glow-primary' : ''}`}
                        style={{ backgroundColor: i === 0 ? '#6366F1' : '#334155' }}
                      ></div>
                      <p className="text-sm font-semibold text-white">{session.subject?.name || 'Study Session'}</p>
                      <p className="text-sm text-text-muted mt-1">
                        {session.topic?.name ? `Studied '${session.topic.name}'` : 'General study'} • {session.duration_mins} mins
                      </p>
                      <span className="text-xs text-slate-500 mt-1 block">{timeString}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted text-sm">
                No recent activity. Start a session to track your progress!
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  )
}
