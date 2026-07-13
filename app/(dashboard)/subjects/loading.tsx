import { Skeleton } from '@/components/skeleton'

export default function SubjectsLoading() {
  return (
    <div className="flex-1 p-5 md:p-10 max-w-[1200px] w-full mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-10 space-y-3">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Grid of Subject Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-6 border border-border border-l-4 border-l-primary/40 shadow-sm flex flex-col justify-between h-56 space-y-6"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-16 rounded-md" />
                  <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-10" />
              </div>
              <Skeleton className="w-full h-2 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
