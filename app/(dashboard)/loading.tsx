import { Skeleton } from '@/components/skeleton'

export default function DashboardLoading() {
  return (
    <div className="flex-1 p-5 md:p-10 max-w-[1600px] w-full mx-auto space-y-8 animate-pulse">
      {/* Top Welcome Banner Skeleton */}
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-3 max-w-xl w-full">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-72 md:w-96" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* 4-Card Lovable Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-5 rounded-md" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Left Column & Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-8 space-y-8">
          {/* Exam Countdown Widget Skeleton */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          </div>

          {/* Academic Mastery & Diagnostic Focus Section Skeleton */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-60" />
              <Skeleton className="h-8 w-72 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((k) => (
                <div key={k} className="bg-card border border-border rounded-2xl p-6 shadow-md space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-md space-y-6">
            <Skeleton className="h-6 w-28" />
            <div className="flex justify-center gap-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <Skeleton className="w-24 h-24 rounded-full" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-md space-y-4">
            <Skeleton className="h-6 w-36" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((l) => (
                <Skeleton key={l} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
