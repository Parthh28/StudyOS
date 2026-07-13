'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Save,
  Loader2,
  User,
  Target,
  Sparkles,
  CheckCircle2,
  Zap,
  RefreshCw,
  Palette,
  LogOut,
  ShieldAlert,
  GraduationCap,
  Bell,
  Sliders,
  Award,
} from 'lucide-react'
import { getSubscriptionStatus, updateSubscriptionTier } from '@/lib/actions/pro'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<'profile' | 'membership' | 'security'>('profile')

  const [fullName, setFullName] = useState('')
  const [institution, setInstitution] = useState('SASTRA Deemed to be University')
  const [weeklyGoal, setWeeklyGoal] = useState('20')
  const [tier, setTier] = useState<'free' | 'pro'>('free')
  const [extractionsCount, setExtractionsCount] = useState(0)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTogglingTier, setIsTogglingTier] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, institution, weekly_goal_hours, subscription_tier, ai_extractions_count')
          .eq('id', user.id)
          .single()

        if (profile) {
          setFullName(profile.full_name || '')
          if (profile.institution) setInstitution(profile.institution)
          setWeeklyGoal(profile.weekly_goal_hours?.toString() || '20')
          setTier((profile.subscription_tier as 'free' | 'pro') || 'free')
          setExtractionsCount(profile.ai_extractions_count || 0)
        }
      }
      setIsLoading(false)
    }
    loadProfile()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          institution: institution.trim(),
          weekly_goal_hours: parseInt(weeklyGoal) || 20,
        })
        .eq('id', user.id)

      if (error) {
        toast.error('Failed to save settings.')
      } else {
        toast.success('Settings saved successfully!')
      }
    }
    setIsSaving(false)
  }

  const handleToggleTier = async (newTier: 'free' | 'pro') => {
    setIsTogglingTier(true)
    const res = await updateSubscriptionTier(newTier)
    if (res.success) {
      setTier(newTier)
      toast.success(`Switched to StudyOS ${newTier.toUpperCase()} Plan!`)
    } else {
      toast.error('Failed to update subscription tier.')
    }
    setIsTogglingTier(false)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    toast.success('Successfully logged out.')
    router.push('/login')
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex items-center justify-center w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-primary/50 border-l-transparent animate-spin" />
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
          <p className="text-xs font-semibold text-text-muted">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-5 md:p-10 max-w-[1000px] w-full mx-auto space-y-8 animate-fade-in">
      {/* Header with User Avatar Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card rounded-3xl p-6 md:p-8 border border-border shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0">
            {fullName ? fullName.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
                {fullName || 'Student'}
              </h1>
              {tier === 'pro' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full gradient-primary text-white text-[11px] font-extrabold tracking-wider uppercase glow-primary">
                  <Sparkles className="w-3 h-3" /> PRO
                </span>
              )}
            </div>
            <p className="text-sm text-text-muted mt-1 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-primary" />
              {institution} · Weekly Target: <strong className="text-foreground">{weeklyGoal}h</strong>
            </p>
          </div>
        </div>

        {/* Tab Selector Bar */}
        <div className="flex items-center p-1.5 rounded-2xl bg-surface border border-border shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'gradient-primary text-white shadow-md'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Profile & Goals
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('membership')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'membership'
                ? 'gradient-primary text-white shadow-md'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Membership
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'security'
                ? 'bg-danger text-white shadow-md'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Account & Logout
          </button>
        </div>
      </div>

      {/* TAB 1: PROFILE & GOALS */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-lg space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-bold text-foreground">Academic Profile & Preferences</h2>
            <p className="text-xs text-text-muted">Update your personal identity, university institution, and weekly targets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" /> Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-primary" /> University / Institution
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                placeholder="SASTRA University"
              />
            </div>
          </div>

          {/* Weekly Goal Selector */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-primary" /> Weekly Study Goal
                </label>
                <p className="text-xs text-text-muted">Determines your target pacing on the dashboard progress ring.</p>
              </div>
              <span className="text-xl font-extrabold text-primary">{weeklyGoal} hours/week</span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {[10, 15, 20, 25, 30, 40].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setWeeklyGoal(h.toString())}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    weeklyGoal === h.toString()
                      ? 'gradient-primary text-white shadow-md'
                      : 'bg-surface border border-border text-text-muted hover:text-foreground'
                  }`}
                >
                  {h} hours/week
                </button>
              ))}
            </div>
          </div>

          {/* Appearance Toggle */}
          <div className="space-y-2 pt-4 border-t border-border">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-primary" /> Interface Appearance
            </label>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-border">
              <div>
                <p className="text-sm font-bold text-foreground">Color Mode</p>
                <p className="text-xs text-text-muted">Toggle between dark mode and light mode aesthetics.</p>
              </div>
              <ThemeToggle />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl gradient-primary text-white font-bold text-sm shadow-md hover:opacity-90 transition-all inline-flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile Preferences
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: MEMBERSHIP & PRO TIER */}
      {activeTab === 'membership' && (
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-6 md:p-8 shadow-2xl space-y-6">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-foreground">StudyOS Plan</h3>
                {tier === 'pro' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-full gradient-primary text-white glow-primary">
                    <Sparkles className="w-3.5 h-3.5" /> PRO MEMBER
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-full bg-surface-2 text-text-muted border border-border">
                    FREE PLAN
                  </span>
                )}
              </div>
              <p className="text-sm text-text-muted">
                {tier === 'pro'
                  ? 'You have unlimited access to AI Syllabus Extraction and advanced study suites.'
                  : `You have used ${extractionsCount}/1 free AI syllabus extractions this month.`}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {tier === 'free' ? (
                <button
                  type="button"
                  onClick={() => handleToggleTier('pro')}
                  disabled={isTogglingTier}
                  className="px-5 py-2.5 rounded-xl gradient-primary text-white font-bold text-sm transition-all shadow-md flex items-center gap-2"
                >
                  {isTogglingTier ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Upgrade to Pro
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleToggleTier('free')}
                  disabled={isTogglingTier}
                  className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-2/80 text-text-muted hover:text-white font-medium text-xs transition-all border border-border flex items-center gap-2"
                >
                  {isTogglingTier ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Switch to Free Plan (Test Mode)
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Sparkles className="w-4 h-4" /> AI Syllabus Extractor
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Upload photos of course syllabi or exam tables to automatically generate structured study roadmaps.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Zap className="w-4 h-4" /> One-Click Curriculum Sync
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Convert AI extracted roadmaps into live StudyOS Subjects, Units, and Topics instantly.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
              <div className="flex items-center gap-2 text-success font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" /> Deep Focus Audio Suite
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Unlock ambient soundscapes, lofi study beats, and binaural frequencies inside your Pomodoro timer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACCOUNT & LOGOUT */}
      {activeTab === 'security' && (
        <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-lg space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-bold text-foreground">Security & Session Management</h2>
            <p className="text-xs text-text-muted">Manage active device sessions and sign out of your account.</p>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <LogOut className="w-4 h-4 text-danger" /> Log Out of StudyOS
              </h4>
              <p className="text-xs text-text-muted">
                Sign out of your active browser session on this device. You can log back in securely via OTP anytime.
              </p>
            </div>

            <Dialog>
              <DialogTrigger render={
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-xl bg-danger/10 hover:bg-danger text-danger hover:text-white border border-danger/30 font-bold text-sm transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              } />

              <DialogContent className="bg-card border-border sm:max-w-sm rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-foreground flex items-center gap-2 text-xl font-bold">
                    <LogOut className="w-5 h-5 text-danger" />
                    Sign Out of StudyOS
                  </DialogTitle>
                  <DialogDescription className="text-text-muted mt-2 text-xs leading-relaxed">
                    Are you sure you want to log out? Any unsaved study progress or active Pomodoro sessions will be stopped.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="border-t border-border mt-6 pt-4 flex gap-3">
                  <DialogClose render={
                    <button
                      type="button"
                      className="px-4 py-2.5 rounded-xl text-sm font-bold text-foreground bg-surface hover:bg-surface-2 transition-all flex-1"
                    >
                      Cancel
                    </button>
                  } />
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-danger hover:opacity-90 transition-all flex-1 inline-flex items-center justify-center gap-2"
                  >
                    {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Yes, Sign Out
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  )
}
