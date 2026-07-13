'use client'

import { useState, useEffect } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  BrainCircuit,
  CheckCircle2,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  BookOpen,
} from 'lucide-react'
import { logStudySession } from '@/lib/actions/data'

type SubjectItem = {
  id: string
  name: string
  color?: string
  code?: string
}

type TopicItem = {
  id: string
  name: string
  subject_id: string
}

type ModeType = 'classic' | 'deep' | 'flow' | 'break' | 'custom'

const PRESETS: Record<ModeType, { label: string; focusMins: number; breakMins: number; desc: string }> = {
  classic: { label: 'Classic (25/5)', focusMins: 25, breakMins: 5, desc: 'Balanced focus sprints for steady study sessions.' },
  deep: { label: 'Deep Work (50/10)', focusMins: 50, breakMins: 10, desc: 'Extended concentration for complex problem solving.' },
  flow: { label: 'Flow State (90/15)', focusMins: 90, breakMins: 15, desc: 'Deep immersion for marathon practice or exams.' },
  break: { label: 'Rest Break', focusMins: 5, breakMins: 5, desc: 'Step away to recharge your mental energy.' },
  custom: { label: 'Custom Timer', focusMins: 30, breakMins: 5, desc: 'Set your own custom sprint duration.' },
}

function playChime() {
  if (typeof window === 'undefined') return
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const notes = [523.25, 659.25, 783.99]

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = 'sine'
      const startTime = ctx.currentTime + i * 0.18
      oscillator.frequency.setValueAtTime(freq, startTime)

      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.7)
    })

    setTimeout(() => ctx.close(), 1500)
  } catch (e) {
    console.warn('Chime playback failed:', e)
  }
}

