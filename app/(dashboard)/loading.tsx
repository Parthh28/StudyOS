import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="flex-1 p-5 md:p-10 max-w-[1200px] w-full mx-auto flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-indigo/30 animate-pulse"></div>
          <Loader2 className="w-10 h-10 text-indigo animate-spin relative z-10" />
        </div>
        <p className="text-sm font-semibold text-text-muted tracking-widest uppercase animate-pulse">
          Loading Data...
        </p>
      </div>
    </div>
  )
}
