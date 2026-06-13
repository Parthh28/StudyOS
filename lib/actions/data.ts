'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SYLLABUS_DATA } from '@/lib/syllabus-data'

/**
 * Updates a topic's status and confidence score.
 */
export async function updateTopicStatus(
  topicId: string,
  status: 'pending' | 'in_progress' | 'completed',
  confidenceScore?: number
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const updatePayload: any = { status }
  if (confidenceScore !== undefined) {
    updatePayload.confidence_score = confidenceScore
  }

  const { error } = await supabase
    .from('topic_progress')
    .upsert(
      { topic_id: topicId, user_id: user.id, ...updatePayload },
      { onConflict: 'user_id,topic_id' }
    )

  if (error) {
    console.error('Failed to update topic progress:', error)
    return { success: false, error: 'Failed to update topic progress' }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/subjects/[id]`, 'page') // Revalidate specific subject page
  return { success: true }
}

/**
 * Updates a specific checklist for a topic (Syllabus, Notes, or Revision).
 */
export async function updateTopicChecklist(
  topicId: string,
  field: 'status' | 'notes_completed' | 'revision_completed',
  isCompleted: boolean
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  let updatePayload: any = {}
  if (field === 'status') {
    updatePayload.status = isCompleted ? 'completed' : 'pending'
  } else {
    updatePayload[field] = isCompleted
  }

  const { error } = await supabase
    .from('topic_progress')
    .upsert(
      { topic_id: topicId, user_id: user.id, ...updatePayload },
      { onConflict: 'user_id,topic_id' }
    )

  if (error) {
    console.error('Failed to update topic checklist:', error)
    return { success: false, error: 'Failed to update topic checklist' }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/subjects/[id]`, 'page')
  return { success: true }
}

/**
 * Logs a new study session.
 */
export async function logStudySession(data: {
  subject_id?: string
  topic_id?: string
  duration_mins: number
  session_type: 'study' | 'revision' | 'practice' | 'exam' | 'pomodoro'
  notes?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase.from('study_sessions').insert({
    user_id: user.id,
    ...data,
  })

  if (error) {
    console.error('Failed to log study session:', error)
    return { success: false, error: 'Failed to log study session' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/analytics') // Update graphs and doughnut charts immediately
  return { success: true }
}

/**
 * Fetches data required for the main dashboard.
 */
export async function getDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, data: null }

  // 1. Get profile stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, weekly_goal_hours')
    .eq('id', user.id)
    .single()

  // 2. Get subject stats (using the secure view we created)
  const { data: subjectStatsRaw } = await supabase
    .from('subject_stats')
    .select('*')
    .order('subject_name')

  // Merge missing visual properties (color, icon, code) that aren't in the view
  const { data: subjects } = await supabase.from('subjects').select('id, color, icon, code')
  
  const subjectStats = subjectStatsRaw?.map(stat => {
    const sub = subjects?.find(s => s.id === stat.subject_id)
    return {
      ...stat,
      subject_color: sub?.color || '#6366F1',
      subject_icon: sub?.icon || 'BookOpen',
      subject_code: sub?.code || 'SUBJ'
    }
  })

  // 3. Get recent study sessions
  const { data: recentSessions } = await supabase
    .from('study_sessions')
    .select('*, subject:subjects(name, color), topic:topics(name)')
    .order('started_at', { ascending: false })
    .limit(5)
    
  // 4. Calculate total hours studied this week (Monday to Sunday)
  // Get start of current week in JS
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)))
  startOfWeek.setHours(0, 0, 0, 0)
  
  const { data: thisWeekSessions } = await supabase
    .from('study_sessions')
    .select('duration_mins')
    .gte('started_at', startOfWeek.toISOString())
    
  const hoursStudiedThisWeek = (thisWeekSessions || []).reduce((acc, curr) => acc + (curr.duration_mins || 0), 0) / 60

  // 5. Get To-Dos
  const { data: todos } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: true })

  // 6. Get Exams
  const { data: exams } = await supabase
    .from('exams')
    .select('*')
    .eq('status', 'upcoming')
    .order('exam_date', { ascending: true })

  return {
    success: true,
    data: {
      profile,
      subjectStats: subjectStats || [],
      recentSessions: recentSessions || [],
      hoursStudiedThisWeek,
      todos: todos || [],
      exams: exams || [],
    },
  }
}

/**
 * Fetches all details for a single subject, including units and topics.
 */
