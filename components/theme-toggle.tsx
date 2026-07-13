'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button 
        className="p-2 rounded-full hover:bg-surface-2 transition-colors text-text-muted w-9 h-9 flex items-center justify-center"
        aria-label="Toggle theme"
      >
        <span className="w-5 h-5" />
      </button>
    )
  }

  const current = theme === 'system' ? resolvedTheme : theme

  return (
    <button
      onClick={() => setTheme(current === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full hover:bg-surface-2 hover:text-primary transition-all text-text-muted w-9 h-9 flex items-center justify-center relative group shadow-sm border border-transparent hover:border-border"
      title={current === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      {current === 'dark' ? (
        <Sun className="h-5 w-5 text-amber-400 transition-transform group-hover:rotate-45 duration-300" />
      ) : (
        <Moon className="h-5 w-5 text-primary transition-transform group-hover:-rotate-12 duration-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
