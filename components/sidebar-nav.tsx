'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  BookOpen,
  LineChart,
  Settings,
  LogOut,
  AlertTriangle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"

export function SidebarNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Subjects', href: '/subjects', icon: BookOpen, matches: ['/subjects'] },
    { name: 'Analytics', href: '/analytics', icon: LineChart },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="flex-1 px-4 space-y-2">
      {links.map((link) => {
        const Icon = link.icon
        // Check if current pathname starts with the link href (useful for nested routes like /subjects/[id])
        const isActive = link.matches 
          ? link.matches.some(m => pathname.startsWith(m))
          : pathname === link.href

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive
                ? 'text-indigo bg-indigo/10 shadow-[inset_0_0_10px_rgba(99,102,241,0.05)] border border-indigo/20'
                : 'text-text-muted hover:bg-surface-2/50 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-wide">{link.name}</span>
          </Link>
        )
      })}
      
      <Dialog>
        <DialogTrigger render={
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-text-muted hover:bg-surface-2/50 hover:text-danger mt-4">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-wide">Log Out</span>
          </button>
        } />
        
        <DialogContent className="bg-[#0b1326] border-white/10 sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2 text-xl">
              <LogOut className="w-5 h-5 text-danger" />
              Sign Out
            </DialogTitle>
            <DialogDescription className="text-text-muted mt-2">
              Are you sure you want to log out of StudyOS? You will need to log back in to access your dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t border-white/5 bg-transparent mt-6 pt-4 sm:justify-end gap-3 flex-row flex">
            <DialogClose render={
              <button className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-surface-2 hover:bg-surface-2/80 transition-all flex-1 sm:flex-none">
                Cancel
              </button>
            } />
            <DialogClose render={
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-danger/90 hover:bg-danger transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] flex-1 sm:flex-none"
              >
                Yes, Sign Out
              </button>
            } />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
