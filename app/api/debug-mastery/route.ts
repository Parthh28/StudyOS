import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated', user: null })
  }

  // 1. Check if mastery_level column exists on topic_progress
  const { data: allProgress, error: progressError } = await supabase
    .from('topic_progress')
    .select('*')
    .eq('user_id', user.id)
    .limit(20)

  // 2. Check subjects
  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .select('id, name, code, color')
    .limit(10)

  // 3. Check topics count
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('id, name, subject_id')
    .limit(10)

  // 4. Find weak ones specifically
  const weakEntries = (allProgress || []).filter(
    (p: any) => p.confidence_score <= 3 || p.mastery_level === 'weak'
  )

  return NextResponse.json({
    user_id: user.id,
    progress_count: allProgress?.length ?? 0,
    progress_error: progressError?.message ?? null,
    progress_sample: allProgress?.slice(0, 5),
    weak_entries: weakEntries,
    subjects_count: subjects?.length ?? 0,
    subjects_error: subjectsError?.message ?? null,
    subjects_sample: subjects?.slice(0, 3),
    topics_count: topics?.length ?? 0,
    topics_error: topicsError?.message ?? null,
    topics_sample: topics?.slice(0, 3),
  })
}
