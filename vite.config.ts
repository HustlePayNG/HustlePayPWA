import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      // Use custom service worker for push notifications
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.ts',
      manifest: {
        name: 'HustlePay — Service Marketplace',
        short_name: 'HustlePay',
        description: 'Vetted artisans and instant wallet payments for on-demand services.',
        theme_color: '#33658A',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['business', 'finance', 'productivity'],
        shortcuts: [
          {
            name: 'Book a Service',
            short_name: 'Book',
            description: 'Find and book a vetted artisan',
            url: '/discover',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'My Bookings',
            short_name: 'Bookings',
            description: 'View your active and past bookings',
            url: '/bookings',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Wallet',
            short_name: 'Wallet',
            description: 'Manage your HustlePay wallet',
            url: '/wallet',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ],
        screenshots: [],
        prefer_related_applications: false
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        globIgnores: ['**/*.mp4', '**/*.webm'],
        maximumFileSizeToCacheInBytes: 3000000,
        runtimeCaching: [
          {
            urlPattern: /\.(?:mp4|webm)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'hustlepay-videos',
              expiration: {
                maxEntries: 2,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              rangeRequests: true
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ]
})