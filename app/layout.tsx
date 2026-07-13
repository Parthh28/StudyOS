import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, DM_Sans, Space_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ServiceWorkerRegistrar } from '@/components/service-worker-registrar'

const headingWeb = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading-web',
  display: 'swap',
})

const bodyWeb = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body-web',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'StudyOS — Academic Productivity System',
    template: '%s | StudyOS',
  },
  description:
    'A smart study tracker with spaced repetition, analytics, and revision scheduling built for engineering students.',
  keywords: ['study tracker', 'spaced repetition', 'engineering', 'academics'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'StudyOS',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${headingWeb.variable} ${bodyWeb.variable} ${spaceMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans" suppressHydrationWarning>
        <ServiceWorkerRegistrar />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
