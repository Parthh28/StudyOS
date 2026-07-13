import React from 'react'
import { Loader2 } from 'lucide-react'

export function SpinnerLoadingEffect({
  message = 'Processing your request...',
  subMessage = 'Please wait a moment',
}: {
  message?: string
  subMessage?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 rounded-2xl bg-card border border-border shadow-lg animate-fade-in">
      <div className="relative flex items-center justify-center w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
        <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-primary/40 border-l-transparent animate-spin" />
        <Loader2 className="w-7 h-7 text-primary animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <h4 className="text-base font-bold text-foreground">{message}</h4>
        <p className="text-xs text-text-muted">{subMessage}</p>
      </div>
    </div>
  )
}

export function ButtonSpinner({ className = 'w-4 h-4 mr-2' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />
}
