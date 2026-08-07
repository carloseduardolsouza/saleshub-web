import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['4841-2804-22b0-4012-6c00-d30-41ae-ae36-641e.ngrok-free.app'],
  },
})
