import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar as CalendarIcon, Clock, Target, CheckCircle2 } from 'lucide-react'
import { format, parseISO, isPast, isToday, differenceInDays } from 'date-fns'

export default async function CalendarPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch upcoming exams
  const { data: exams } = await supabase
    .from('exams')
    .select('*, subject:subjects(name, color)')
    .order('exam_date', { ascending: true })

  // Format data for timeline
  const today = new Date()
  
  const upcomingExams = (exams || []).filter(e => !isPast(parseISO(e.exam_date)) || isToday(parseISO(e.exam_date)))
  const pastExams = (exams || []).filter(e => isPast(parseISO(e.exam_date)) && !isToday(parseISO(e.exam_date)))

  return (
    <div className="flex-1 p-5 md:p-10 max-w-[1000px] w-full mx-auto">
      
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-indigo" />
          Academic Calendar
        </h1>
        <p className="text-text-muted mt-2">Track your upcoming exams and deadlines.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Upcoming Timeline */}
        <div className="md:col-span-8 space-y-8 animate-fade-in-up delay-100">
          <section>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo" />
              Upcoming Deadlines
            </h2>

            {upcomingExams.length > 0 ? (
              <div className="relative pl-6 border-l-2 border-surface-2 space-y-8">
                {upcomingExams.map((exam, i) => {
                  const examDate = parseISO(exam.exam_date)
                  const daysLeft = differenceInDays(examDate, today)
                  
                  return (
                    <div key={exam.id} className="relative">
                      {/* Timeline Dot */}
                      <div 
                        className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-background ${i === 0 ? 'bg-indigo shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'bg-surface-2'}`}
                      />
                      
                      <div className="glass rounded-xl p-5 hover:bg-surface-2/40 transition-colors border border-white/5">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{ backgroundColor: exam.subject?.color || '#6366F1' }} 
                              />
                              <span className="text-xs font-bold tracking-widest text-text-muted uppercase">
                                {exam.subject?.name || 'General'}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-white">{exam.name}</h3>
                          </div>
                          <div className="text-right">
                            <div className="bg-indigo/10 text-indigo px-3 py-1 rounded-lg border border-indigo/20">
                              <span className="text-lg font-bold">{format(examDate, 'MMM d')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          {daysLeft === 0 ? (
                            <span className="text-orange-500 font-bold bg-orange-500/10 px-2 py-1 rounded">Today!</span>
                          ) : daysLeft === 1 ? (
                            <span className="text-orange-400 font-bold bg-orange-400/10 px-2 py-1 rounded">Tomorrow</span>
                          ) : (
                            <span className="text-text-muted">{daysLeft} days remaining</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="glass rounded-xl p-8 text-center text-text-muted border border-white/5 border-dashed">
                <Target className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>No upcoming exams scheduled.</p>
              </div>
            )}
          </section>

          {/* Past Exams */}
          {pastExams.length > 0 && (
            <section className="opacity-70 mt-12">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-text-muted" />
                Past Exams
              </h2>
              
              <div className="space-y-4">
                {pastExams.map(exam => (
                  <div key={exam.id} className="flex justify-between items-center p-4 rounded-xl bg-surface-2/20 border border-white/5">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{exam.name}</h4>
                      <p className="text-xs text-text-muted mt-0.5">{exam.subject?.name}</p>
                    </div>
                    <span className="text-xs font-medium text-text-muted">
                      {format(parseISO(exam.exam_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="md:col-span-4 animate-fade-in-up delay-200">
          <div className="glass rounded-2xl p-6 border-indigo/10">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Focus Mode</h3>
            <p className="text-sm text-text-muted mb-6">
              You have {upcomingExams.length} upcoming deadlines. Stay on top of your pacing engine!
            </p>
            <div className="w-full aspect-square rounded-xl bg-surface-2/30 flex items-center justify-center border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <CalendarIcon className="w-16 h-16 text-indigo opacity-20" />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
