import { Skeleton } from '@/components/skeleton'

export default function CalendarLoading() {
  return (
    <div className="flex-1 p-5 md:p-10 max-w-[1400px] w-full mx-auto space-y-6 animate-pulse">
      {/* Calendar Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* Calendar Grid Skeleton */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-border bg-surface-2 p-4">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div key={day} className="text-center space-y-2">
              <Skeleton className="h-3 w-10 mx-auto" />
              <Skeleton className="h-6 w-8 mx-auto rounded-full" />
            </div>
          ))}
        </div>

        {/* Calendar Body Shimmer */}
        <div className="grid grid-cols-7 divide-x divide-border min-h-[520px]">
          {[1, 2, 3, 4, 5, 6, 7].map((col) => (
            <div key={col} className="p-3 space-y-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              {col % 2 === 0 && <Skeleton className="h-20 w-full rounded-xl" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
