import { SubjectEntity, TopicEntity, DiagnosticSummary, MasteryLevel } from '@/types/domain'

/**
 * Domain Engine: Pure deterministic domain logic for academic mastery & diagnostics.
 */
export class MasteryEngine {
  /**
   * Evaluates the explicit or derived mastery level of a topic.
   */
  static evaluateTopicMastery(topic: TopicEntity): MasteryLevel {
    if (topic.mastery_level) return topic.mastery_level
    if (topic.confidence_score <= 3 || topic.status === 'needs_revision') return 'weak'
    if (topic.confidence_score >= 8 || (topic.status === 'completed' && topic.confidence_score >= 6)) return 'mastered'
    return 'normal'
  }

  /**
   * Calculates overall subject completion percentage.
   */
  static calculateSubjectProgress(subject: SubjectEntity): number {
    const units = subject.units || []
    let totalTopics = 0
    let completedTopics = 0

    for (const unit of units) {
      for (const topic of unit.topics || []) {
        totalTopics++
        if (topic.status === 'completed') {
          completedTopics++
        }
      }
    }

    if (totalTopics === 0) return 0
    return Math.round((completedTopics / totalTopics) * 100)
  }

  /**
   * Aggregates a full diagnostic mastery summary across all subjects and topics.
   */
  static generateDiagnosticSummary(subjects: SubjectEntity[]): DiagnosticSummary {
    const weakSubjects: SubjectEntity[] = []
    const masteredSubjects: SubjectEntity[] = []
    const weakTopics: DiagnosticSummary['weakTopics'] = []
    const masteredTopics: DiagnosticSummary['masteredTopics'] = []

    let totalTopicsCount = 0
    let masteredTopicsCount = 0

    for (const subject of subjects) {
      if (subject.mastery_status === 'weak') {
        weakSubjects.push(subject)
      } else if (subject.mastery_status === 'mastered') {
        masteredSubjects.push(subject)
      }

      const units = subject.units || []
      for (const unit of units) {
        for (const topic of unit.topics || []) {
          totalTopicsCount++
          const mastery = this.evaluateTopicMastery(topic)

          if (mastery === 'weak') {
            weakTopics.push({
              topic,
              subjectName: subject.name,
              subjectColor: subject.color,
            })
          } else if (mastery === 'mastered') {
            masteredTopicsCount++
            masteredTopics.push({
              topic,
              subjectName: subject.name,
              subjectColor: subject.color,
            })
          }
        }
      }
    }

    const totalMasteryPercentage =
      totalTopicsCount > 0 ? Math.round((masteredTopicsCount / totalTopicsCount) * 100) : 0

    return {
      weakSubjects,
      masteredSubjects,
      weakTopics,
      masteredTopics,
      totalMasteryPercentage,
    }
  }
}
