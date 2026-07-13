'use client'

import { useState, useTransition } from 'react'
import { Calendar, Plus, Target, Flame, Loader2, X, Pencil, Trash2 } from 'lucide-react'
import { addExam, updateExam, deleteExam } from '@/lib/actions/data'
import { differenceInDays, parseISO } from 'date-fns'

type ExamWidgetProps = {
  exams: any[]
  subjectStats: any[]
}

export function ExamCountdownWidget({ exams, subjectStats }: ExamWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  // Form state
  const [editingExamId, setEditingExamId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [subjectId, setSubjectId] = useState(subjectStats[0]?.subject_id || '')
  const [examDate, setExamDate] = useState('')
  const [error, setError] = useState('')

  const openAddModal = () => {
    setEditingExamId(null)
    setName('')
    setSubjectId(subjectStats[0]?.subject_id || '')
    setExamDate('')
    setError('')
    setIsOpen(true)
  }

  const openEditModal = (exam: any) => {
    setEditingExamId(exam.id)
    setName(exam.name)
    setSubjectId(exam.subject_id)
    setExamDate(exam.exam_date)
    setError('')
    setIsOpen(true)
  }

  const handleDeleteExam = async (id: string) => {
    if (confirm('Are you sure you want to delete this exam?')) {
      startTransition(async () => {
        const res = await deleteExam(id)
        if (res.success) {
          setIsOpen(false)
        } else {
          setError(res.error || 'Failed to delete exam')
        }
      })
    }
  }

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !subjectId || !examDate) {
      setError('Please fill all fields')
      return
    }

    setError('')
    startTransition(async () => {
      const res = editingExamId 
        ? await updateExam(editingExamId, { name, subject_id: subjectId, exam_date: examDate })
        : await addExam({ name, subject_id: subjectId, exam_date: examDate })
        
      if (res.success) {
        setIsOpen(false)
        setName('')
        setExamDate('')
        setEditingExamId(null)
      } else {
        setError(res.error || 'Failed to save exam')
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
      subjectColor: subject?.subject_color || '#2563EB',
      remainingTopics,
      daysLeft,
      velocity
    }
  }).sort((a, b) => a.daysLeft - b.daysLeft)

  return (
    <>
      <section className="bg-card border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <h3 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              Exam Countdown
            </h3>
            <p className="text-xs text-text-muted mt-0.5">Next 14 days · Pacing & required velocity</p>
          </div>
          <button 
            onClick={openAddModal}
            className="px-3 py-1.5 rounded-lg bg-background border border-border text-foreground text-xs font-semibold hover:bg-surface-2 transition-all inline-flex items-center gap-1 shadow-sm"
            title="Add Exam"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add exam</span>
          </button>
        </div>

        {enrichedExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {enrichedExams.map(exam => (
              <div key={exam.id} className="group bg-surface-2 border border-border rounded-xl p-4 flex flex-col justify-between hover:border-border/80 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: exam.subjectColor }}></div>
                      <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">{exam.subjectName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-md font-semibold text-foreground">{exam.name}</h4>
                      <button onClick={() => openEditModal(exam)} className="text-text-muted hover:text-foreground transition-colors p-1 rounded-full hover:bg-card opacity-0 group-hover:opacity-100 focus:opacity-100">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary leading-none">{exam.daysLeft}d</span>
                    <span className="block text-[10px] font-semibold text-text-muted tracking-widest uppercase mt-1">Remaining</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-border flex justify-between items-center">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-2xl w-full max-w-sm relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-foreground transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-foreground mb-6">{editingExamId ? 'Edit Exam' : 'Add Exam'}</h3>
            
            <form onSubmit={handleSaveExam} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-widest block mb-2">Subject</label>
                <select 
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary transition-all"
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
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary transition-all placeholder:text-text-muted"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-widest block mb-2">Date</label>
                <input 
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary transition-all"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

              <div className="flex gap-2 mt-2">
                <button 
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 glow-primary disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingExamId ? 'Update Exam' : 'Create Exam')}
                </button>
                {editingExamId && (
                  <button 
                    type="button"
                    onClick={() => handleDeleteExam(editingExamId)}
                    disabled={isPending}
                    className="px-4 py-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm font-semibold transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
