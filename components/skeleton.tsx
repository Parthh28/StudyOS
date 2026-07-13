import React from 'react'

export function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`shimmer rounded-xl bg-surface-2 border border-border/40 ${className}`}
      {...props}
    />
  )
}
