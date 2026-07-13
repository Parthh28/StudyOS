'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { seedUserSubjects } from '@/lib/actions/seed'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  User,
  Target,
  Check,
  Loader2,
  FlaskConical,
  Microscope,
  Upload,
  FileText,
  Sparkles,
  Camera,
} from 'lucide-react'
import { extractSyllabusFromImage, importExtractedSyllabus } from '@/lib/actions/ai-extractor'

// ─── All 7 subjects from the syllabus ────────────────────────────────────────
const SUBJECT_OPTIONS = [
  {
    id: 'eng-math-3',
    name: 'Engineering Mathematics III',
    code: 'MAT201R01',
    color: '#2563EB',
    icon: 'Calculator',
    type: 'theory',
  },
  {
    id: 'electric-networks',
    name: 'Electric Networks',
    code: 'EEE201R01',
    color: '#0D9488',
    icon: 'Zap',
    type: 'theory',
  },
  {
    id: 'analog-electronic',
    name: 'Analog Electronic Circuits',
    code: 'EIE218R02',
    color: '#0284C7',
    icon: 'Cpu',
    type: 'theory',
  },
  {
    id: 'digital-electronics',
    name: 'Digital Electronics',
    code: 'ECE105R01',
    color: '#059669',
    icon: 'Binary',
    type: 'theory',
  },
  {
    id: 'ee-measurements',
    name: 'Electrical & Electronic Measurements',
    code: 'EIE102',
    color: '#D97706',
    icon: 'Gauge',
    type: 'theory',
  },
  {
    id: 'measurements-lab',
    name: 'Electrical & Electronics Measurements Lab',
    code: 'EIE103',
    color: '#E11D48',
    icon: 'FlaskConical',
    type: 'lab',
  },
  {
    id: 'analog-circuits-lab',
    name: 'Analog Circuits Laboratory',
    code: 'EIE229',
    color: '#475569',
    icon: 'Microscope',
    type: 'lab',
  },
]

