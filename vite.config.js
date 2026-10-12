import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'child_process'

let currentGitCommit = '1a9d629'
try {
  currentGitCommit = execSync('git rev-parse --short HEAD').toString().trim()
} catch (e) {}

const buildDate = new Date().toISOString()

export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify('1.3.0'),
    __GIT_COMMIT__: JSON.stringify(currentGitCommit),
    __BUILD_DATE__: JSON.stringify(buildDate)
  },
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.png', 'apple-touch-icon.png', 'version.json'],
      manifest: {
        name: 'English Learning App',
        short_name: 'EnglishApp',
        description: 'Aprende inglés de forma inteligente',
        theme_color: '#28C28C',
        background_color: '#ffffff',
        display: 'standalone',
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
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 5173
  }
})