export async function getSubjectDetails(subjectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // We do a nested select to get Subject -> Units -> Topics
  const { data: subject, error } = await supabase
    .from('subjects')
    .select(`
      *,
      units (
        *,
        topics (*)
      )
    `)
    .eq('id', subjectId)
    .single()

  if (error || !subject) {
    console.error('Failed to fetch subject details:', error)
    return { success: false, data: null }
  }

  // Fetch user's topic progress for this subject
  let progressMap: Record<string, any> = {}
  if (user) {
    // Collect all topic IDs
    const topicIds: string[] = []
    subject.units?.forEach((u: any) => {
      u.topics?.forEach((t: any) => topicIds.push(t.id))
    })

    if (topicIds.length > 0) {
      const { data: progressData } = await supabase
        .from('topic_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('topic_id', topicIds)

      progressData?.forEach((p) => {
        progressMap[p.topic_id] = p
      })
    }
  }

  // Sort units and topics by order_index and created_at, and merge progress
  if (subject.units) {
    subject.units.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
    
    // Find the static subject to get original topic order
    const staticSubject = SYLLABUS_DATA.find((s) => s.code === subject.code)

    subject.units.forEach((unit: any) => {
      if (unit.topics) {
        // Merge progress data into topics
        unit.topics = unit.topics.map((t: any) => {
          const progress = progressMap[t.id]
          if (progress) {
            return {
              ...t,
              status: progress.status,
              confidence_score: progress.confidence_score,
              time_spent_mins: progress.time_spent_mins,
              last_studied: progress.last_studied,
              next_revision: progress.next_revision,
              revision_count: progress.revision_count,
              is_bookmarked: progress.is_bookmarked,
              notes_completed: progress.notes_completed,
              revision_completed: progress.revision_completed,
            }
          } else {
            // Default progress if no record exists
            return {
              ...t,
              status: 'pending',
              confidence_score: 0,
              time_spent_mins: 0,
              revision_count: 0,
              is_bookmarked: false,
              notes_completed: false,
              revision_completed: false,
            }
          }
        })

        const staticUnit = staticSubject?.units.find((u) => u.name === unit.name)
        
        unit.topics.sort((a: any, b: any) => {
          // Use original syllabus order if available, otherwise fallback to name
          if (staticUnit) {
            const indexA = staticUnit.topics.findIndex((t) => t.name === a.name)
            const indexB = staticUnit.topics.findIndex((t) => t.name === b.name)
            if (indexA !== -1 && indexB !== -1) {
              return indexA - indexB
            }
          }
          return a.name.localeCompare(b.name)
        })
      }
    })
  }

  return { success: true, data: subject }
}

/**
 * Adds a new to-do item for the current user.
 */
export async function addTodo(content: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('todos')
    .insert({ user_id: user.id, content })

  if (error) {
    console.error('Failed to add todo:', error)
    return { success: false, error: 'Failed to add todo' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Toggles the completion status of a to-do item.
 */
export async function toggleTodo(id: string, isCompleted: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('todos')
    .update({ is_completed: isCompleted })
    .eq('id', id)

  if (error) {
    console.error('Failed to toggle todo:', error)
    return { success: false, error: 'Failed to toggle todo' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Deletes a to-do item.
 */
export async function deleteTodo(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to delete todo:', error)
    return { success: false, error: 'Failed to delete todo' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Updates a topic's confidence score.
 */
export async function updateTopicConfidence(topicId: string, score: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('topic_progress')
    .upsert(
      { topic_id: topicId, user_id: user.id, confidence_score: score },
      { onConflict: 'user_id,topic_id' }
    )

  if (error) {
    console.error('Failed to update confidence score:', error)
    return { success: false, error: 'Failed to update confidence score' }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/subjects/[id]`, 'page')
  return { success: true }
}

/**
 * Fetches topics that need revision (confidence score > 0 and <= 4).
 * We only want topics that the user has explicitly rated as weak (Red).
 */
export async function getWeakTopics() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, data: [] }

  const { data: weakTopics, error } = await supabase
    .from('weak_topics')
    .select('*')
    .order('confidence_score', { ascending: true })
    .limit(5)

  if (error) {
    console.error('Failed to fetch weak topics:', error)
    return { success: false, data: [] }
  }

  // Map view results to match the structure expected by components (e.g., subject object)
  const mappedTopics = (weakTopics || []).map(t => ({
    ...t,
    subject: { name: t.subject_name, color: t.subject_color },
    unit: { name: t.unit_name }
  }))

  return { success: true, data: mappedTopics }
}

/**
 * Adds a new exam.
 */
export async function addExam(data: { name: string; subject_id: string; exam_date: string }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('exams')
    .insert({ user_id: user.id, ...data })

  if (error) {
    console.error('Failed to add exam:', error)
    return { success: false, error: 'Failed to add exam' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Searches for topics by name.
 */
export async function searchTopics(query: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, data: [] }

  const { data, error } = await supabase
    .from('topics')
    .select('id, name, subject_id, subject:subjects(name, color)')
    .ilike('name', `%${query}%`)
    .limit(10)

  if (error) {
    console.error('Failed to search topics:', error)
    return { success: false, data: [] }
  }

  return { success: true, data: data || [] }
}

/**
 * Fetches notifications (overdue and weak topics).
 */
export async function getNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, data: { overdue: [], weak: [] } }

  const { data: overdue } = await supabase
    .from('overdue_topics')
    .select('id, name, subject_id, subject_name, subject_color, next_revision')
    .limit(5)

  const { data: weakRaw } = await supabase
    .from('weak_topics')
    .select('id, name, subject_id, subject_name, subject_color')
    .limit(5)

  // Map to the format the UI expects for weak topics
  const weak = (weakRaw || []).map(w => ({
    ...w,
    subject: { name: w.subject_name, color: w.subject_color }
  }))

  return { 
    success: true, 
    data: { 
      overdue: overdue || [], 
      weak: weak || [] 
    } 
  }
}

/**
 * Updates an existing exam.
 */
export async function updateExam(id: string, data: { name: string; subject_id: string; exam_date: string }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('exams')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id) // Ensure they own it

  if (error) {
    console.error('Failed to update exam:', error)
    return { success: false, error: 'Failed to update exam' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Deletes an existing exam.
 */
export async function deleteExam(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('exams')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // Ensure they own it

  if (error) {
    console.error('Failed to delete exam:', error)
    return { success: false, error: 'Failed to delete exam' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
