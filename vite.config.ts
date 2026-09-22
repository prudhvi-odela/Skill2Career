import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
        'next/navigation': path.resolve(import.meta.dirname, 'src/next/navigation.ts'),
      },
    },
    define: {
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(
        env.VITE_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '44608290041-qp9f0oj463v7o26eghg9lhma3idusjgg.apps.googleusercontent.com'
      ),
      'import.meta.env.VITE_GITHUB_CLIENT_ID': JSON.stringify(
        env.VITE_GITHUB_CLIENT_ID || process.env.VITE_GITHUB_CLIENT_ID || 'Ov23liJogEUw6Q433jVd'
      ),
      'import.meta.env.VITE_LINKEDIN_CLIENT_ID': JSON.stringify(
        env.VITE_LINKEDIN_CLIENT_ID || process.env.VITE_LINKEDIN_CLIENT_ID || '77a6xjsdarbcvj'
      ),
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true,
    },
  }
})
