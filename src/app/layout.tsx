import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// ====== BASE METADATA (template untuk child pages) ======
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ),
  // Template: child pages bisa override dengan generateMetadata
  // title: {
  //   default: 'Undangan Pernikahan Digital',
  //   template: '%s | Wedding Invitation',
  // },
  title : 'Undangan Pernikahan Digital',
  description: 'Anda diundang untuk merayakan pernikahan kami',
  applicationName: 'Wedding Invitation',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FBF8F3',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <ErrorBoundary>{children}</ErrorBoundary>
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#FFFEF7',
              border: '1px solid #C9A96E',
              color: '#6B5B5B',
              fontFamily: 'Jost, sans-serif',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  )
}