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

  // Calculate start of current week in JS (Monday to Sunday)
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)))
  startOfWeek.setHours(0, 0, 0, 0)

  // Execute all independent queries in parallel to drastically reduce load time
  const [
    { data: profile },
    { data: subjectStatsRaw },
    { data: subjects },
    { data: allTopics },
    { data: allProgress },
    { data: recentSessions },
    { data: thisWeekSessions },
    { data: todos },
    { data: exams }
  ] = await Promise.all([
    // 1. Get profile stats
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    // 2. Get subject stats
    supabase.from('subject_stats').select('*').order('subject_name'),
    // Merge missing visual properties
    supabase.from('subjects').select('id, color, icon, code'),
    // 3. Get all topics to sync milestone progress
    supabase.from('topics').select('id, subject_id'),
    // 4. Get all topic progress for current user
    supabase.from('topic_progress').select('topic_id, status, notes_completed, revision_completed').eq('user_id', user.id),
    // 5. Get recent study sessions
    supabase.from('study_sessions').select('*, subject:subjects(name, color), topic:topics(name)').order('started_at', { ascending: false }).limit(5),
    // 6. Get this week's sessions
    supabase.from('study_sessions').select('duration_mins').gte('started_at', startOfWeek.toISOString()),
    // 7. Get To-Dos
    supabase.from('todos').select('*').order('created_at', { ascending: true }),
    // 8. Get Exams
    supabase.from('exams').select('*').eq('status', 'upcoming').order('exam_date', { ascending: true })
  ])

  const hoursStudiedThisWeek = (thisWeekSessions || []).reduce((acc, curr) => acc + (curr.duration_mins || 0), 0) / 60

  const progMap = new Map((allProgress || []).map(p => [p.topic_id, p]))

  const subjectStats = subjectStatsRaw?.map(stat => {
    const sub = subjects?.find(s => s.id === stat.subject_id)
    const subTopics = (allTopics || []).filter(t => t.subject_id === stat.subject_id)

    let totalTasks = 0
    let completedTasks = 0

    subTopics.forEach(t => {
      totalTasks += 3
      const prog = progMap.get(t.id)
      if (prog) {
        if (prog.status === 'completed') completedTasks++
        if (prog.notes_completed) completedTasks++
        if (prog.revision_completed) completedTasks++
      }
    })

    const syncedCompletionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      ...stat,
      total_topics: subTopics.length || stat.total_topics,
      completion_pct: syncedCompletionPct,
      subject_color: sub?.color || '#2563EB',
      subject_icon: sub?.icon || 'BookOpen',
      subject_code: sub?.code || 'SUBJ'
    }
  })

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
              mastery_level: progress.mastery_level || (progress.confidence_score >= 8 ? 'mastered' : progress.confidence_score <= 3 && progress.confidence_score > 0 ? 'weak' : 'normal'),
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
              mastery_level: 'normal',
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

  // Strictly query topic_progress for explicitly weak topics (mastery_level === 'weak' or 0 < confidence_score <= 3)
  const { data: weakProgress, error } = await supabase
    .from('topic_progress')
    .select(`
      topic_id,
      confidence_score,
      mastery_level,
      status,
      topics (
        id,
        name,
        subject_id,
        unit_id,
        subjects (
          id,
          name,
          color
        )
      )
    `)
    .eq('user_id', user.id)

  if (error || !weakProgress) {
    return { success: false, data: [] }
  }

  const explicitlyWeak = weakProgress.filter(p =>
    p.mastery_level === 'weak' || (p.confidence_score > 0 && p.confidence_score <= 3)
  )

  const mappedTopics = explicitlyWeak
    .filter(item => item.topics)
    .map(item => {
      const topicObj: any = Array.isArray(item.topics) ? item.topics[0] : item.topics
      const subjectObj: any = topicObj?.subjects
        ? (Array.isArray(topicObj.subjects) ? topicObj.subjects[0] : topicObj.subjects)
        : { name: 'Subject', color: '#00e5ff' }

      return {
        id: topicObj.id,
        name: topicObj.name,
        subject_id: topicObj.subject_id,
        subject_name: subjectObj?.name || 'Subject',
        subject: { name: subjectObj?.name || 'Subject', color: subjectObj?.color || '#00e5ff' },
        confidence_score: item.confidence_score || 2,
        status: item.status || 'needs_revision',
        mastery_level: item.mastery_level || 'weak'
      }
    })

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

