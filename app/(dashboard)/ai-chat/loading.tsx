import { Skeleton } from '@/components/skeleton'

export default function AIChatLoading() {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] max-w-[1200px] w-full mx-auto p-4 md:p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {/* Chat Messages Area Skeleton */}
      <div className="flex-1 py-6 space-y-6 overflow-hidden">
        {/* Assistant Bubble */}
        <div className="flex gap-4 max-w-2xl">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-4 space-y-2.5 w-full">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>

        {/* User Bubble */}
        <div className="flex gap-4 max-w-xl ml-auto justify-end">
          <div className="bg-primary/20 border border-primary/30 rounded-2xl rounded-tr-sm p-4 space-y-2 w-full">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        {/* Assistant Bubble 2 */}
        <div className="flex gap-4 max-w-2xl">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-4 space-y-2.5 w-full">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>

      {/* Input Area Skeleton */}
      <div className="pt-4 border-t border-border">
        <div className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3">
          <Skeleton className="flex-1 h-10 rounded-xl" />
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        </div>
      </div>
    </div>
  )
}
