'use client'

import { useState, useTransition } from 'react'
import { Calendar, Plus, Target, Flame, Loader2, X } from 'lucide-react'
import { addExam } from '@/lib/actions/data'
import { differenceInDays, parseISO } from 'date-fns'

type ExamWidgetProps = {
  exams: any[]
  subjectStats: any[]
}

export function ExamCountdownWidget({ exams, subjectStats }: ExamWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  // Form state
  const [name, setName] = useState('')
  const [subjectId, setSubjectId] = useState(subjectStats[0]?.subject_id || '')
  const [examDate, setExamDate] = useState('')
  const [error, setError] = useState('')

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !subjectId || !examDate) {
      setError('Please fill all fields')
      return
    }

    setError('')
    startTransition(async () => {
      const res = await addExam({ name, subject_id: subjectId, exam_date: examDate })
      if (res.success) {
        setIsOpen(false)
        setName('')
        setExamDate('')
      } else {
        setError(res.error || 'Failed to add exam')
      }
    })
  }

  // Calculate stats for each exam
  const enrichedExams = exams.map(exam => {
    const subject = subjectStats.find(s => s.subject_id === exam.subject_id)
    const totalTopics = subject?.total_topics || 0
    const completedTopics = subject?.completed_topics || 0
    const remainingTopics = Math.max(0, totalTopics - completedTopics)
    
    const daysLeft = Math.max(1, differenceInDays(parseISO(exam.exam_date), new Date()))
    const velocity = (remainingTopics / daysLeft).toFixed(1)
    
    return {
      ...exam,
      subjectName: subject?.subject_name || 'Unknown',
      subjectColor: subject?.subject_color || '#6366F1',
      remainingTopics,
      daysLeft,
      velocity
    }
  }).sort((a, b) => a.daysLeft - b.daysLeft)

  return (
    <>
      <section className="glass rounded-2xl p-6 lg:p-8 animate-fade-in-up delay-75 border-indigo/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo/5 rounded-full blur-[40px] pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Target className="text-indigo w-5 h-5" />
              Pacing Engine
            </h3>
            <p className="text-sm text-text-muted mt-1">Calculated velocity for upcoming exams</p>
          </div>
          <button 
            onClick={() => setIsOpen(true)}
            className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-text-muted hover:text-white transition-colors"
            title="Add Exam"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {enrichedExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {enrichedExams.map(exam => (
              <div key={exam.id} className="bg-surface-2/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between hover:bg-surface-2/60 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: exam.subjectColor }}></div>
                      <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">{exam.subjectName}</span>
                    </div>
                    <h4 className="text-md font-semibold text-white">{exam.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white leading-none">{exam.daysLeft}</span>
                    <span className="block text-[10px] font-semibold text-text-muted tracking-widest uppercase mt-1">Days Left</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs text-text-muted">Required Velocity</span>
                    <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                      <Flame className="w-4 h-4 text-orange-500" />
                      {exam.remainingTopics === 0 ? 'Done! 🎉' : `${exam.velocity} topics / day`}
                    </span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-xs text-text-muted">Remaining</span>
                    <span className="text-sm font-bold text-white mt-0.5">{exam.remainingTopics} topics</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-text-muted text-sm bg-surface-2/20 rounded-xl border border-white/5 border-dashed">
            No exams scheduled. Add one to start pacing!
          </div>
        )}
      </section>

      {/* Add Exam Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#060e20]/80 backdrop-blur-md p-4">
          <div className="bg-[#0b1326] border border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-sm relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Add Exam</h3>
            
            <form onSubmit={handleAddExam} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-widest block mb-2">Subject</label>
                <select 
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full bg-[#131b2e] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo/50 transition-all"
                  required
                >
                  {subjectStats.map(s => (
                    <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-widest block mb-2">Exam Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Midterm 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#131b2e] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo/50 transition-all placeholder:text-white/20"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-widest block mb-2">Date</label>
                <input 
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-[#131b2e] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo/50 transition-all"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

              <button 
                type="submit"
                disabled={isPending}
                className="w-full py-3 mt-2 rounded-lg gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 glow-primary disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Exam'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
