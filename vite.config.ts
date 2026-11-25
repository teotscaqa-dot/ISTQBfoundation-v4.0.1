import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  // The question bank is bundled on purpose (~2 MB of text, ~550 KB gzipped).
  build: { chunkSizeWarningLimit: 3000 },
})
