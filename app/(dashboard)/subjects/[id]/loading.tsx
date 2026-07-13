import { Skeleton } from '@/components/skeleton'

export default function SubjectDetailLoading() {
  return (
    <div className="flex-1 p-5 md:p-10 max-w-[1200px] w-full mx-auto animate-pulse">
      <div className="bg-card rounded-2xl p-6 md:p-8 flex flex-col border border-border shadow-lg space-y-8">
        {/* Back navigation & Header with Circular Ring Skeleton */}
        <div className="border-b border-border pb-6 space-y-6">
          <Skeleton className="h-4 w-36" />
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-8 w-72 md:w-96" />
              <Skeleton className="h-4 w-full max-w-xl" />
            </div>
            <Skeleton className="w-20 h-20 rounded-full shrink-0" />
          </div>
        </div>

        {/* 4-Stat Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface-2 p-4 rounded-xl text-center border border-border space-y-2">
              <Skeleton className="h-7 w-12 mx-auto" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </div>
          ))}
        </div>

        {/* Study Mode Selector & Tabs Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((t) => (
              <Skeleton key={t} className="h-10 w-28 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-10 w-44 rounded-lg" />
        </div>

        {/* Topic Items Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="p-4 rounded-xl border border-border bg-surface/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="w-6 h-6 rounded-md" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
