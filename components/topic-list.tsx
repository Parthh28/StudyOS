'use client'

import { useState, useTransition } from 'react'
import { updateTopicChecklist, updateTopicConfidence } from '@/lib/actions/data'
import { CheckCircle2, Circle, Loader2, BookOpen, FileText, RefreshCw } from 'lucide-react'

type TopicListProps = {
  units: any[]
}

export function TopicList({ units }: TopicListProps) {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'notes' | 'revision'>('syllabus')
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({})
  const [isPending, startTransition] = useTransition()

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }))
  }

  const handleToggleTopic = (topicId: string, currentStatus: boolean, field: 'status' | 'notes_completed' | 'revision_completed') => {
    startTransition(async () => {
      await updateTopicChecklist(topicId, field, !currentStatus)
    })
  }

  const handleConfidenceUpdate = (e: React.MouseEvent, topicId: string, score: number) => {
    e.stopPropagation()
    startTransition(async () => {
      await updateTopicConfidence(topicId, score)
    })
  }

  // Determine which database field to check/update based on active tab
  const getField = () => {
    if (activeTab === 'notes') return 'notes_completed'
    if (activeTab === 'revision') return 'revision_completed'
    return 'status'
  }

  const getStatus = (topic: any) => {
    if (activeTab === 'notes') return !!topic.notes_completed
    if (activeTab === 'revision') return !!topic.revision_completed
    return topic.status === 'completed'
  }

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex bg-surface-2/30 rounded-lg p-1 mb-6 border border-white/5">
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`flex-1 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'syllabus' ? 'bg-indigo text-white shadow-lg' : 'text-text-muted hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Syllabus
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'notes' ? 'bg-violet text-white shadow-lg' : 'text-text-muted hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Notes
        </button>
        <button
          onClick={() => setActiveTab('revision')}
          className={`flex-1 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'revision' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-text-muted hover:text-white'
          }`}
        >
          <RefreshCw className="w-4 h-4" /> Revision
        </button>
      </div>
      
      {units.map((unit, index) => {
        const isExpanded = expandedUnits[unit.id] ?? index === 0 // First unit expanded by default
        const totalTopics = unit.topics.length
        const completedTopics = unit.topics.filter((t: any) => getStatus(t)).length
        
        return (
          <div key={unit.id} className="glass rounded-xl overflow-hidden border border-white/5">
            {/* Accordion Header */}
            <div 
              className="p-4 flex justify-between items-center cursor-pointer bg-surface-2/30 hover:bg-surface-2/50 transition-colors"
              onClick={() => toggleUnit(unit.id)}
            >
              <div className="flex items-center gap-3">
                <span className={`text-text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                  ▶
                </span>
                <span className="text-md font-bold text-white line-clamp-1">
                  {unit.name}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0 w-28 sm:w-36 ml-4">
                <div className="flex justify-between items-baseline w-full">
                  <span className="text-[10px] sm:text-xs font-semibold text-text-muted whitespace-nowrap">
                    {completedTopics}/{totalTopics} Completed
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-white">
                    {totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      activeTab === 'syllabus' ? 'bg-indigo' : activeTab === 'notes' ? 'bg-violet' : 'bg-fuchsia-600'
                    }`}
                    style={{ width: `${totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Accordion Body */}
            {isExpanded && (
              <div className="p-2 bg-[#060e20]/50 border-t border-white/5 space-y-1">
                {unit.topics.map((topic: any) => {
                  const isCompleted = getStatus(topic)
                  const field = getField()
                  
                  return (
                    <div 
                      key={topic.id}
                      onClick={() => handleToggleTopic(topic.id, isCompleted, field)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        isCompleted 
                          ? 'hover:bg-white/5 opacity-70' 
                          : 'bg-white/5 border border-indigo/20 hover:bg-indigo/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isPending ? (
                          <Loader2 className="w-5 h-5 text-indigo animate-spin" />
                        ) : isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <Circle className="w-5 h-5 text-text-muted hover:text-indigo transition-colors" />
                        )}
                        <span className={`text-md ${isCompleted ? 'text-text-muted line-through' : 'text-indigo font-semibold'}`}>
                          {topic.name}
                        </span>
                      </div>
                      <div className={`text-xs font-semibold ${isCompleted ? 'text-text-muted' : 'text-indigo'} flex items-center gap-2 sm:gap-4`}>
                        {isCompleted && (
                          <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-full border border-white/5" onClick={e => e.stopPropagation()}>
                            <button 
                              onClick={(e) => handleConfidenceUpdate(e, topic.id, 2)}
                              className={`w-3 h-3 rounded-full transition-all ${topic.confidence_score === 2 ? 'bg-red-500 scale-125 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-red-500/20 hover:bg-red-500/50'}`}
                              title="Weak (Red)"
                            />
                            <button 
                              onClick={(e) => handleConfidenceUpdate(e, topic.id, 5)}
                              className={`w-3 h-3 rounded-full transition-all ${topic.confidence_score === 5 ? 'bg-yellow-500 scale-125 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-yellow-500/20 hover:bg-yellow-500/50'}`}
                              title="Okay (Yellow)"
                            />
                            <button 
                              onClick={(e) => handleConfidenceUpdate(e, topic.id, 8)}
                              className={`w-3 h-3 rounded-full transition-all ${topic.confidence_score === 8 ? 'bg-green-500 scale-125 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-green-500/20 hover:bg-green-500/50'}`}
                              title="Strong (Green)"
                            />
                          </div>
                        )}
                        <span className="hidden sm:inline-block">{activeTab === 'syllabus' ? 'Topic' : activeTab === 'notes' ? 'Notes' : 'Revision'}</span>
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
