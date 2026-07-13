import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'

export const runtime = 'nodejs'

/**
 * POST /api/chat
 * Streaming AI chat endpoint powered by Google Gemini.
 * Fetches student context from Supabase and injects it into the system prompt.
 */
export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // 2. Check Pro subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, weekly_goal_hours, subscription_tier')
      .eq('id', user.id)
      .single()

    if (!profile || profile.subscription_tier !== 'pro') {
      return Response.json(
        { error: 'AI Chat is a Pro feature. Upgrade to StudyOS Pro to unlock it.' },
        { status: 403 }
      )
    }

    // 3. Parse request
    const { message, history } = await request.json()
    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    // 4. Check API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json(
        { error: 'Gemini API key not configured. Add GEMINI_API_KEY to .env.local' },
        { status: 500 }
      )
    }

    // 5. Fetch student context in parallel
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
    startOfWeek.setHours(0, 0, 0, 0)

    const [
      { data: subjectStats },
      { data: weakTopics },
      { data: exams },
      { data: recentSessions },
      { data: weekSessions },
    ] = await Promise.all([
      supabase.from('subject_stats').select('*').order('subject_name'),
      supabase
        .from('weak_topics')
        .select('name, confidence_score, subject_name')
        .order('confidence_score', { ascending: true })
        .limit(25),
      supabase
        .from('exams')
        .select('name, exam_date, subject:subjects(name)')
        .eq('status', 'upcoming')
        .order('exam_date', { ascending: true })
        .limit(5),
      supabase
        .from('study_sessions')
        .select('duration_mins, subject:subjects(name), started_at')
        .order('started_at', { ascending: false })
        .limit(5),
      supabase
        .from('study_sessions')
        .select('duration_mins')
        .gte('started_at', startOfWeek.toISOString()),
    ])

    const hoursThisWeek =
      ((weekSessions || []).reduce((a, s) => a + (s.duration_mins || 0), 0) / 60).toFixed(1)

    // 6. Build system prompt with context
    const systemPrompt = buildSystemPrompt({
      name: profile.full_name || 'Student',
      weeklyGoal: profile.weekly_goal_hours || 20,
      hoursThisWeek,
      subjectStats: subjectStats || [],
      weakTopics: weakTopics || [],
      exams: exams || [],
      recentSessions: recentSessions || [],
    })

    // 7. Build conversation contents with history for Gemini
    const geminiContents = (history || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))
    // Append the new user message
    geminiContents.push({ role: 'user', parts: [{ text: message }] })

    // 8. Call Gemini with streaming
    const ai = new GoogleGenAI({ apiKey })

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
            contents: geminiContents,
          })

          let fullResponse = ''

          for await (const chunk of response) {
            const text = chunk.text || ''
            if (text) {
              fullResponse += text
              controller.enqueue(new TextEncoder().encode(text))
            }
          }

          // 9. Save messages to database (fire-and-forget)
          saveChatMessages(supabase, user.id, message, fullResponse).catch(console.error)

          controller.close()
        } catch (err: any) {
          console.error('Gemini streaming error:', err)
          let errMsg = '\n\nNote: Sorry, I encountered an error. Please try again.'
          if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
            errMsg = '\n\nNote: Gemini API rate limit or free-tier quota exceeded. Please wait a moment or check your API key usage at https://aistudio.google.com/.'
          } else if (err?.status === 401 || err?.status === 403 || err?.message?.includes('API_KEY') || err?.message?.includes('PERMISSION_DENIED')) {
            errMsg = '\n\nNote: Invalid or unauthorized Gemini API key. Please check GEMINI_API_KEY in your .env.local file.'
          }
          controller.enqueue(
            new TextEncoder().encode(errMsg)
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (err: any) {
    console.error('Chat API error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── Helpers ─────────────────────────────────────────────────

async function saveChatMessages(
  supabase: any,
  userId: string,
  userMessage: string,
  assistantMessage: string
) {
  await supabase.from('chat_messages').insert([
    { user_id: userId, role: 'user', content: userMessage },
    { user_id: userId, role: 'assistant', content: assistantMessage },
  ])
}

function buildSystemPrompt(ctx: {
  name: string
  weeklyGoal: number
  hoursThisWeek: string
  subjectStats: any[]
  weakTopics: any[]
  exams: any[]
  recentSessions: any[]
}): string {
  let prompt = `You are StudyOS AI — a brilliant, supportive personal academic coach built into the StudyOS study platform. You help engineering students plan their studies, understand difficult concepts, and stay on track with their goals.

You have access to the student's REAL-TIME academic data from their StudyOS dashboard. Use this data to give specific, personalized, actionable advice. Reference their actual subject names, topic names, and numbers.

══════════════════════════════════════
STUDENT PROFILE
══════════════════════════════════════
Name: ${ctx.name}
Weekly Study Goal: ${ctx.weeklyGoal} hours
Hours Studied This Week: ${ctx.hoursThisWeek} hours
`

  // Subjects & Progress
  if (ctx.subjectStats.length > 0) {
    prompt += `
══════════════════════════════════════
SUBJECTS & PROGRESS
══════════════════════════════════════
`
    ctx.subjectStats.forEach((s) => {
      const pct = s.total_topics > 0
        ? Math.round((s.completed_topics / s.total_topics) * 100)
        : 0
      prompt += `• ${s.subject_name}: ${s.completed_topics}/${s.total_topics} topics completed (${pct}%)\n`
    })
  }

  // Weak Topics
  if (ctx.weakTopics.length > 0) {
    prompt += `
══════════════════════════════════════
WEAKEST TOPICS & TOPICS NEEDING STUDY
══════════════════════════════════════
`
    ctx.weakTopics.forEach((t: any) => {
      const subName = t.subject_name || t.subject?.name || 'Unknown'
      const conf = t.confidence_score === 0 ? 'Not Started / 0' : `${t.confidence_score}/10`
      prompt += `• ${t.name} (${subName}) — Confidence: ${conf}\n`
    })
  }

  // Upcoming Exams
  if (ctx.exams.length > 0) {
    prompt += `
══════════════════════════════════════
UPCOMING EXAMS
══════════════════════════════════════
`
    ctx.exams.forEach((e: any) => {
      const daysLeft = Math.max(
        0,
        Math.ceil(
          (new Date(e.exam_date).getTime() - Date.now()) / (1000 * 3600 * 24)
        )
      )
      const subName = e.subject?.name || 'Unknown'
      prompt += `• ${e.name} (${subName}): ${daysLeft} days away\n`
    })
  }

  // Recent Sessions
  if (ctx.recentSessions.length > 0) {
    prompt += `
══════════════════════════════════════
RECENT STUDY SESSIONS
══════════════════════════════════════
`
    ctx.recentSessions.forEach((s: any) => {
      const subName = s.subject?.name || 'General'
      const when = new Date(s.started_at).toLocaleDateString()
      prompt += `• ${subName}: ${s.duration_mins} mins on ${when}\n`
    })
  }

  prompt += `
══════════════════════════════════════
GUIDELINES
══════════════════════════════════════
- Be encouraging, concise, and practical
- When asked about study plans, what to study next, or general advice, ALWAYS explicitly list out the student's weakest topics from their data and incorporate those exact topics into your recommendations.
- Create day-by-day study schedules referencing their actual subjects and specific topic names from their WEAKEST TOPICS list.
- When explaining concepts, use clear analogies and examples
- If they're behind on their weekly goal, gently motivate them
- If an exam is within 7 days, emphasize urgent preparation for that subject's weak topics
- Do NOT use raw '#' symbols for headers or section titles. Instead, format section titles and key terms cleanly using **bold text** (e.g. **Weak Topics to Focus On:**) and bullet points.
- Keep responses focused — don't ramble
- If you don't know something specific about their coursework, say so honestly
`

  return prompt
}
