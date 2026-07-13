import { Skeleton } from '@/components/skeleton'

export default function PomodoroLoading() {
  return (
    <div className="flex-1 p-5 md:p-10 max-w-[1300px] w-full mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Main Focus Studio Arena Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Timer Center Stage */}
        <div className="lg:col-span-8 bg-card border border-border rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center space-y-8 shadow-lg min-h-[540px]">
          {/* Mode pills */}
          <div className="flex gap-2 p-1.5 rounded-full bg-surface-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>

          {/* Circular Countdown Skeleton */}
          <div className="relative w-72 h-72 rounded-full border-4 border-surface-2 flex flex-col items-center justify-center space-y-3">
            <Skeleton className="h-16 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-40 rounded-2xl" />
            <Skeleton className="h-14 w-14 rounded-2xl" />
          </div>
        </div>

        {/* Right Session Configuration & Stats Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <Skeleton className="h-6 w-36" />
            <div className="space-y-4">
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map((s) => (
                <div key={s} className="p-3 bg-surface-2 rounded-xl space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
