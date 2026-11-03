import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024, // Allow precaching Monaco editor bundles (~6MB)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^http:\/\/localhost:8000\/api\/.*/i,
            handler: 'NetworkOnly', // Local backend API calls bypass cache
          }
        ]
      },
      manifest: {
        name: 'OfflineCoder',
        short_name: 'OfflineCoder',
        description: 'Zero-egress local code generation powered by Gemma models',
        theme_color: '#090d16',
        background_color: '#090d16',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/pwa-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: false,
        ws: true,
      }
    }
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 8000,
  }
});
