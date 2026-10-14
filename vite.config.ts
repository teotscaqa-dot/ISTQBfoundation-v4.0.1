import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  // The question bank is bundled on purpose (~1.3 MB of text, ~380 KB gzipped).
  build: { chunkSizeWarningLimit: 2000 },
})
