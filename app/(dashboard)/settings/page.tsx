'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, User, Target } from 'lucide-react'

export default function SettingsPage() {
  const [fullName, setFullName] = useState('')
  const [weeklyGoal, setWeeklyGoal] = useState('20')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, weekly_goal_hours')
          .eq('id', user.id)
          .single()
          
        if (profile) {
          setFullName(profile.full_name || '')
          setWeeklyGoal(profile.weekly_goal_hours?.toString() || '20')
        }
      }
      setIsLoading(false)
    }
    loadProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName, 
          weekly_goal_hours: parseInt(weeklyGoal) || 20 
        })
        .eq('id', user.id)
        
      if (error) {
        setMessage('Failed to save settings.')
      } else {
        setMessage('Settings saved successfully!')
      }
    }
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-indigo animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-5 md:p-10 max-w-[800px] w-full mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text gradient-text">Settings</h2>
        <p className="text-text-muted mt-2">Manage your account preferences and study goals.</p>
      </div>

      <div className="glass rounded-2xl p-6 md:p-8 border border-white/5 shadow-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-muted uppercase tracking-widest flex items-center gap-2">
              <User className="w-4 h-4" /> Full Name
            </label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#0b1326] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo/50 focus:ring-1 focus:ring-indigo/50 transition-all"
              placeholder="Alex Rivers"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-muted uppercase tracking-widest flex items-center gap-2">
              <Target className="w-4 h-4" /> Weekly Study Goal (Hours)
            </label>
            <input 
              type="number" 
              min="1"
              max="100"
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(e.target.value)}
              className="w-full bg-[#0b1326] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo/50 focus:ring-1 focus:ring-indigo/50 transition-all"
            />
            <p className="text-xs text-text-muted mt-1">This sets the target for your dashboard progress ring.</p>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <span className={`text-sm font-semibold ${message.includes('success') ? 'text-success' : 'text-danger'}`}>
              {message}
            </span>
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-6 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
