/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // ====== Cegah Clickjacking ======
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // ====== Cegah MIME Sniffing ======
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // ====== Referrer Policy ======
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // ====== Permissions Policy ======
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // ====== XSS Protection (legacy browsers) ======
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // ====== HSTS (untuk production HTTPS) ======
          // Uncomment jika sudah pakai HTTPS:
          // {
          //   key: 'Strict-Transport-Security',
          //   value: 'max-age=31536000; includeSubDomains',
          // },
          // ====== Content Security Policy ======
          {
            key: 'Content-Security-Policy',
            value: [
              // Default: hanya dari domain sendiri
              "default-src 'self'",
              // Scripts: Next.js butuh inline & eval di dev
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Styles: Tailwind & Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts: Google Fonts
              "font-src 'self' https://fonts.gstatic.com data:",
              // Images: Supabase, Unsplash, dll (HTTPS)
              "img-src 'self' data: blob: https:",
              // Media: Musik & video
              "media-src 'self' https: blob:",
              // Connections: Supabase
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              // Frames: YouTube untuk live stream
              "frame-src 'self' https://www.youtube.com https://www.google.com https://calendar.google.com",
              // Block object/embed (flash, dll)
              "object-src 'none'",
              // Base URI restriction
              "base-uri 'self'",
              // Form action
              "form-action 'self'",
              // Upgrade insecure requests
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
      // ====== Headers khusus untuk halaman undangan publik ======
      {
        source: '/u/:code',
        headers: [
          // Cache undangan publik (1 jam)
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      // ====== Headers khusus untuk halaman admin (no cache) ======
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },

  // async rewrites() {
  //   return [
  //     {
  //       source: '/u/:code',
  //       destination: '/undangan/:code',
  //     },
  //   ]
  // }

}

module.exports = nextConfig