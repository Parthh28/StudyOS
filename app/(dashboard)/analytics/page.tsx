import { getDashboardData } from '@/lib/actions/data'
import { redirect } from 'next/navigation'
import { CheckCircle2, TrendingUp, TrendingDown, BrainCircuit, Calendar, Flag, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { StudyTrendsChart } from '@/components/study-trends-chart'

export default async function AnalyticsPage() {
  const { success, data } = await getDashboardData()

  if (!success || !data) {
    redirect('/login')
  }

  const { subjectStats, hoursStudiedThisWeek, recentSessions } = data

  // Calculations for mock metrics
  const totalTopics = subjectStats.reduce((acc: number, curr: any) => acc + (curr.total_topics || 0), 0)
  const completedTopics = subjectStats.reduce((acc: number, curr: any) => acc + (curr.completed_topics || 0), 0)
  const syllabusProgress = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100)
  
  // Generate real-time graph data for the last 14 days
  const supabase = await createClient()
  const now = new Date()
  const oneEightyDaysAgo = new Date(now)
  oneEightyDaysAgo.setDate(now.getDate() - 180)
  
  const { data: chartSessions } = await supabase
    .from('study_sessions')
    .select('duration_mins, started_at, subject_id')
    .gte('started_at', oneEightyDaysAgo.toISOString())

  // Real distribution based on chartSessions for Subject Focus
  const subjectTimeMap: Record<string, number> = {}
  let totalSessionMins = 0
  
  chartSessions?.forEach(s => {
    if (s.subject_id) {
      subjectTimeMap[s.subject_id] = (subjectTimeMap[s.subject_id] || 0) + s.duration_mins
      totalSessionMins += s.duration_mins
    }
  })

  let cumulativeOffset = 0
  const doughnutSegments = subjectStats.map((stat: any) => {
    const weight = subjectTimeMap[stat.subject_id] || 0
    const percentage = totalSessionMins > 0 ? Math.round((weight / totalSessionMins) * 100) : 0
    
    const strokeDasharray = `${percentage} ${100 - percentage}`
    const strokeDashoffset = -cumulativeOffset
    cumulativeOffset += percentage
    return { ...stat, percentage, weight, strokeDasharray, strokeDashoffset }
  }).filter((s: any) => s.percentage > 0)
    .sort((a: any, b: any) => b.percentage - a.percentage)


  const dailyTotals = Array(14).fill(0)
  const today = new Date()
  today.setHours(0,0,0,0)

  const heatmapData = Array(180).fill(0)

  chartSessions?.forEach(s => {
    const sessionDate = new Date(s.started_at)
    sessionDate.setHours(0,0,0,0)
    const diffDays = Math.round((today.getTime() - sessionDate.getTime()) / (1000 * 3600 * 24))
    
    // For the 14-day line chart
    if (diffDays >= 0 && diffDays < 14) {
      const index = 13 - diffDays
      dailyTotals[index] += s.duration_mins / 60
    }
    
    // For the 180-day heatmap
    if (diffDays >= 0 && diffDays < 180) {
      const index = 179 - diffDays
      heatmapData[index] += s.duration_mins
    }
  })

  // Calculate Heatmap Stats
  let total180DaysMins = 0
  let maxDayMins = 0
  let currentStreak = 0

  for (let i = 179; i >= 0; i--) {
    const mins = heatmapData[i]
    total180DaysMins += mins
    if (mins > maxDayMins) maxDayMins = mins
    
    // Streak logic (allow today to be 0 without breaking an existing streak from yesterday)
    if (mins > 0) {
      currentStreak++
    } else if (i < 179) {
      break
    }
  }

  // Dynamic scaling for Y axis
  const maxHours = Math.max(6, ...dailyTotals) // minimum 6h max scale for visual aesthetics
  
  // Format data for Recharts
  const chartData = dailyTotals.map((val, idx) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - idx))
    const name = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return { name, hours: Number(val.toFixed(1)) }
  })

  return (
    <div className="flex-1 p-5 md:p-10 max-w-[1200px] w-full mx-auto">
      
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text gradient-text mb-2">Academic Analytics</h2>
          <p className="text-text-muted max-w-2xl">
            A comprehensive overview of your study patterns, focus metrics, and syllabus progression.
          </p>
        </div>
        <div className="relative group">
          <button className="glass px-4 py-2 rounded-lg flex items-center gap-3 hover:bg-white/5 transition-colors border border-white/10">
            <Calendar className="text-indigo w-4 h-4" />
            <span className="text-sm font-semibold text-white">Last 30 Days</span>
            <ChevronDown className="text-text-muted w-4 h-4 group-hover:text-indigo transition-colors" />
          </button>
        </div>
      </section>

      {/* Grid Layout for Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top Row: Completion Metrics Cards */}
        <div className="col-span-1 lg:col-span-12 grid grid-cols-1 md:grid-cols-1 gap-6">
          
          {/* Card 1: Syllabus Completion */}
          <div className="glass rounded-xl p-6 relative overflow-hidden flex flex-col justify-between h-40 group hover:border-white/30 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold tracking-widest text-text-muted uppercase">Syllabus Completion</span>
              <CheckCircle2 className="text-indigo w-5 h-5" />
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">{syllabusProgress}%</span>
              </div>
              <div className="w-full bg-surface-2 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="gradient-primary h-full rounded-full transition-all duration-1000" style={{ width: `${syllabusProgress}%` }}></div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-indigo/20 rounded-full blur-xl"></div>
          </div>

        </div>

        {/* Middle Row: Main Graph & Doughnut */}
        {/* Study Time Trends */}
        <div className="col-span-1 lg:col-span-8 glass rounded-xl p-6 relative overflow-hidden flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">Study Time Trends</h3>
              <p className="text-sm text-text-muted">Hours logged per day</p>
            </div>
          </div>
          
          <div className="flex-1 w-full h-[300px] mt-6">
            <StudyTrendsChart data={chartData} />
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="col-span-1 lg:col-span-4 glass rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">Subject Focus</h3>
            <p className="text-sm text-text-muted">Time allocation</p>
          </div>
          
          {/* Doughnut Chart */}
          <div className="relative w-48 h-48 mx-auto my-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#1E293B" strokeWidth="6"></circle>
              {doughnutSegments.map((segment: any, index: number) => (
                <circle 
                  key={segment.subject_id}
                  cx="18" cy="18" r="15.9155" fill="none" 
                  stroke={segment.subject_color} 
                  strokeWidth="6" 
                  strokeDasharray={segment.strokeDasharray} 
                  strokeDashoffset={segment.strokeDashoffset}
                  className="transition-all duration-1000 hover:stroke-[8px] cursor-pointer"
                ></circle>
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-surface/50 backdrop-blur-sm m-6 shadow-inner border border-white/5">
              <span className="text-xl text-white font-bold whitespace-nowrap">
                {Math.floor(totalSessionMins / 60)}h {totalSessionMins % 60}m
              </span>
              <span className="text-[10px] text-text-muted font-semibold tracking-widest uppercase">Logged</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {doughnutSegments.length > 0 ? (
              doughnutSegments.map((segment: any) => (
                <div key={segment.subject_id} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: segment.subject_color }}></div>
                    <span className="text-sm text-white group-hover:opacity-80 transition-opacity line-clamp-1">{segment.subject_name}</span>
                  </div>
                  <span className="text-sm font-semibold text-text-muted shrink-0">
                    {segment.weight >= 60 
                      ? `${Math.floor(segment.weight / 60)}h ${segment.weight % 60}m` 
                      : `${segment.weight}m`}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-text-muted py-2">
                No active sessions logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row: Heatmap */}
        <div className="col-span-1 lg:col-span-12 glass rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">Revision Consistency</h3>
              <p className="text-sm text-text-muted">Daily contribution frequency</p>
            </div>
          </div>
          
          <div className="flex flex-col-reverse xl:flex-row gap-8 items-start w-full">
            
            {/* Heatmap */}
            <div className="w-full overflow-x-auto pt-14 pb-4 custom-scrollbar">
              <div className="min-w-max px-2">
                <div className="grid grid-rows-7 grid-flow-col gap-[3px] w-max mx-auto xl:mx-0">
                  {heatmapData.map((mins, i) => {
                    // Calculate intensity based on real minutes
                    let intensity = 0
                    if (mins > 0) intensity = 1
                    if (mins >= 30) intensity = 2
                    if (mins >= 60) intensity = 3
                    if (mins >= 120) intensity = 4

                    let bgColor = '#1E293B' // surface
                    if (intensity === 1) bgColor = 'rgba(99,102,241, 0.2)'
                    if (intensity === 2) bgColor = 'rgba(99,102,241, 0.4)'
                    if (intensity === 3) bgColor = 'rgba(99,102,241, 0.6)'
                    if (intensity === 4) bgColor = '#6366F1'

                    // Create a date label for the tooltip
                    const d = new Date()
                    d.setDate(d.getDate() - (179 - i))
                    const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

                    return (
                      <div 
                        key={i} 
                        tabIndex={0}
                        className="w-4 h-4 rounded-sm transition-all duration-200 hover:scale-110 focus:scale-110 hover:z-10 focus:z-10 cursor-pointer relative group focus:outline-none"
                        style={{ 
                          backgroundColor: bgColor,
                          boxShadow: intensity === 4 ? '0 0 5px #6366F1' : 'none'
                        }}
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-11 left-1/2 transform -translate-x-1/2 bg-[#0b1326] text-white text-[10px] py-1.5 px-2.5 rounded opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl font-semibold">
                          {mins > 0 ? `${Math.floor(mins/60)}h ${mins%60}m` : '0m'} • {dateLabel}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="w-full xl:w-64 grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4 shrink-0">
              <div className="bg-surface-2/30 border border-white/5 rounded-xl p-4 flex flex-col justify-center">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1">Total Time (180d)</p>
                <p className="text-xl font-bold text-white">{Math.floor(total180DaysMins/60)}h {total180DaysMins%60}m</p>
              </div>
              <div className="bg-surface-2/30 border border-white/5 rounded-xl p-4 flex flex-col justify-center relative overflow-hidden">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1">Current Streak</p>
                <p className="text-xl font-bold text-white flex items-center gap-2">
                  {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
                  {currentStreak > 0 && <span className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]">🔥</span>}
                </p>
                {currentStreak > 2 && (
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-orange-500/20 blur-xl rounded-full"></div>
                )}
              </div>
              <div className="bg-surface-2/30 border border-white/5 rounded-xl p-4 flex flex-col justify-center">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1">Most Active Day</p>
                <p className="text-xl font-bold text-white">{Math.floor(maxDayMins/60)}h {maxDayMins%60}m</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
