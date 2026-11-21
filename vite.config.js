import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // The built site is served from /Darb/ on GitHub Pages
  base: command === 'build' ? '/Darb/' : '/',
  plugins: [react(), tailwindcss()],
}))
