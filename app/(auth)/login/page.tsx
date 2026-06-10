'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  BookOpen,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Brain,
  GraduationCap,
  RefreshCw,
} from 'lucide-react'

type Mode = 'login' | 'signup'
type Step = 'auth' | 'otp'

const OTP_LENGTH = 6

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<Mode>('login')
  const [step, setStep] = useState<Step>('auth')

  // Auth fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // OTP fields
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // UI state
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // ── Resend countdown ──────────────────────────────────────────────
  const startCooldown = useCallback(() => {
    setResendCooldown(60)
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
  }, [])

  // ── OTP input handling ────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = cleaned
    setOtp(next)
    if (cleaned && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const next = [...otp]
    pasted.split('').forEach((char, i) => { next[i] = char })
    setOtp(next)
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
  }

  const otpValue = otp.join('')

  // ── Sign In ───────────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('Welcome back! 👋')
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Sign Up → send OTP ────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // OTP sent via email; user confirms with 6-digit code
          emailRedirectTo: undefined,
        },
      })
      if (error) throw error
      toast.success('OTP sent!', { description: `Check ${email} for your 6-digit code.` })
      setStep('otp')
      startCooldown()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up failed'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpValue.length < OTP_LENGTH) return
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpValue,
        type: 'signup',
      })
      if (error) throw error
      toast.success('Email verified! Setting up your account…')
      router.push('/onboarding')
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid OTP — please try again'
      setError(msg)
      toast.error(msg)
      setOtp(Array(OTP_LENGTH).fill(''))
      otpRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  // ── Resend OTP ────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      toast.success('New OTP sent!')
      startCooldown()
      setOtp(Array(OTP_LENGTH).fill(''))
      otpRefs.current[0]?.focus()
    } catch (err: unknown) {
      toast.error('Failed to resend — try again shortly')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    setError(null)
    setStep('auth')
    setOtp(Array(OTP_LENGTH).fill(''))
  }

  const features = [
    { icon: Brain, label: 'Spaced repetition engine' },
    { icon: Sparkles, label: 'Smart revision scheduling' },
    { icon: GraduationCap, label: 'Analytics & GPA estimator' },
  ]

  // ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 glow-primary animate-float">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-1">StudyOS</h1>
        <p className="text-text-muted text-sm">Your academic productivity system</p>
      </div>

      <div className="glass rounded-2xl p-8 shadow-2xl">

        {/* ── OTP STEP ─────────────────────────────────────────── */}
        {step === 'otp' ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
                style={{ background: 'rgba(99,102,241,0.15)' }}>
                <ShieldCheck className="w-7 h-7 text-indigo" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Check your email</h2>
              <p className="text-sm text-text-muted mt-1">
                We sent a 6-digit code to
              </p>
              <p className="text-sm font-medium text-foreground">{email}</p>
            </div>

            <form id="otp-form" onSubmit={handleVerifyOtp} className="space-y-6">
              {/* 6-digit OTP boxes */}
              <div>
                <Label className="text-foreground text-sm font-medium block mb-3 text-center">
                  Enter your verification code
                </Label>
                <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-digit-${i}`}
                      ref={(el) => { otpRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-13 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200 bg-surface text-foreground"
                      style={{
                        height: '52px',
                        borderColor: digit
                          ? '#6366F1'
                          : error
                          ? '#EF4444'
                          : '#334155',
                        boxShadow: digit ? '0 0 12px rgba(99,102,241,0.3)' : undefined,
                      }}
                      aria-label={`OTP digit ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div id="otp-error"
                  className="rounded-lg px-4 py-3 text-sm text-danger text-center"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}

              {/* Verify button */}
              <Button
                id="btn-verify-otp"
                type="submit"
                disabled={loading || otpValue.length < OTP_LENGTH}
                className="w-full h-11 gradient-primary hover:opacity-90 text-white font-semibold rounded-xl glow-primary"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {loading ? 'Verifying…' : 'Verify & Create Account'}
              </Button>

              {/* Resend + back */}
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  id="btn-back-to-auth"
                  onClick={() => { setStep('auth'); setError(null) }}
                  className="flex items-center gap-1 text-text-muted hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Change email
                </button>

                <button
                  type="button"
                  id="btn-resend-otp"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  style={{ color: resendCooldown > 0 ? '#94A3B8' : '#6366F1' }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
            </form>
          </>
        ) : (

        /* ── AUTH STEP ─────────────────────────────────────────── */
        <>
          {/* Removed mode toggle, app is now invite-only */}

          <form
            id="auth-form"
            className="space-y-5"
          >
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="pl-10 bg-surface border-surface-2 text-foreground placeholder:text-text-muted focus:border-indigo h-11"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === 'signup' ? 8 : undefined}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="pl-10 pr-10 bg-surface border-surface-2 text-foreground placeholder:text-text-muted focus:border-indigo h-11"
                />
                <button
                  type="button"
                  id="btn-toggle-password"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign up note */}
            {mode === 'signup' && (
              <div className="flex items-start gap-2 text-xs text-text-muted rounded-lg p-3"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <ShieldCheck className="w-3.5 h-3.5 text-indigo flex-shrink-0 mt-0.5" />
                A 6-digit verification code will be sent to your email to confirm your account.
              </div>
            )}

            {/* Error */}
            {error && (
              <div id="auth-error"
                className="rounded-lg px-4 py-3 text-sm text-danger"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              id="btn-auth-submit"
              type="button"
              onClick={mode === 'login' ? handleSignIn : handleSignUp}
              disabled={loading}
              className="w-full h-11 gradient-primary hover:opacity-90 text-white font-semibold rounded-xl glow-primary transition-all duration-200"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading
                ? mode === 'login' ? 'Signing in…' : 'Sending OTP…'
                : mode === 'login' ? 'Sign In' : 'Send Verification Code →'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-2" />
            </div>
            <div className="relative flex justify-center text-xs text-text-muted">
              <span className="px-3" style={{ background: 'rgba(30,41,59,0.6)' }}>
                What you&apos;ll get
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-sm text-text-muted">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <Icon className="w-3.5 h-3.5 text-indigo" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </>
        )}
      </div>

      <p className="text-center text-xs text-text-muted mt-6">
        Built for SASTRA EEE Semester III · 2026
      </p>
    </div>
  )
}
