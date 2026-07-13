import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Calendar,
  // Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { SidebarNav } from '@/components/sidebar-nav'
import { GlobalSearch } from '@/components/global-search'
import { NotificationBell } from '@/components/notification-bell'
import { MobileNav } from '@/components/mobile-nav'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }

  const firstName = profile.full_name?.split(' ')[0] || 'Student'

  const currentDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  const { data: cleanedSubjects } = await supabase
    .from('subjects')
    .select('id, name')
    .order('order_index')

  return (
    <div className="bg-background text-foreground min-h-screen flex overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Precision SaaS Sidebar (Desktop) */}
      <nav className="hidden md:flex flex-col h-screen w-60 fixed left-0 top-0 bg-card/60 backdrop-blur-md border-r border-border/70 p-4 gap-6 z-[60]">
        {/* StudyOS Logo */}
        <div className="px-2 pt-1 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="StudyOS Logo" className="h-8 w-auto object-contain" />
          </Link>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border/70 text-text-muted">
            v2.5
          </span>
        </div>

        {/* User Workspace Identity Card */}
        <div className="px-2.5 py-2 rounded-xl bg-surface/60 border border-border/60 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center font-bold text-white text-xs shrink-0">
            {firstName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xs font-semibold text-foreground truncate">
              {profile?.full_name || 'Student'}
            </h2>
            <p className="text-[10px] font-mono text-text-muted truncate">
              Deep Focus Workspace
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          <SidebarNav />
        </div>
      </nav>

      {/* Main Content Shell */}
      <main className="flex-1 ml-0 md:ml-60 flex flex-col min-h-screen">
        {/* Precision SaaS Header */}
        <header className="sticky top-0 w-full h-14 bg-background/85 backdrop-blur-md border-b border-border/70 z-50 flex justify-between items-center px-4 md:px-6">
          <div className="flex items-center gap-3">
            <MobileNav
              profileName={profile?.full_name || 'Student'}
              firstName={firstName}
              subjects={cleanedSubjects || []}
            />
            <img src="/logo.png" alt="StudyOS Logo" className="md:hidden h-7 w-auto object-contain" />
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-text-muted bg-surface/80 px-2.5 py-1 rounded-md border border-border/60">
                {currentDate}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-text-muted shrink-0">
            <GlobalSearch />
            {/* Temporarily hidden until AI feature launch:
            <Link href="/ai-chat" className="hidden sm:block">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-primary text-white text-xs font-semibold transition-all hover:opacity-90 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>
            </Link>
            */}
            <NotificationBell />
            <ThemeToggle />
            <Link href="/calendar" className="hidden sm:block">
              <button
                type="button"
                className="hover:text-foreground transition-colors p-2 rounded-lg hover:bg-surface-2"
                title="Calendar"
              >
                <Calendar className="w-4 h-4" />
              </button>
            </Link>

            {/* Mobile Avatar */}
            <div className="md:hidden w-7 h-7 rounded-full overflow-hidden border border-border ml-1 gradient-primary flex items-center justify-center font-bold text-xs text-white shrink-0">
              {firstName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1">{children}</div>
      </main>
    </div>
  )
}