export function PomodoroStudio({
  subjects,
  topics,
}: {
  subjects: SubjectItem[]
  topics: TopicItem[]
}) {
  const [selectedPreset, setSelectedPreset] = useState<ModeType>('classic')
  const [isBreakMode, setIsBreakMode] = useState(false)
  const [customMins, setCustomMins] = useState(30)
  const [durationMins, setDurationMins] = useState(PRESETS.classic.focusMins)
  const [timeLeft, setTimeLeft] = useState(PRESETS.classic.focusMins * 60)
  const [isActive, setIsActive] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Subject and Topic tracking
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '')
  const [selectedTopicId, setSelectedTopicId] = useState<string>('')

  // Stats
  const [completedSessionsToday, setCompletedSessionsToday] = useState(0)
  const [totalFocusMinsToday, setTotalFocusMinsToday] = useState(0)
  const [isLogging, setIsLogging] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const availableTopics = topics.filter((t) => t.subject_id === selectedSubjectId)

  // Switch preset mode
  const handlePresetChange = (key: ModeType) => {
    setIsActive(false)
    setSelectedPreset(key)
    const preset = PRESETS[key]
    const nextMins = key === 'custom' ? customMins : (key === 'break' ? preset.breakMins : preset.focusMins)
    setIsBreakMode(key === 'break')
    setDurationMins(nextMins)
    setTimeLeft(nextMins * 60)
  }

  const handleCustomMinsChange = (mins: number) => {
    const validMins = Math.max(1, Math.min(360, mins))
    setCustomMins(validMins)
    setDurationMins(validMins)
    setTimeLeft(validMins * 60)
    setIsActive(false)
  }

  // Handle countdown tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      setIsActive(false)
      if (soundEnabled) playChime()

      if (!isBreakMode) {
        // Complete focus session
        handleSessionCompletion()
      } else {
        setStatusMessage('Break completed! Ready for your next sprint?')
        setIsBreakMode(false)
        setDurationMins(PRESETS[selectedPreset].focusMins)
        setTimeLeft(PRESETS[selectedPreset].focusMins * 60)
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, isBreakMode, selectedPreset, soundEnabled])

  const handleSessionCompletion = async () => {
    setCompletedSessionsToday((prev) => prev + 1)
    setTotalFocusMinsToday((prev) => prev + durationMins)

    if (!selectedSubjectId) {
      setStatusMessage('Pomodoro sprint finished! Select a subject next time to auto-save to history.')
      return
    }

    setIsLogging(true)
    setStatusMessage('Saving Pomodoro session to study history...')

    const res = await logStudySession({
      subject_id: selectedSubjectId,
      topic_id: selectedTopicId || undefined,
      duration_mins: durationMins,
      session_type: 'pomodoro',
      notes: `Completed ${durationMins}m Pomodoro sprint`,
    })

    setIsLogging(false)
    if (res.success) {
      setStatusMessage(`🎉 Saved! ${durationMins} focus minutes logged successfully.`)
    } else {
      setStatusMessage('Sprint finished! (Could not save to database)')
    }
  }

  const toggleTimer = () => {
    setStatusMessage('')
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setStatusMessage('')
    setTimeLeft(durationMins * 60)
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const progressPercentage = Math.min(100, Math.max(0, ((durationMins * 60 - timeLeft) / (durationMins * 60)) * 100))
  const strokeDashoffset = 754 - (754 * progressPercentage) / 100

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId)
  const ringColor = isBreakMode ? '#34D399' : activeSubject?.color || '#00E5FF'

  return (
    <div className="space-y-8">
      {/* Pacing Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PRESETS) as ModeType[]).map((key) => {
            const preset = PRESETS[key]
            const isSelected = selectedPreset === key
            return (
              <button
                key={key}
                onClick={() => handlePresetChange(key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-surface-2 text-text-muted hover:text-foreground hover:bg-surface'
                }`}
              >
                {preset.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          {selectedPreset === 'custom' && (
            <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-xl px-3 py-1.5 animate-in fade-in duration-200">
              <span className="text-xs font-semibold text-text-muted">Study Duration:</span>
              <input
                type="number"
                min={1}
                max={360}
                value={customMins}
                onChange={(e) => handleCustomMinsChange(parseInt(e.target.value) || 1)}
                className="w-16 bg-card border border-border rounded-lg px-2 py-1 text-center font-mono font-bold text-xs text-foreground focus:outline-none focus:border-primary"
              />
              <span className="text-xs text-text-muted">mins</span>
              <div className="flex gap-1 ml-1">
                <button
                  onClick={() => handleCustomMinsChange(customMins - 5)}
                  className="px-2 py-1 rounded bg-card hover:bg-surface text-xs font-semibold text-text-muted hover:text-foreground border border-border"
                >
                  -5m
                </button>
                <button
                  onClick={() => handleCustomMinsChange(customMins + 5)}
                  className="px-2 py-1 rounded bg-card hover:bg-surface text-xs font-semibold text-text-muted hover:text-foreground border border-border"
                >
                  +5m
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-surface-2 text-text-muted hover:text-foreground border border-border transition-colors"
            title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Focus Arena Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Timer Stage */}
        <div className="lg:col-span-8 bg-card border border-border rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center relative shadow-lg">
          {/* Active Mode Banner */}
          <div className="flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-surface-2 border border-border text-xs font-semibold">
            {isBreakMode ? (
              <>
                <Coffee className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Recharge Break</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-3.5 h-3.5 text-primary" />
                <span className="text-foreground">Deep Work Sprint</span>
              </>
            )}
          </div>

          {/* SVG Countdown Ring */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="120"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-surface-2"
              />
              <circle
                cx="50%"
                cy="50%"
                r="120"
                stroke={ringColor}
                strokeWidth="10"
                strokeDasharray="754"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Time Digital Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tighter text-foreground">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs font-semibold tracking-widest uppercase text-text-muted mt-2">
                {isActive ? 'Sprint Active' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-8">
            <button
              onClick={toggleTimer}
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-sm text-primary-foreground shadow-lg transition-all transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: ringColor }}
            >
              {isActive ? (
                <>
                  <Pause className="w-5 h-5 fill-current" /> Pause Sprint
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" /> {timeLeft < durationMins * 60 ? 'Resume' : 'Start Sprint'}
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              className="p-4 rounded-2xl bg-surface-2 text-text-muted hover:text-foreground border border-border transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Status Alert */}
          {statusMessage && (
            <div className="mt-6 px-4 py-2.5 rounded-xl bg-surface-2 border border-border text-xs font-medium text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Right Configuration & Today's Stats Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Subject & Topic Tagging */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Session Target
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Tag your sprint to automatically update study progress.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value)
                    setSelectedTopicId('')
                  }}
                  className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code ? `[${sub.code}] ` : ''}{sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {availableTopics.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">Specific Topic (Optional)</label>
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Whole Subject</option>
                    {availableTopics.map((top) => (
                      <option key={top.id} value={top.id}>
                        {top.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Today's Focus Stats */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" /> Today&apos;s Sprints
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-2 border border-border/80 rounded-xl p-3.5">
                <span className="text-xs font-semibold text-text-muted block">Completed</span>
                <span className="text-2xl font-extrabold font-mono text-foreground mt-1 block">
                  {completedSessionsToday}
                </span>
              </div>

              <div className="bg-surface-2 border border-border/80 rounded-xl p-3.5">
                <span className="text-xs font-semibold text-text-muted block">Focus Time</span>
                <span className="text-2xl font-extrabold font-mono text-primary mt-1 block">
                  {totalFocusMinsToday}m
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
