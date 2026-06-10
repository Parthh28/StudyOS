'use client'

import { useState, useEffect } from 'react'
import { Bell, Flame, AlertCircle } from 'lucide-react'
import { getNotifications } from '@/lib/actions/data'
import Link from 'next/link'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [overdue, setOverdue] = useState<any[]>([])
  const [weak, setWeak] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNotifs() {
      const { success, data } = await getNotifications()
      if (success && data) {
        setOverdue(data.overdue || [])
        setWeak(data.weak || [])
      }
      setLoading(false)
    }
    fetchNotifs()
  }, [])

  const hasNotifications = overdue.length > 0 || weak.length > 0
  const totalCount = overdue.length + weak.length

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="hover:text-indigo transition-colors p-2 rounded-full hover:bg-surface-2/50 relative"
      >
        <Bell className="w-5 h-5" />
        {hasNotifications && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-[#0b1326] animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Invisible backdrop to close dropdown when clicking outside */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 top-12 w-80 bg-[#131b2e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0b1326]">
              <h3 className="font-semibold text-white">Notifications</h3>
              {hasNotifications && (
                <span className="text-[10px] font-bold bg-danger/20 text-danger px-2 py-0.5 rounded-full">
                  {totalCount} New
                </span>
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-text-muted text-sm">Loading...</div>
              ) : !hasNotifications ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-text-muted" />
                  </div>
                  <p className="text-sm text-text-muted">You're all caught up!</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* Overdue Topics */}
                  {overdue.length > 0 && (
                    <div className="p-3">
                      <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 px-2">Overdue Revision</h4>
                      {overdue.map(topic => (
                        <Link href={`/subjects/${topic.subject_id}`} key={`overdue-${topic.id}`} onClick={() => setIsOpen(false)}>
                          <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="mt-0.5 w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                              <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white line-clamp-2 leading-tight">{topic.name}</p>
                              <p className="text-xs text-text-muted mt-1">{topic.subject_name}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Weak Topics */}
                  {weak.length > 0 && (
                    <div className="p-3 border-t border-white/5">
                      <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 px-2">Weak Topics</h4>
                      {weak.map(topic => (
                        <Link href={`/subjects/${topic.subject_id}`} key={`weak-${topic.id}`} onClick={() => setIsOpen(false)}>
                          <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="mt-0.5 w-7 h-7 rounded-full bg-danger/20 flex items-center justify-center flex-shrink-0">
                              <Flame className="w-3.5 h-3.5 text-danger" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white line-clamp-2 leading-tight">{topic.name}</p>
                              <p className="text-xs text-text-muted mt-1">{topic.subject?.name}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
