'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  LineChart,
  Settings,
  // Sparkles,
  // MessageSquare,
  Target,
  Clock,
} from 'lucide-react'

type NavItem = {
  name: string
  href: string
  icon: React.ElementType
  matches?: string[]
  badge?: string
}

export function SidebarNav() {
  const pathname = usePathname()

  const links: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Subjects', href: '/subjects', icon: BookOpen, matches: ['/subjects'] },
    { name: 'Mastery Hub', href: '/mastery', icon: Target, matches: ['/mastery'] },
    { name: 'Pomodoro', href: '/pomodoro', icon: Clock, matches: ['/pomodoro'] },
    { name: 'Analytics', href: '/analytics', icon: LineChart },
    // Temporarily hidden until AI feature release:
    // { name: 'AI Coach', href: '/ai-coach', icon: Sparkles, badge: 'PRO' },
    // { name: 'AI Chat', href: '/ai-chat', icon: MessageSquare, badge: 'PRO' },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="space-y-0.5">
      {links.map((link) => {
        const Icon = link.icon
        const isActive =
          pathname === link.href ||
          link.matches?.some((m) => pathname.startsWith(m))

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
              isActive
                ? 'bg-surface-2 text-foreground font-semibold border border-border/80 shadow-xs'
                : 'text-text-muted hover:bg-surface/80 hover:text-foreground border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-primary' : 'text-text-muted group-hover:text-foreground'
                }`}
              />
              <span className="tracking-tight">{link.name}</span>
            </div>

            {link.badge && (
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase rounded bg-primary/10 text-primary border border-primary/20">
                {link.badge}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
