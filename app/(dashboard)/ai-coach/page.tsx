'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Sparkles, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Zap, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  BookOpen, 
  Code, 
  LineChart, 
  Atom, 
  Dna,
  Check,
  RefreshCw
} from 'lucide-react'
import { extractSyllabusFromImage, importExtractedSyllabus, ExtractedSyllabus } from '@/lib/actions/ai-extractor'
import { getSubscriptionStatus } from '@/lib/actions/pro'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AICoachPage() {
  const router = useRouter()
  const [tier, setTier] = useState<'free' | 'pro'>('free')
  const [extractionsCount, setExtractionsCount] = useState(0)
  const [isScanning, setIsScanning] = useState(false)
  const [scanStep, setScanStep] = useState(0)
  const [extractedData, setExtractedData] = useState<ExtractedSyllabus | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importSuccessId, setImportSuccessId] = useState<string | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<'cs' | 'math' | 'physics' | 'bio' | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  useEffect(() => {
    async function loadStatus() {
      const res = await getSubscriptionStatus()
      if (res.success) {
        setTier(res.tier)
        setExtractionsCount(res.extractionsCount)
      }
    }
    loadStatus()
  }, [])

  const handleStartExtraction = async (preset?: 'cs' | 'math' | 'physics' | 'bio', uploadedName?: string) => {
    setIsScanning(true)
    setExtractedData(null)
    setImportSuccessId(null)
    setScanStep(1)

    const name = uploadedName || (preset ? `${preset.toUpperCase()}_Syllabus_2026.png` : 'Course_Syllabus.png')
    setFileName(name)
    if (preset) setSelectedPreset(preset)

    // Step 1: OCR & Layout Analysis
    setTimeout(() => setScanStep(2), 700)
    // Step 2: Extracting units and topics
    setTimeout(() => setScanStep(3), 1400)

    const res = await extractSyllabusFromImage(name, preset)

    setIsScanning(false)
    if (res.success && res.data) {
      setExtractedData(res.data)
      toast.success('Successfully extracted syllabus structure!')
    } else {
      toast.error(res.error || 'Failed to extract syllabus.')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleStartExtraction(undefined, file.name)
    }
  }

  const handleToggleTopic = (unitIndex: number, topicIndex: number) => {
    if (!extractedData) return
    const updated = { ...extractedData }
    updated.units = updated.units.map((u, uIdx) => {
      if (uIdx !== unitIndex) return u
      return {
        ...u,
        topics: u.topics.map((t, tIdx) => {
          if (tIdx !== topicIndex) return t
          return { ...t, selected: !t.selected }
        }),
      }
    })
    setExtractedData(updated)
  }

  const handleImport = async () => {
    if (!extractedData) return
    setIsImporting(true)

    const res = await importExtractedSyllabus(extractedData)
    setIsImporting(false)

    if (res.success && res.subjectId) {
      setImportSuccessId(res.subjectId)
      setExtractionsCount((prev) => prev + 1)
      toast.success('🎉 Roadmap imported to StudyOS!')
    } else if (res.requiresPro) {
      toast.error(res.error)
    } else {
      toast.error(res.error || 'Failed to import syllabus.')
    }
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'hard': return 'text-rose-400 bg-rose-500/10 border-rose-500/20'
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      case 'easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      default: return 'text-indigo bg-indigo/10 border-indigo/20'
    }
  }

  return (
    <div className="flex-1 p-5 md:p-10 max-w-[1100px] w-full mx-auto space-y-10">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-8 md:p-12 shadow-2xl">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold tracking-wider uppercase glow-primary animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> AI SYLLABUS EXTRACTOR & ROADMAP BUILDER
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight">
            Turn Raw Syllabi into <span className="text-primary font-extrabold">Deep Focus Roadmaps</span>
          </h1>
          <p className="text-text-muted text-sm md:text-base leading-relaxed">
            Upload a photo or screenshot of your course syllabus, textbook index, or exam schedule. Our multimodal AI extracts chapters and topics, calculates study hours, and builds your structured StudyOS plan instantly.
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-text-muted">
            <span className="flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Auto Pomodoro Goals
            </span>
            <span className="flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unit & Topic Hierarchy
            </span>
            <span className="flex items-center gap-1.5 text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> One-Click Database Sync
            </span>
          </div>
        </div>
      </div>

      {/* Pro Membership Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 rounded-2xl bg-surface-2/40 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Current Plan: <span className="text-amber-400 uppercase">{tier === 'pro' ? 'StudyOS Pro' : 'Free Tier'}</span>
            </h3>
            <p className="text-xs text-text-muted">
              {tier === 'pro' 
                ? 'You have unlimited syllabus extractions and instant database imports.' 
                : `Free usage: ${extractionsCount}/1 extractions used this month. Upgrade to Pro for unlimited imports.`}
            </p>
          </div>
        </div>
        <Link href="/settings">
          <button className="px-4 py-2 rounded-xl bg-background hover:bg-surface-2 text-foreground text-xs font-semibold border border-border transition-all flex items-center gap-2">
            Manage Membership <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>

      {/* Scanning Animation State */}
      {isScanning && (
        <div className="bg-card rounded-3xl p-12 text-center space-y-6 border border-border shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse" />
          <div className="relative z-10 flex flex-col items-center justify-center space-y-5">
            {/* Concentric Spinner Loading Effect */}
            <div className="relative flex items-center justify-center w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
              <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-primary/50 border-l-transparent animate-spin" />
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shadow-lg">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-foreground">Uploading & Analyzing Syllabus...</h3>
              <p className="text-sm text-text-muted max-w-md">
                {scanStep === 1 && 'Uploading file & running layout recognition...'}
                {scanStep === 2 && 'Structuring hierarchical Units, Modules, and Topics...'}
                {scanStep === 3 && 'Finalizing curriculum and estimating study pacing...'}
              </p>
            </div>
            <div className="w-64 h-2 bg-surface-2 rounded-full overflow-hidden mt-4 border border-border">
              <div 
                className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500 rounded-full"
                style={{ width: scanStep === 1 ? '33%' : scanStep === 2 ? '66%' : '95%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload Dropzone & Preset Selectors */}
      {!isScanning && !extractedData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Select a Sample Syllabus or Upload Your Own</h2>
            <span className="text-xs text-text-muted">Supported formats: PNG, JPG, PDF (Screenshot)</span>
          </div>

          {/* Sample Presets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'cs', title: 'Data Structures & Algo', code: 'CS304R02', icon: Code, color: '#2563EB', desc: 'Trees, Graphs, DP & NP-Completeness' },
              { id: 'math', title: 'Multivariable Calculus', code: 'MAT202R01', icon: LineChart, color: '#0284C7', desc: 'Partial Derivatives, Multiple Integrals & Vector Fields' },
              { id: 'physics', title: 'Quantum Mechanics', code: 'PHY301R01', icon: Atom, color: '#0D9488', desc: 'Schrödinger Eq, Relativity & Operators' },
              { id: 'bio', title: 'Molecular Genetics', code: 'BIO204R01', icon: Dna, color: '#059669', desc: 'DNA Replication, Transcription & Operons' },
            ].map((preset) => {
              const Icon = preset.icon
              return (
                <button
                  key={preset.id}
                  onClick={() => handleStartExtraction(preset.id as any)}
                  className="group relative text-left p-5 rounded-2xl bg-card hover:bg-surface-2 border border-border hover:border-border/80 transition-all duration-300 shadow-lg flex flex-col justify-between h-44"
                >
                  <div className="flex items-start justify-between">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110"
                      style={{ backgroundColor: preset.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-text-muted border border-white/5">
                      {preset.code}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{preset.title}</h3>
                    <p className="text-xs text-text-muted line-clamp-2 mt-1">{preset.desc}</p>
                  </div>

                  <div className="pt-2 flex items-center text-[11px] font-semibold text-primary gap-1 opacity-80 group-hover:opacity-100">
                    <Sparkles className="w-3.5 h-3.5" /> Test Extraction <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              )
            })}
          </div>

          {/* Custom File Upload Dropzone */}
          <div className="relative border-2 border-dashed border-border hover:border-primary/50 rounded-3xl p-10 text-center transition-all bg-background/50 hover:bg-card group">
            <input 
              type="file" 
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            />
            <div className="max-w-md mx-auto space-y-4 pointer-events-none">
              <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-white/10 flex items-center justify-center mx-auto text-text-muted group-hover:text-indigo group-hover:scale-110 transition-all shadow-md">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Drag and drop your syllabus image here</h3>
                <p className="text-xs text-text-muted mt-1">Or click anywhere to browse from your computer (PNG, JPG, PDF)</p>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo/10 border border-indigo/20 text-indigo text-xs font-semibold">
                <FileText className="w-4 h-4" /> Browse Files
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Roadmap Reviewer */}
      {extractedData && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Top Success Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-success/10 via-primary/10 to-primary/5 border border-success/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-success/20 text-success flex items-center justify-center font-bold text-xl shrink-0">
                <Check className="w-6 h-6 text-success" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  Extraction Complete: <span className="text-primary">{extractedData.subjectName}</span>
                </h3>
                <p className="text-xs text-text-muted">
                  Found {extractedData.units.length} Units and {extractedData.units.reduce((a, b) => a + b.topics.length, 0)} Topics from {fileName}. Review and customize below.
                </p>
              </div>
            </div>
            <button
              onClick={() => setExtractedData(null)}
              className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-2 text-text-muted hover:text-foreground text-xs font-semibold border border-border transition-all flex items-center gap-2 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Scan Another Syllabus
            </button>
          </div>

          {/* Subject Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
              <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Course Code</span>
              <p className="text-lg font-extrabold text-foreground">{extractedData.subjectCode}</p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
              <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Estimated Study Time</span>
              <p className="text-lg font-extrabold text-primary flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {extractedData.estimatedTotalHours} Hours
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
              <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Cognitive Difficulty</span>
              <span className={`inline-block px-2.5 py-0.5 text-xs font-bold uppercase rounded-md border ${getDifficultyColor(extractedData.difficulty)}`}>
                {extractedData.difficulty}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
              <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Total Units</span>
              <p className="text-lg font-extrabold text-foreground">{extractedData.units.length} Modules</p>
            </div>
          </div>

          {/* Units & Topics Checklist */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-foreground flex items-center justify-between">
              <span>Structured Curriculum Roadmap</span>
              <span className="text-xs text-text-muted font-normal">Check or uncheck topics to include in your study plan</span>
            </h3>

            <div className="space-y-4">
              {extractedData.units.map((unit, uIdx) => (
                <div key={uIdx} className="rounded-2xl bg-card border border-border overflow-hidden shadow-xl">
                  <div className="px-6 py-4 bg-surface-2/40 border-b border-border flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground">{unit.name}</h4>
                    <span className="text-xs text-text-muted font-semibold">{unit.topics.length} Topics</span>
                  </div>

                  <div className="divide-y divide-white/5">
                    {unit.topics.map((topic, tIdx) => (
                      <div 
                        key={tIdx}
                        onClick={() => handleToggleTopic(uIdx, tIdx)}
                        className={`px-6 py-4 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                          topic.selected ? 'bg-primary/5 hover:bg-primary/10' : 'opacity-40 hover:opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            topic.selected ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'border-border'
                          }`}>
                            {topic.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className={`text-sm font-semibold ${topic.selected ? 'text-foreground' : 'text-text-muted line-through'}`}>
                            {topic.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-text-muted flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {topic.estimated_mins}m
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${getDifficultyColor(topic.difficulty)}`}>
                            {topic.difficulty}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Import Success Modal/Card */}
          {importSuccessId ? (
            <div className="p-8 rounded-3xl bg-gradient-to-r from-primary/15 via-success/10 to-primary/5 border border-primary/30 text-center space-y-4 shadow-2xl animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-success/20 border border-success/60 text-success flex items-center justify-center mx-auto font-bold text-2xl shadow-[0_0_20px_rgba(5,150,105,0.4)]">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-2xl font-extrabold text-foreground">Roadmap Imported Successfully!</h3>
              <p className="text-sm text-text-muted max-w-md mx-auto">
                <strong>{extractedData.subjectName}</strong> has been added to your database along with all selected units and topics.
              </p>
              <div className="pt-2 flex items-center justify-center gap-4">
                <Link href={`/subjects/${importSuccessId}`}>
                  <button className="px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-lg flex items-center gap-2">
                    Open Subject Page <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/dashboard">
                  <button className="px-5 py-3 rounded-xl bg-surface-2 hover:bg-surface-2/80 text-text-muted hover:text-foreground font-semibold text-sm transition-all border border-border">
                    Back to Dashboard
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            /* Bottom Action Bar */
            <div className="sticky bottom-6 p-6 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 z-40">
              <div>
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  Ready to add to your StudyOS database?
                </h4>
                <p className="text-xs text-text-muted">
                  {tier === 'pro' 
                    ? 'Pro Member: One-click import will create this subject and sync tasks.' 
                    : 'Free Tier: This will use your 1 monthly AI extraction limit.'}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setExtractedData(null)}
                  className="px-5 py-3 rounded-xl bg-surface hover:bg-surface-2 text-text-muted hover:text-foreground font-semibold text-sm transition-all border border-border flex-1 sm:flex-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="px-6 py-3 rounded-xl gradient-primary hover:opacity-95 text-primary-foreground font-bold text-sm transition-all glow-primary flex items-center justify-center gap-2 flex-1 sm:flex-none disabled:opacity-50"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Importing to StudyOS...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" /> Import to StudyOS Subjects
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  )
}
