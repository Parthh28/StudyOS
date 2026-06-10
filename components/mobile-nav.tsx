'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import { SidebarNav } from '@/components/sidebar-nav'
import { PomodoroTimer } from '@/components/pomodoro-timer'

type SubjectProps = {
  id: string
  name: string
}

export function MobileNav({ 
  profileName, 
  firstName, 
  subjects 
}: { 
  profileName: string
  firstName: string
  subjects: SubjectProps[] 
}) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger 
        render={<button className="md:hidden p-2 mr-2 text-text-muted hover:text-white transition-colors" aria-label="Open Menu" />}
      >
        <Menu className="w-6 h-6" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] bg-[#131b2e] border-r border-white/10 p-0 flex flex-col gap-0 z-[100] border-y-0 border-l-0 text-foreground">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <span className="text-lg">{firstName.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">{profileName}</h2>
            <p className="text-xs font-semibold tracking-wider text-indigo uppercase">Deep Focus</p>
          </div>
        </div>

        <div className="py-6 flex-1 overflow-y-auto" onClick={() => setOpen(false)}>
          <SidebarNav />
        </div>

        <div className="p-6 mt-auto border-t border-white/5">
          <PomodoroTimer subjects={subjects} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
