'use client'

import { useState, useEffect, useTransition } from 'react'
import { Search, Loader2, BookOpen, X } from 'lucide-react'
import { searchTopics } from '@/lib/actions/data'
import Link from 'next/link'

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isPending, startTransition] = useTransition()

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Handle search when query changes
  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const { success, data } = await searchTopics(query)
        if (success) {
          setResults(data)
        }
      })
    }, 300) // debounce

    return () => clearTimeout(timer)
  }, [query])

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-2/50"
        title="Search (Cmd+K)"
      >
        <Search className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-background/80 backdrop-blur-md p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden flex flex-col">
            
            {/* Search Input */}
            <div className="flex items-center px-4 border-b border-border">
              <Search className="w-5 h-5 text-primary" />
              <input
                autoFocus
                type="text"
                placeholder="Search topics, formulas, notes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-none text-lg text-foreground px-4 py-5 focus:outline-none placeholder:text-text-muted/50"
              />
              {isPending ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <kbd className="hidden sm:inline-flex items-center justify-center px-2 py-1 text-[10px] font-medium text-text-muted bg-surface-2 rounded border border-border uppercase">
                    ESC
                  </kbd>
                  <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-foreground p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {query === '' ? (
                <div className="py-12 text-center text-text-muted">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">Start typing to search your entire curriculum</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((topic) => (
                    <Link 
                      href={`/subjects/${topic.subject_id}`} 
                      key={topic.id}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-2 h-2 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: topic.subject?.color || '#2563EB' }}
                          />
                          <div>
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {topic.name}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">
                              {topic.subject?.name}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">Jump →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : !isPending ? (
                <div className="py-12 text-center text-text-muted">
                  <p className="text-sm">No topics found for "{query}"</p>
                </div>
              ) : null}
            </div>

          </div>
        </div>
      )}
    </>
  )
}
