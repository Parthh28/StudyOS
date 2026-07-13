'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateTopicChecklist, updateTopicMasteryLevel } from '@/lib/actions/data'
import { CheckCircle2, Circle, Loader2, BookOpen, FileText, RefreshCw, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

type TopicListProps = {
  units: any[]
}

export function TopicList({ units }: TopicListProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'syllabus' | 'notes' | 'revision'>('syllabus')
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({})
  const [optimisticMastery, setOptimisticMastery] = useState<Record<string, 'weak' | 'normal' | 'mastered'>>({})
  const [isPending, startTransition] = useTransition()

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }))
  }

  const handleToggleTopic = (topicId: string, currentStatus: boolean, field: 'status' | 'notes_completed' | 'revision_completed') => {
    startTransition(async () => {
      await updateTopicChecklist(topicId, field, !currentStatus)
    })
  }

  const handleMasteryLevelSelect = (e: React.MouseEvent, topicId: string, level: 'weak' | 'normal' | 'mastered') => {
    e.preventDefault()
    e.stopPropagation()

    // 1. Immediately update local optimistic state so button highlights instantly
    setOptimisticMastery(prev => ({ ...prev, [topicId]: level }))

    if (level === 'weak') {
      toast.success('Topic marked as WEAK — added to Weak Sections Hub')
    } else if (level === 'mastered') {
      toast.success('Topic marked as MASTERED!')
    } else {
      toast.success('Topic marked as NORMAL')
    }

    // 2. Perform server update asynchronously
    startTransition(async () => {
      await updateTopicMasteryLevel(topicId, level)
      router.refresh()
    })
  }

  const getStatus = (topic: any) => {
    if (activeTab === 'notes') return !!topic.notes_completed
    if (activeTab === 'revision') return !!topic.revision_completed
    return topic.status === 'completed'
  }

  const getMasteryLevel = (topic: any): 'weak' | 'normal' | 'mastered' => {
    if (optimisticMastery[topic.id]) {
      return optimisticMastery[topic.id]
    }
    if (topic.confidence_score > 0 && topic.confidence_score <= 3) return 'weak'
    if (topic.status === 'needs_revision') return 'weak'
    if (topic.confidence_score >= 8 || topic.status === 'completed') return 'mastered'
    return 'normal'
  }

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex bg-surface-2/30 rounded-lg p-1 mb-6 border border-border">
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`flex-1 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'syllabus' ? 'bg-primary text-primary-foreground shadow-md' : 'text-text-muted hover:text-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Syllabus
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'notes' ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-md' : 'text-text-muted hover:text-foreground'
          }`}
        >
          <FileText className="w-4 h-4" /> Notes
        </button>
        <button
          onClick={() => setActiveTab('revision')}
          className={`flex-1 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'revision' ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-md' : 'text-text-muted hover:text-foreground'
          }`}
        >
          <RefreshCw className="w-4 h-4" /> Revision
        </button>
      </div>

      {units.map((unit, index) => {
        const isExpanded = expandedUnits[unit.id] ?? index === 0
        const totalTopics = unit.topics.length
        const completedTopics = unit.topics.filter((t: any) => getStatus(t)).length

        return (
          <div key={unit.id} className="bg-card rounded-xl overflow-hidden border border-border shadow-sm">
            {/* Accordion Header */}
            <div
              className="p-4 flex justify-between items-center cursor-pointer bg-surface-2/30 hover:bg-surface-2/50 transition-colors"
              onClick={() => toggleUnit(unit.id)}
            >
              <div className="flex items-center gap-3">
                <span className={`text-text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                  ▶
                </span>
                <span className="text-md font-bold text-foreground line-clamp-1">
                  {unit.name}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium">
                <span className="text-text-muted">
                  {completedTopics} / {totalTopics} completed
                </span>
              </div>
            </div>

            {/* Accordion Content */}
            {isExpanded && (
              <div className="p-2 space-y-1.5 divide-y divide-border/40">
                {unit.topics.map((topic: any) => {
                  const isCompleted = getStatus(topic)
                  const mastery = getMasteryLevel(topic)
                  const field = activeTab === 'notes' ? 'notes_completed' : activeTab === 'revision' ? 'revision_completed' : 'status'

                  return (
                    <div
                      key={topic.id}
                      onClick={() => handleToggleTopic(topic.id, isCompleted, field)}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl transition-all gap-3 cursor-pointer ${
                        isCompleted
                          ? 'bg-success/5 border border-success/20'
                          : 'bg-card border border-border/80 hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isPending ? (
                          <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                        ) : isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-text-muted hover:text-primary transition-colors shrink-0" />
                        )}
                        <span
                          className={`text-sm sm:text-md truncate ${
                            isCompleted ? 'text-text-muted line-through' : 'text-foreground font-semibold'
                          }`}
                        >
                          {topic.name}
                        </span>
                      </div>

                      {/* Explicit Mastery Level Selector (Weak | Normal | Mastered) */}
                      <div
                        className="flex items-center gap-1 self-end sm:self-center shrink-0 bg-surface/90 p-1 rounded-lg border border-border"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleMasteryLevelSelect(e, topic.id, 'weak')}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            mastery === 'weak'
                              ? 'bg-danger text-white shadow-sm'
                              : 'text-text-muted hover:text-foreground hover:bg-surface-2'
                          }`}
                        >
                          Weak
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleMasteryLevelSelect(e, topic.id, 'normal')}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            mastery === 'normal'
                              ? 'bg-primary/20 text-primary border border-primary/30 font-extrabold'
                              : 'text-text-muted hover:text-foreground hover:bg-surface-2'
                          }`}
                        >
                          Normal
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleMasteryLevelSelect(e, topic.id, 'mastered')}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            mastery === 'mastered'
                              ? 'bg-success text-white shadow-sm'
                              : 'text-text-muted hover:text-foreground hover:bg-surface-2'
                          }`}
                        >
                          Mastered
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
