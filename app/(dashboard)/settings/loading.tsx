import { Skeleton } from '@/components/skeleton'

export default function SettingsLoading() {
  return (
    <div className="flex-1 p-5 md:p-10 max-w-[1000px] w-full mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Profile Card Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-border">
          <Skeleton className="w-20 h-20 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-9 w-32 rounded-lg mt-2" />
          </div>
        </div>

        {/* Form Fields Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((f) => (
            <div key={f} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>

        <div className="pt-4 flex justify-end">
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
