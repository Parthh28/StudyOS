import { Skeleton } from '@/components/skeleton'

export default function AnalyticsLoading() {
  return (
    <div className="flex-1 p-5 md:p-10 max-w-[1400px] w-full mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Study Chart Skeleton */}
        <div className="lg:col-span-8 bg-card border border-border rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-44" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          </div>
          <div className="h-72 w-full flex items-end gap-3 pt-8">
            {[40, 65, 30, 85, 55, 90, 75, 45, 60, 80, 50, 70].map((val, idx) => (
              <Skeleton
                key={idx}
                className="flex-1 rounded-t-lg"
                style={{ height: `${val}%` }}
              />
            ))}
          </div>
        </div>

        {/* Breakdown Card Skeleton */}
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6 space-y-6">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-5">
            {[1, 2, 3, 4, 5].map((b) => (
              <div key={b} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-10" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
