import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'lucide-react': path.resolve(__dirname, 'src/clean-icons.tsx'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
})
