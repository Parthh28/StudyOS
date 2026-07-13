'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSubscriptionStatus(): Promise<{ success: boolean; tier: 'free' | 'pro'; extractionsCount: number }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, tier: 'free', extractionsCount: 0 }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_tier, ai_extractions_count')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    // If column doesn't exist yet or profile missing, default to free
    return { success: true, tier: 'free' as const, extractionsCount: 0 }
  }

  return {
    success: true,
    tier: (profile.subscription_tier as 'free' | 'pro') || 'free',
    extractionsCount: profile.ai_extractions_count || 0,
  }
}

export async function updateSubscriptionTier(tier: 'free' | 'pro') {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({ subscription_tier: tier })
    .eq('id', user.id)

  if (error) {
    console.error('Failed to update subscription tier:', error)
    return { success: false, error: 'Failed to update subscription tier' }
  }

  revalidatePath('/', 'layout')
  revalidatePath('/settings')
  revalidatePath('/ai-coach')
  return { success: true, tier }
}
