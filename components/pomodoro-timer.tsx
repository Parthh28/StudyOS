'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Play, Pause, Square, X, BrainCircuit, Coffee, Save, Loader2 } from 'lucide-react'
import { logStudySession } from '@/lib/actions/data'

type Subject = { id: string; name: string }

export function PomodoroTimer({ subjects }: { subjects: Subject[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const [focusDurationMins, setFocusDurationMins] = useState(25)
  const [breakDurationMins, setBreakDurationMins] = useState(5)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]?.id || '')
  
  const [isLogging, setIsLogging] = useState(false)
  const [message, setMessage] = useState('')

  const initialTime = mode === 'focus' ? focusDurationMins * 60 : breakDurationMins * 60

  // Auto-open timer from URL parameters (e.g. from Resume Learning button)
  useEffect(() => {
    const timerOpen = searchParams.get('timer')
    const subjectIdParam = searchParams.get('subjectId')

    if (timerOpen === 'open') {
      setIsOpen(true)
      if (subjectIdParam) {
        setSelectedSubject(subjectIdParam)
      }
      
      // Clear the params from the URL smoothly without reloading
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('timer')
      newParams.delete('subjectId')
      const newUrl = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname
      router.replace(newUrl, { scroll: false })
    }
  }, [searchParams, pathname, router])

  // Sync timeLeft when duration changes (only if timer is stopped)
  useEffect(() => {
    if (!isActive) {
      if (mode === 'focus') setTimeLeft(focusDurationMins * 60)
      else setTimeLeft(breakDurationMins * 60)
    }
  }, [focusDurationMins, breakDurationMins, isActive, mode])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)
      // Play a sound or notification here ideally
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft])

  const toggleTimer = () => setIsActive(!isActive)
  
  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(initialTime)
  }

  const switchMode = (newMode: 'focus' | 'break') => {
    setMode(newMode)
    setIsActive(false)
    setTimeLeft(newMode === 'focus' ? focusDurationMins * 60 : breakDurationMins * 60)
  }

  const handleLogSession = async () => {
    setIsLogging(true)
    setMessage('')
    
    // Calculate how many minutes were spent
    const minutesSpent = Math.max(1, Math.floor((initialTime - timeLeft) / 60))
    
    const { success } = await logStudySession({
      subject_id: selectedSubject || undefined,
      duration_mins: minutesSpent,
      session_type: 'pomodoro',
      notes: `Pomodoro ${mode} session`
    })

    if (success) {
      setMessage('Session logged successfully!')
      router.refresh() // Force client UI to update instantly
      setTimeout(() => {
        setIsOpen(false)
        resetTimer()
        setMessage('')
      }, 1500)
    } else {
      setMessage('Failed to log session.')
    }
    setIsLogging(false)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const progress = ((initialTime - timeLeft) / initialTime) * 100

  return (
    <>
      {/* Sidebar Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-3 rounded-lg gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 glow-primary"
      >
        <Play className="w-4 h-4 fill-current" />
        Start Session
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#060e20]/80 backdrop-blur-md p-4">
          <div className="bg-[#0b1326] border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors p-1"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-8 relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2">Pomodoro Timer</h3>
              <p className="text-text-muted text-sm">Stay focused and log your study hours.</p>
            </div>

            {/* Mode Selector */}
            <div className="flex bg-[#131b2e] rounded-lg p-1 mb-8 relative z-10">
              <button
                onClick={() => switchMode('focus')}
                className={`flex-1 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  mode === 'focus' ? 'bg-indigo text-white shadow-lg' : 'text-text-muted hover:text-white'
                }`}
              >
                <BrainCircuit className="w-4 h-4" /> Focus
              </button>
              <button
                onClick={() => switchMode('break')}
                className={`flex-1 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  mode === 'break' ? 'bg-violet text-white shadow-lg' : 'text-text-muted hover:text-white'
                }`}
              >
                <Coffee className="w-4 h-4" /> Break
              </button>
            </div>

            {/* Timer Display */}
            <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center group z-10">
              {/* Glowing Background */}
              <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 transition-all ${mode === 'focus' ? 'bg-indigo' : 'bg-violet'}`}></div>
              
              <svg className="w-full h-full absolute transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                <circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke={mode === 'focus' ? '#6366F1' : '#8B5CF6'} 
                  strokeWidth="4"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * progress) / 100}
                  className="transition-all duration-1000 ease-linear"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-5xl font-bold text-white tracking-widest font-mono">
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-8 relative z-10">
              <button 
                onClick={resetTimer}
                className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-text-muted hover:text-white hover:bg-surface-2/80 transition-all"
              >
                <Square className="w-4 h-4" />
              </button>
              <button 
                onClick={toggleTimer}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-lg ${
                  mode === 'focus' ? 'bg-indigo hover:bg-indigo/90' : 'bg-violet hover:bg-violet/90'
                }`}
              >
                {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </button>
              <button 
                onClick={handleLogSession}
                disabled={isLogging || timeLeft === initialTime}
                className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-text-muted hover:text-white hover:bg-surface-2/80 transition-all disabled:opacity-50"
                title="Log Session"
              >
                {isLogging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </button>
            </div>

            {/* Settings & Subject Selector */}
            <div className="relative z-10 border-t border-white/5 pt-6 space-y-4">
              
              {/* Duration Slider */}
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2 flex justify-between">
                  <span>{mode === 'focus' ? 'Focus Duration' : 'Break Duration'}</span>
                  <span className="text-white">
                    {mode === 'focus' 
                      ? (focusDurationMins >= 60 ? `${Math.floor(focusDurationMins/60)}h ${focusDurationMins%60}m` : `${focusDurationMins}m`)
                      : `${breakDurationMins}m`}
                  </span>
                </label>
                {mode === 'focus' ? (
                  <input 
                    type="range" 
                    min="25" 
                    max="300" 
                    step="5"
                    value={focusDurationMins}
                    onChange={(e) => setFocusDurationMins(Number(e.target.value))}
                    disabled={isActive}
                    className="w-full accent-indigo cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                ) : (
                  <input 
                    type="range" 
                    min="5" 
                    max="30" 
                    step="5"
                    value={breakDurationMins}
                    onChange={(e) => setBreakDurationMins(Number(e.target.value))}
                    disabled={isActive}
                    className="w-full accent-violet cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                )}
              </div>

              {/* Subject Selector */}
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2 block">
                  Link to Subject
                </label>
                <select 
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-[#131b2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo/50 transition-all"
                >
                  <option value="">General Study</option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
              
              {message && (
                <div className={`text-center text-sm font-semibold ${message.includes('success') ? 'text-success' : 'text-danger'}`}>
                  {message}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  )
}