/**
 * Uses AI to generate smart study tasks and add them to the user's To-Do list.
 */
export async function generateAiTodos(userPrompt?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Fetch user's subjects
  const { data: subjects } = await supabase.from('subjects').select('name, code').eq('user_id', user.id)
  const subjectNames = subjects?.map(s => s.name) || ['Study & Revision']

  let generatedTasks: string[] = []

  const apiKey = process.env.GEMINI_API_KEY
  if (apiKey) {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an academic study coach AI. Given the user request or current subjects, generate exactly 3 concise, highly actionable study tasks for today's to-do list.
User Request: ${userPrompt || 'Generate optimal study tasks for today'}
User Subjects: ${subjectNames.join(', ')}
Return ONLY a valid JSON array of 3 string task items, nothing else. Example: ["Review Analog Circuits formulas for 25 mins", "Practice 5 problems on Digital Electronics", "Summarize core concepts from recent notes"]`
            }]
          }]
        })
      })

      if (response.ok) {
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const match = text.match(/\[[\s\S]*?\]/)
        if (match) {
          const parsed = JSON.parse(match[0])
          if (Array.isArray(parsed) && parsed.length > 0) {
            generatedTasks = parsed.slice(0, 3)
          }
        }
      }
    } catch (err) {
      console.error('Gemini API call failed for generateAiTodos:', err)
    }
  }

  // Fallback if Gemini unavailable or rate-limited
  if (generatedTasks.length === 0) {
    const sub1 = subjectNames[0] || 'Analog Circuits'
    const sub2 = subjectNames[1] || subjectNames[0] || 'Digital Electronics'
    if (userPrompt && userPrompt.trim().length > 2) {
      generatedTasks = [
        `AI Task: ${userPrompt.trim()} - Step 1: Core lecture review (25m)`,
        `AI Task: ${userPrompt.trim()} - Step 2: Practice problems & exercises (25m)`,
        `AI Task: ${userPrompt.trim()} - Step 3: Self-test & summary notes (15m)`
      ]
    } else {
      generatedTasks = [
        `Complete 1 Pomodoro session (25m) revising ${sub1} formulas`,
        `Solve 5 practice problems or lab exercises for ${sub2}`,
        `Review weak topic notes and flashcards for 15 minutes`
      ]
    }
  }

  // Insert generated tasks into todos table
  const records = generatedTasks.map(content => ({
    user_id: user.id,
    content,
    is_completed: false
  }))

  const { data: inserted, error } = await supabase
    .from('todos')
    .insert(records)
    .select()

  if (error) {
    console.error('Failed to insert AI todos:', error)
    return { success: false, error: 'Failed to add AI tasks' }
  }

  revalidatePath('/dashboard')
  return { success: true, tasks: inserted || [] }
}

/**
 * Updates a topic's explicit mastery level (weak, normal, mastered).
 */
export async function updateTopicMasteryLevel(
  topicId: string,
  level: 'weak' | 'normal' | 'mastered'
) {
  console.log('[MASTERY] updateTopicMasteryLevel called:', { topicId, level })

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.log('[MASTERY] ERROR: Not authenticated')
    return { success: false, error: 'Not authenticated' }
  }
  console.log('[MASTERY] User authenticated:', user.id)

  const score = level === 'weak' ? 2 : level === 'normal' ? 5 : 8

  const basePayload = {
    topic_id: topicId,
    user_id: user.id,
    confidence_score: score,
  }

  console.log('[MASTERY] Attempting upsert with mastery_level column...')

  // 1. Try upserting with mastery_level column
  let { error } = await supabase
    .from('topic_progress')
    .upsert(
      {
        ...basePayload,
        mastery_level: level,
      },
      { onConflict: 'user_id,topic_id' }
    )

  if (error) {
    console.log('[MASTERY] First upsert failed (mastery_level col may not exist):', error.message)

    // 2. Fallback: upsert without mastery_level column
    console.log('[MASTERY] Attempting fallback upsert without mastery_level...')
    const fallbackRes = await supabase
      .from('topic_progress')
      .upsert(basePayload, { onConflict: 'user_id,topic_id' })
    error = fallbackRes.error
    if (error) {
      console.log('[MASTERY] Fallback upsert ALSO failed:', error.message)
    } else {
      console.log('[MASTERY] Fallback upsert SUCCEEDED')
    }
  } else {
    console.log('[MASTERY] First upsert SUCCEEDED (with mastery_level)')
  }

  if (error) {
    console.error('[MASTERY] FINAL ERROR - Failed to update topic mastery level:', error)
    return { success: false, error: 'Failed to update topic mastery' }
  }

  // Verify the write by reading back
  const { data: verify } = await supabase
    .from('topic_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('topic_id', topicId)
    .single()
  console.log('[MASTERY] Verification read-back:', verify)

  revalidatePath('/dashboard')
  revalidatePath('/mastery')
  revalidatePath('/subjects')
  revalidatePath('/subjects/[id]', 'page')
  console.log('[MASTERY] SUCCESS - returning { success: true }')
  return { success: true }
}

/**
 * Updates a subject's overall mastery classification.
 */
export async function updateSubjectMasteryLevel(
  subjectId: string,
  level: 'weak' | 'normal' | 'mastered'
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  await supabase
    .from('subjects')
    .update({ mastery_status: level })
    .eq('id', subjectId)
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
  revalidatePath('/mastery')
  revalidatePath('/subjects')
  revalidatePath(`/subjects/${subjectId}`)
  return { success: true }
}

/**
 * Fetches all subjects and topics with diagnostic mastery levels for the dedicated Mastery Hub.
 */
export async function getFullMasteryHubData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.log('[MASTERY-READ] No user found')
    return { success: false, data: null }
  }
  console.log('[MASTERY-READ] User:', user.id)

  const { data: subjects, error: subErr } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', user.id)
    .order('name')
  console.log('[MASTERY-READ] Subjects:', subjects?.length ?? 0, 'error:', subErr?.message ?? 'none')

  // Get the user's subject IDs so we only fetch their topics
  const subjectIds = (subjects || []).map((s: any) => s.id)

  let allTopics: any[] = []
  if (subjectIds.length > 0) {
    const { data: topics, error: topErr } = await supabase
      .from('topics')
      .select('id, name, subject_id, unit_id, difficulty, priority, time_spent_mins')
      .in('subject_id', subjectIds)
    console.log('[MASTERY-READ] Topics:', topics?.length ?? 0, 'error:', topErr?.message ?? 'none')
    allTopics = topics || []
  } else {
    console.log('[MASTERY-READ] No subjects found, skipping topics query')
  }

  const { data: progressList, error: progErr } = await supabase
    .from('topic_progress')
    .select('*')
    .eq('user_id', user.id)
  console.log('[MASTERY-READ] Progress entries:', progressList?.length ?? 0, 'error:', progErr?.message ?? 'none')

  // Log a sample progress entry if available
  if (progressList && progressList.length > 0) {
    console.log('[MASTERY-READ] Sample progress entry:', JSON.stringify(progressList[0]))
  }

  const progressMap = new Map(progressList?.map((p: any) => [p.topic_id, p]) || [])

  const enrichedTopics = allTopics.map((t: any) => {
    const prog = progressMap.get(t.id)
    const score = prog?.confidence_score ?? 0
    let masteryLevel: 'weak' | 'normal' | 'mastered' = 'normal'

    // Check explicit mastery_level column first
    if (prog?.mastery_level === 'weak' || prog?.mastery_level === 'mastered') {
      masteryLevel = prog.mastery_level
    }
    // Fallback to confidence_score based classification
    else if (score > 0 && score <= 3) {
      masteryLevel = 'weak'
    } else if (score >= 8 || prog?.status === 'completed') {
      masteryLevel = 'mastered'
    }

    return {
      ...t,
      confidence_score: score,
      status: prog?.status || 'pending',
      mastery_level: masteryLevel,
    }
  })

  const weakCount = enrichedTopics.filter((t: any) => t.mastery_level === 'weak').length
  const masteredCount = enrichedTopics.filter((t: any) => t.mastery_level === 'mastered').length
  console.log('[MASTERY-READ] Enriched topics:', enrichedTopics.length, '| weak:', weakCount, '| mastered:', masteredCount)

  return {
    success: true,
    data: {
      subjects: subjects || [],
      topics: enrichedTopics,
    },
  }
}
