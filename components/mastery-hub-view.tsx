'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  CheckCircle2,
  Target,
  Search,
  BookOpen,
  Loader2,
  ArrowRight,
  Award,
} from 'lucide-react'
import { updateTopicMasteryLevel, updateSubjectMasteryLevel } from '@/lib/actions/data'
import { toast } from 'sonner'

interface SubjectItem {
  id: string
  name: string
  code: string
  color: string
  icon: string
  mastery_status?: string
}

interface TopicItem {
  id: string
  name: string
  subject_id: string
  difficulty: string
  priority: string
  time_spent_mins: number
  confidence_score: number
  status: string
  mastery_level: 'weak' | 'normal' | 'mastered'
}

export function MasteryHubView({
  subjects,
  initialTopics,
}: {
  subjects: SubjectItem[]
  initialTopics: TopicItem[]
}) {
  const router = useRouter()
  const [topics, setTopics] = useState<TopicItem[]>(initialTopics)
  const [activeTab, setActiveTab] = useState<'weak' | 'mastered' | 'all'>('weak')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const subjectMap = new Map(subjects.map((s) => [s.id, s]))

  // Filtered topics
  const filteredTopics = topics.filter((t) => {
    if (activeTab === 'weak' && t.mastery_level !== 'weak') return false
    if (activeTab === 'mastered' && t.mastery_level !== 'mastered') return false
    if (selectedSubjectId !== 'all' && t.subject_id !== selectedSubjectId) return false
    if (searchQuery.trim()) {
      return t.name.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  // Weak subjects: Subjects explicitly marked weak or containing any weak topic
  const weakSubjects = subjects.filter((s) => {
    if (s.mastery_status === 'weak') return true
    return topics.some((t) => t.subject_id === s.id && t.mastery_level === 'weak')
  })

  // Mastered subjects: Subjects where all topics are completed/mastered
  const masteredSubjects = subjects.filter((s) => {
    const subTopics = topics.filter((t) => t.subject_id === s.id)
    if (subTopics.length === 0) return false
    return subTopics.every((t) => t.mastery_level === 'mastered')
  })

  const weakTopicsCount = topics.filter((t) => t.mastery_level === 'weak').length
  const masteredTopicsCount = topics.filter((t) => t.mastery_level === 'mastered').length

  const handleTopicStatusChange = async (topicId: string, level: 'weak' | 'normal' | 'mastered') => {
    setUpdatingId(topicId)
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, mastery_level: level } : t))
    )

    const res = await updateTopicMasteryLevel(topicId, level)
    setUpdatingId(null)
    if (res.success) {
      toast.success(`Topic marked as ${level.toUpperCase()}`)
      router.refresh()
    } else {
      toast.error('Failed to update topic status')
    }
  }

  const handleSubjectStatusChange = async (subjectId: string, level: 'weak' | 'normal' | 'mastered') => {
    const res = await updateSubjectMasteryLevel(subjectId, level)
    if (res.success) {
      toast.success(`Subject status updated to ${level.toUpperCase()}`)
      router.refresh()
    }
  }

  return (
    <div className="space-y-8">
      {/* Precision 4-Metric Diagnostic Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Weak Subjects */}
        <div className="bg-card/90 border border-border/70 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono font-bold tracking-wider text-text-muted uppercase">
              WEAK SUBJECTS
            </p>
            <h3 className="text-2xl font-mono font-bold text-danger mt-1">
              {weakSubjects.length}
            </h3>
            <p className="text-[11px] text-text-muted mt-1">Courses requiring urgent review</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center text-danger">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Weak Topics */}
        <div className="bg-card/90 border border-border/70 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono font-bold tracking-wider text-text-muted uppercase">
              WEAK TOPICS
            </p>
            <h3 className="text-2xl font-mono font-bold text-danger mt-1">
              {weakTopicsCount}
            </h3>
            <p className="text-[11px] text-text-muted mt-1">Specific topics flagged for revision</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center text-danger">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Mastered Subjects */}
        <div className="bg-card/90 border border-border/70 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono font-bold tracking-wider text-text-muted uppercase">
              MASTERED SUBJECTS
            </p>
            <h3 className="text-2xl font-mono font-bold text-success mt-1">
              {masteredSubjects.length}
            </h3>
            <p className="text-[11px] text-text-muted mt-1">Courses 100% completed</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Mastered Topics */}
        <div className="bg-card/90 border border-border/70 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono font-bold tracking-wider text-text-muted uppercase">
              MASTERED TOPICS
            </p>
            <h3 className="text-2xl font-mono font-bold text-success mt-1">
              {masteredTopicsCount}
            </h3>
            <p className="text-[11px] text-text-muted mt-1">Fully consolidated topics</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Weak Subjects Focus Grid */}
      {weakSubjects.length > 0 && activeTab === 'weak' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold text-foreground uppercase tracking-wider">
              Weak Subjects
            </h2>
            <span className="text-xs text-text-muted">
              Subjects containing flagged weak topics
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weakSubjects.map((sub) => {
              const subWeakTopics = topics.filter(
                (t) => t.subject_id === sub.id && t.mastery_level === 'weak'
              )
              return (
                <div
                  key={sub.id}
                  className="bg-card border border-border/70 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-border transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-danger/10 text-danger border border-danger/20">
                        WEAK SUBJECT
                      </span>
                      <h3 className="text-base font-bold text-foreground mt-2">{sub.name}</h3>
                      <p className="text-xs text-text-muted">
                        Course Code: <strong className="font-mono text-foreground">{sub.code}</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSubjectStatusChange(sub.id, 'normal')}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-surface hover:bg-surface-2 text-text-muted hover:text-foreground border border-border transition-all"
                    >
                      Mark Normal
                    </button>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-xs text-danger font-mono font-medium">
                      {subWeakTopics.length} weak topics inside
                    </span>
                    <Link
                      href={`/subjects/${sub.id}`}
                      className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Open Subject <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mastered Subjects Hall Grid */}
      {masteredSubjects.length > 0 && activeTab === 'mastered' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold text-success uppercase tracking-wider">
              Mastered Subjects
            </h2>
            <span className="text-xs text-text-muted">Courses where all topics are mastered</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {masteredSubjects.map((sub) => (
              <div
                key={sub.id}
                className="bg-card border border-success/30 rounded-xl p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-success/10 text-success border border-success/20">
                    MASTERED SUBJECT
                  </span>
                  <h3 className="text-base font-bold text-foreground mt-2">{sub.name}</h3>
                  <p className="text-xs text-text-muted">All topics completed!</p>
                </div>
                <Link
                  href={`/subjects/${sub.id}`}
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  View Subject <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Topics Table Section */}
      <div className="bg-card/90 border border-border/70 rounded-2xl p-5 md:p-6 space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border/70">
            <button
              type="button"
              onClick={() => setActiveTab('weak')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'weak'
                  ? 'bg-danger text-white shadow-xs'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              Weak Topics ({weakTopicsCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mastered')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'mastered'
                  ? 'bg-success text-white shadow-xs'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              Mastered Topics ({masteredTopicsCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'gradient-primary text-white shadow-xs'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              All Topics ({topics.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="bg-surface border border-border rounded-xl px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:border-primary"
            >
              <option value="all">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-surface border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary w-44"
              />
            </div>
          </div>
        </div>

        {/* Topics List Table */}
        {filteredTopics.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <p className="text-sm font-semibold text-foreground">No topics match your filter</p>
            <p className="text-xs text-text-muted">
              Switch tabs or change your subject filter to see more topics.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredTopics.map((topic) => {
              const subject = subjectMap.get(topic.subject_id)
              const isUpdating = updatingId === topic.id

              return (
                <div
                  key={topic.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-surface/40 px-2 rounded-xl transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-muted">
                        {subject?.code || 'SUB'}
                      </span>
                      <span className="text-xs font-bold text-foreground truncate">
                        {topic.name}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted flex items-center gap-3">
                      <span>{subject?.name}</span>
                      <span className="font-mono">Time: {topic.time_spent_mins || 0}m</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                    <button
                      type="button"
                      onClick={() => handleTopicStatusChange(topic.id, 'weak')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        topic.mastery_level === 'weak'
                          ? 'bg-danger text-white shadow-xs'
                          : 'bg-surface text-text-muted hover:text-foreground border border-border/70'
                      }`}
                    >
                      Weak
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTopicStatusChange(topic.id, 'normal')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        topic.mastery_level === 'normal'
                          ? 'bg-primary/20 text-primary border border-primary/40 font-bold'
                          : 'bg-surface text-text-muted hover:text-foreground border border-border/70'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTopicStatusChange(topic.id, 'mastered')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        topic.mastery_level === 'mastered'
                          ? 'bg-success text-white shadow-xs'
                          : 'bg-surface text-text-muted hover:text-foreground border border-border/70'
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
    </div>
  )
}
