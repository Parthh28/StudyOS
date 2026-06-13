import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  LayoutDashboard,
  BookOpen,
  LineChart,
  Settings,
  Play,
  Search,
  Bell,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'
import { SidebarNav } from '@/components/sidebar-nav'
import { PomodoroTimer } from '@/components/pomodoro-timer'
import { GlobalSearch } from '@/components/global-search'
import { NotificationBell } from '@/components/notification-bell'
import { MobileNav } from '@/components/mobile-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Ensure user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch basic profile info for the sidebar/header
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // If user has no profile, force them to complete onboarding
  if (!profile) {
    redirect('/onboarding')
  }

  const firstName = profile.full_name?.split(' ')[0] || 'Student'
  
  // Format current date "October 24, 2023"
  const currentDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  // Fetch subjects for Pomodoro
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name, code, created_at')
    .order('created_at', { ascending: true })



  // Refetch cleaned subjects for Pomodoro
  const { data: cleanedSubjects } = await supabase
    .from('subjects')
    .select('id, name')
    .order('order_index')

  return (
    <div className="bg-background text-foreground min-h-screen flex overflow-x-hidden selection:bg-indigo/30 selection:text-indigo">
      {/* SideNavBar (Desktop) */}
      <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#131b2e] dark:bg-[#131b2e] border-r border-white/5 shadow-2xl py-8 gap-8 z-[60]">
        
        {/* StudyOS Logo */}
        <div className="px-6 flex justify-center w-full">
          <img src="/logo.png" alt="StudyOS Logo" className="h-14 w-auto object-contain" />
        </div>

        {/* User Profile */}
        <div className="px-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(99,102,241,0.3)] shrink-0">
            <span className="text-lg">{firstName.charAt(0)}</span>
          </div>
          <div className="overflow-hidden">
            <h2 className="text-sm font-semibold text-white truncate">{profile?.full_name || 'Student'}</h2>
            <p className="text-xs font-semibold tracking-wider text-indigo uppercase truncate">Deep Focus</p>
          </div>
        </div>

        <SidebarNav />

        <div className="px-6 mt-auto">
          <PomodoroTimer subjects={cleanedSubjects || []} />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col min-h-screen">
        {/* TopNavBar */}
        <header className="sticky top-0 w-full bg-[#0b1326]/80 backdrop-blur-md border-b border-white/10 shadow-sm z-50 flex justify-between items-center px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-4">
            <MobileNav 
              profileName={profile?.full_name || 'Student'} 
              firstName={firstName} 
              subjects={cleanedSubjects || []} 
            />
            {/* Mobile Logo */}
            <img src="/logo.png" alt="StudyOS Logo" className="md:hidden h-8 w-auto object-contain" />
            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-white">Welcome back, {firstName}</h1>
              <p className="text-sm text-text-muted">{currentDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 text-text-muted shrink-0">
            <GlobalSearch />
            <NotificationBell />
            <Link href="/calendar" className="hidden sm:block">
              <button className="hover:text-indigo transition-colors p-2 rounded-full hover:bg-surface-2/50" title="Calendar">
                <Calendar className="w-5 h-5" />
              </button>
            </Link>
            
            {/* Mobile Profile Avatar */}
            <div className="md:hidden w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-white/10 ml-1 gradient-primary flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0">
              {firstName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        {children}
      </main>
    </div>
  )
}
