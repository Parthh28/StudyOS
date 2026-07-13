'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { TodoList } from './todo-list'

export function DashboardPlanMyDay({ 
  nextSubjectId, 
  initialTodos 
}: { 
  nextSubjectId?: string
  initialTodos: any[] 
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 shrink-0">
        <Link href={`/dashboard?timer=open${nextSubjectId ? `&subjectId=${nextSubjectId}` : ''}`}>
          <button className="px-4 py-2.5 rounded-xl bg-card hover:bg-surface-2 border border-border text-foreground text-xs font-semibold inline-flex items-center justify-center transition-all shadow-sm">
            Start session
          </button>
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-md transition-all"
        >
          Plan today&apos;s day
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="animate-fade-in-up mt-2 w-full max-w-2xl">
          <TodoList initialTodos={initialTodos} />
        </div>
      )}
    </div>
  )
}
