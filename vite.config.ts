import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
            if (id.includes('xlsx')) return 'vendor-excel';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('framer-motion')) return 'vendor-motion';
          }
        }
      }
    }
  }
})