const STEPS = [
  { id: 1, label: 'Profile', description: 'Tell us about yourself' },
  { id: 2, label: 'Subjects', description: 'Select your courses' },
  { id: 3, label: 'Goals', description: 'Set your weekly target' },
  { id: 4, label: 'Syllabus', description: 'Upload syllabus photo' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1
  const [fullName, setFullName] = useState('')
  const [institution, setInstitution] = useState('SASTRA Deemed to be University')
  const [targetYear, setTargetYear] = useState('2026')

  // Step 2
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    SUBJECT_OPTIONS.map((s) => s.id) // default: all selected
  )

  // Step 3
  const [weeklyGoal, setWeeklyGoal] = useState(20)

  // Step 4: Syllabus Photo Upload
  const [syllabusFileName, setSyllabusFileName] = useState<string | null>(null)
  const [isExtractingSyllabus, setIsExtractingSyllabus] = useState(false)
  const [syllabusAddedSuccess, setSyllabusAddedSuccess] = useState(false)
  const [extractedSubjectName, setExtractedSubjectName] = useState('')

  const handleUploadSyllabusPhoto = async (preset?: 'cs' | 'math' | 'physics' | 'bio', uploadedName?: string) => {
    setIsExtractingSyllabus(true)
    setSyllabusAddedSuccess(false)
    const fileName = uploadedName || (preset ? `${preset.toUpperCase()}_Syllabus_Photo.png` : 'Course_Syllabus.png')
    setSyllabusFileName(fileName)

    try {
      const res = await extractSyllabusFromImage(fileName, preset || 'cs')
      if (res.success && res.data) {
        const importRes = await importExtractedSyllabus(res.data)
        if (importRes.success) {
          setSyllabusAddedSuccess(true)
          setExtractedSubjectName(res.data.subjectName)
          toast.success('Syllabus photo analyzed and added to your Subjects section!')
        } else {
          toast.error(importRes.error || 'Failed to add syllabus to subjects')
        }
      } else {
        toast.error(res.error || 'Failed to scan syllabus photo')
      }
    } catch (err) {
      toast.error('Error uploading syllabus photo')
    } finally {
      setIsExtractingSyllabus(false)
    }
  }

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // 1. Create profile
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName.trim(),
        institution: institution.trim(),
        target_year: parseInt(targetYear),
        weekly_goal_hours: weeklyGoal,
      })
      if (profileError) throw profileError

      // Note: Subjects are now global, so we no longer seed subjects per-user.
      // In the future, we can save `selectedSubjects` to a user_subjects mapping table.

      toast.success(`Welcome to StudyOS, ${fullName.split(' ')[0]}! 🎓`)
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary mb-3 glow-primary">
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Set up your StudyOS
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Takes about 60 seconds
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all duration-300 ${
                step > s.id
                  ? 'bg-success text-white'
                  : step === s.id
                  ? 'gradient-primary text-white glow-primary'
                  : 'bg-surface-2 text-text-muted'
              }`}
            >
              {step > s.id ? <Check className="w-3.5 h-3.5" /> : s.id}
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-12 h-0.5 rounded transition-all duration-300 ${
                  step > s.id ? 'bg-success' : 'bg-surface-2'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            {STEPS[step - 1].label}
          </h2>
          <p className="text-text-muted text-sm">{STEPS[step - 1].description}</p>
        </div>

        {/* ── Step 1: Profile ─────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name" className="text-foreground text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  id="full-name"
                  placeholder="e.g. Swapnil Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 bg-surface border-surface-2 text-foreground placeholder:text-text-muted focus:border-indigo h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution" className="text-foreground text-sm font-medium">
                Institution
              </Label>
              <Input
                id="institution"
                placeholder="SASTRA Deemed to be University"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="bg-surface border-surface-2 text-foreground placeholder:text-text-muted focus:border-indigo h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-year" className="text-foreground text-sm font-medium">
                Target Exam Year
              </Label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  id="target-year"
                  type="number"
                  min={2025}
                  max={2035}
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="pl-10 bg-surface border-surface-2 text-foreground focus:border-indigo h-11"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Subjects ─────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-xs text-text-muted mb-4">
              {selectedSubjects.length} of {SUBJECT_OPTIONS.length} selected
            </p>
            {SUBJECT_OPTIONS.map((subject) => {
              const isSelected = selectedSubjects.includes(subject.id)
              return (
                <button
                  key={subject.id}
                  id={`subject-${subject.id}`}
                  type="button"
                  onClick={() => toggleSubject(subject.id)}
                  className={`w-full flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-opacity-40 bg-opacity-10'
                      : 'border-surface-2 bg-surface hover:border-surface-2'
                  }`}
                  style={{
                    borderColor: isSelected ? subject.color : undefined,
                    background: isSelected
                      ? `${subject.color}18`
                      : undefined,
                  }}
                >
                  {/* Color dot */}
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: subject.color }}
                  >
                    {subject.type === 'lab' ? (
                      subject.code === 'EIE229' ? (
                        <Microscope className="w-4 h-4" />
                      ) : (
                        <FlaskConical className="w-4 h-4" />
                      )
                    ) : (
                      subject.code.slice(0, 2)
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {subject.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {subject.code} · {subject.type === 'lab' ? 'Lab' : 'Theory'}
                    </p>
                  </div>

                  {/* Checkbox */}
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected ? 'border-transparent' : 'border-surface-2'
                    }`}
                    style={{
                      background: isSelected ? subject.color : undefined,
                    }}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* ── Step 3: Goals ────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-foreground text-sm font-medium">
                  Weekly study goal
                </Label>
                <span className="text-2xl font-bold gradient-text">
                  {weeklyGoal}h
                </span>
              </div>

              {/* Custom range slider */}
              <div className="relative">
                <input
                  id="weekly-goal-slider"
                  type="range"
                  min={5}
                  max={60}
                  step={5}
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #2563EB 0%, #0D9488 ${
                      ((weeklyGoal - 5) / 55) * 100
                    }%, #334155 ${((weeklyGoal - 5) / 55) * 100}%, #334155 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-text-muted mt-2">
                  <span>5h</span>
                  <span>30h</span>
                  <span>60h</span>
                </div>
              </div>

              {/* Preset chips */}
              <div className="flex gap-2 flex-wrap">
                {[10, 15, 20, 25, 30, 40].map((h) => (
                  <button
                    key={h}
                    type="button"
                    id={`goal-preset-${h}`}
                    onClick={() => setWeeklyGoal(h)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      weeklyGoal === h
                        ? 'gradient-primary text-white'
                        : 'bg-surface-2 text-text-muted hover:text-foreground'
                    }`}
                  >
                    {h}h/week
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div
              className="rounded-xl p-4 space-y-2"
              style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}
            >
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                Your Setup Summary
              </p>
              <p className="text-sm text-foreground">
                {fullName || 'Student'} · {institution.split(' ')[0]}
              </p>
              <p className="text-sm text-foreground">
                {selectedSubjects.length} subjects tracked
              </p>
              <p className="text-sm text-foreground">
                {weeklyGoal} hours/week · Target: {targetYear}
              </p>
            </div>
          </div>
        )}

        {/* ── Step 4: Syllabus Photo Upload ───────────────────────── */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-foreground">Upload Your Course Syllabus Photo</h3>
              <p className="text-xs text-text-muted">
                AI Vision scans your photo, structures units & topics, and adds the curriculum directly to your Subjects section.
              </p>
            </div>

            {isExtractingSyllabus ? (
              <div className="bg-card rounded-2xl p-8 text-center space-y-4 border border-border shadow-md">
                <div className="relative flex items-center justify-center w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-primary/50 border-l-transparent animate-spin" />
                  <Loader2 className="w-7 h-7 text-primary animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">Analyzing Syllabus Photo...</h4>
                  <p className="text-xs text-text-muted">Extracting units & topics into your Subjects section</p>
                </div>
              </div>
            ) : syllabusAddedSuccess ? (
              <div className="p-5 rounded-2xl bg-success/10 border border-success/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center text-success shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {extractedSubjectName || 'Course Syllabus'} Added!
                  </p>
                  <p className="text-xs text-text-muted">
                    Structured units & topics are now active in your Subjects section.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Upload Dropzone */}
                <div className="relative border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-6 text-center transition-all bg-background/50 hover:bg-card group">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUploadSyllabusPhoto(undefined, file.name)
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="space-y-3 pointer-events-none">
                    <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center mx-auto text-primary">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Click or Drag Syllabus Photo Here</h4>
                      <p className="text-xs text-text-muted mt-0.5">Supports PNG, JPG screenshot or PDF</p>
                    </div>
                  </div>
                </div>

                {/* Or Instant Sample Syllabus Photo */}
                <div className="pt-2">
                  <p className="text-xs font-semibold text-text-muted mb-2 text-center">Or click a sample syllabus photo to import instant curriculum:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUploadSyllabusPhoto('cs')}
                      className="p-2.5 rounded-xl border border-border hover:border-primary/50 bg-card text-left flex items-center gap-2.5 transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">CS304R02 Syllabus</p>
                        <p className="text-[10px] text-text-muted">Data Structures</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUploadSyllabusPhoto('math')}
                      className="p-2.5 rounded-xl border border-border hover:border-primary/50 bg-card text-left flex items-center gap-2.5 transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo/10 flex items-center justify-center text-indigo">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">MAT202R01 Syllabus</p>
                        <p className="text-[10px] text-text-muted">Multivariable Calc</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button
              id="btn-prev-step"
              type="button"
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 h-11 border-surface-2 text-foreground hover:bg-surface-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}

          {step < 4 ? (
            <Button
              id="btn-next-step"
              type="button"
              disabled={step === 1 && !fullName.trim()}
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 h-11 gradient-primary text-white hover:opacity-90 glow-primary"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              id="btn-finish-onboarding"
              type="button"
              disabled={loading || isExtractingSyllabus}
              onClick={handleFinish}
              className="flex-1 h-11 gradient-primary text-white hover:opacity-90 glow-primary"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {loading ? 'Setting up…' : 'Launch StudyOS'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
