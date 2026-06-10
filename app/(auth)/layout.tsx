export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen overflow-hidden gradient-bg flex items-center justify-center p-4">
      {/* Animated background orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Large orb top-left */}
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20 animate-pulse-slow"
          style={{
            background:
              'radial-gradient(circle, #6366F1 0%, transparent 70%)',
          }}
        />
        {/* Medium orb bottom-right */}
        <div
          className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full opacity-15 animate-float"
          style={{
            background:
              'radial-gradient(circle, #8B5CF6 0%, transparent 70%)',
          }}
        />
        {/* Small orb center */}
        <div
          className="absolute top-1/3 right-1/4 w-[260px] h-[260px] rounded-full opacity-10"
          style={{
            background:
              'radial-gradient(circle, #06B6D4 0%, transparent 70%)',
          }}
        />

        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  )
}
