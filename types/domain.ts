/**
 * StudyOS Domain Layer
 * Pure domain entities, value objects, and domain enums decoupled from framework or database layer.
 */

export type MasteryLevel = 'weak' | 'normal' | 'mastered'

export type SubjectType = 'theory' | 'lab'

export interface TopicEntity {
  id: string
  unit_id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'needs_revision'
  confidence_score: number // 1 - 10
  notes_completed: boolean
  revision_completed: boolean
  mastery_level?: MasteryLevel
}

export interface UnitEntity {
  id: string
  subject_id: string
  name: string
  order_index: number
  topics: TopicEntity[]
}

export interface SubjectEntity {
  id: string
  user_id: string
  name: string
  code: string
  color: string
  type: SubjectType
  mastery_status?: MasteryLevel
  order_index: number
  units?: UnitEntity[]
}

export interface DiagnosticSummary {
  weakSubjects: SubjectEntity[]
  masteredSubjects: SubjectEntity[]
  weakTopics: {
    topic: TopicEntity
    subjectName: string
    subjectColor: string
  }[]
  masteredTopics: {
    topic: TopicEntity
    subjectName: string
    subjectColor: string
  }[]
  totalMasteryPercentage: number
}

export interface TodoTaskEntity {
  id: string
  user_id: string
  subject_id?: string
  task_text: string
  is_completed: boolean
  priority: 'low' | 'normal' | 'high'
  created_at: string
}

export interface ExamDeadlineEntity {
  id: string
  user_id: string
  subject_id?: string
  name: string
  exam_date: string
  weight_percentage?: number
}
