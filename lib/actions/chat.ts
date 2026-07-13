'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

/**
 * Fetches the most recent chat messages for the current user.
 * Returns up to 50 messages sorted oldest-first for display.
 */
export async function getChatHistory(): Promise<{ success: boolean; messages: ChatMessage[] }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, messages: [] }

  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, role, content, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Failed to fetch chat history:', error)
    return { success: false, messages: [] }
  }

  // Reverse so oldest is first (for chat display order)
  return { success: true, messages: (data as ChatMessage[]).reverse() }
}

/**
 * Clears all chat messages for the current user.
 */
export async function clearChatHistory(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to clear chat history:', error)
    return { success: false, error: 'Failed to clear chat history' }
  }

  revalidatePath('/ai-chat')
  return { success: true }
}
