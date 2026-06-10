'use server'

import { createClient } from '@/lib/supabase/server'
import { SYLLABUS_DATA } from '@/lib/syllabus-data'

export async function seedUserSubjects(userId: string, selectedSubjectIds: string[]) {
  const supabase = await createClient()

  // 1. Filter out only the subjects the user selected in onboarding
  const subjectsToSeed = SYLLABUS_DATA.filter((s) => selectedSubjectIds.includes(s.id))

  if (subjectsToSeed.length === 0) {
    return { success: false, error: 'No subjects selected' }
  }

  // 2. Insert Subjects
  const subjectInserts = subjectsToSeed.map((s, idx) => ({
    user_id: userId,
    name: s.name,
    code: s.code,
    color: s.color,
    icon: s.icon,
    subject_type: s.type,
    order_index: idx,
  }))

  const { data: insertedSubjects, error: subjectsError } = await supabase
    .from('subjects')
    .insert(subjectInserts)
    .select('id, code')

  if (subjectsError || !insertedSubjects) {
    console.error('Failed to insert subjects:', subjectsError)
    return { success: false, error: 'Failed to insert subjects' }
  }

  // 3. Prepare and Insert Units
  const unitInserts: { subject_id: string; name: string; order_index: number }[] = []
  
  // Create a mapping from subject code to its new UUID in the database
  const subjectCodeToId = insertedSubjects.reduce((acc, sub) => {
    acc[sub.code] = sub.id
    return acc
  }, {} as Record<string, string>)

  subjectsToSeed.forEach((subject) => {
    const dbSubjectId = subjectCodeToId[subject.code]
    subject.units.forEach((unit, idx) => {
      unitInserts.push({
        subject_id: dbSubjectId,
        name: unit.name,
        order_index: idx,
      })
    })
  })

  const { data: insertedUnits, error: unitsError } = await supabase
    .from('units')
    .insert(unitInserts)
    .select('id, name, subject_id')

  if (unitsError || !insertedUnits) {
    console.error('Failed to insert units:', unitsError)
    return { success: false, error: 'Failed to insert units' }
  }

  // 4. Prepare and Insert Topics
  const topicInserts: { unit_id: string; subject_id: string; name: string }[] = []

  // To map correctly, we need the combination of subject_id + unit_name -> unit_id
  const getUnitId = (subjectId: string, unitName: string) => {
    return insertedUnits.find((u) => u.subject_id === subjectId && u.name === unitName)?.id
  }

  subjectsToSeed.forEach((subject) => {
    const dbSubjectId = subjectCodeToId[subject.code]
    
    subject.units.forEach((unit) => {
      const dbUnitId = getUnitId(dbSubjectId, unit.name)
      if (!dbUnitId) return // Fallback

      unit.topics.forEach((topic) => {
        topicInserts.push({
          subject_id: dbSubjectId,
          unit_id: dbUnitId,
          name: topic.name,
        })
      })
    })
  })

  // We batch insert topics in chunks to avoid hitting Supabase limits if the list is huge
  const CHUNK_SIZE = 100
  for (let i = 0; i < topicInserts.length; i += CHUNK_SIZE) {
    const chunk = topicInserts.slice(i, i + CHUNK_SIZE)
    const { error: topicsError } = await supabase.from('topics').insert(chunk)
    if (topicsError) {
      console.error('Failed to insert topics chunk:', topicsError)
      return { success: false, error: 'Failed to insert some topics' }
    }
  }

  return { success: true }
}
