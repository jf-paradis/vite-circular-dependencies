import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'ES2020',
    rollupOptions: {
      output: {
        // Fix: Vite is bundling vendor files and its plugins to the main proxy, causing circular dependencies and cascading hash changes.
        // manualChunks(id) {
        //   if (id.startsWith('vite/') || id.startsWith('\0vite/')) {
        //     // Put vite modules and virtual modules (begining with \0) into a vite chunk.
        //     return 'vite';
        //   }
        //   if (id.includes('node_modules/')) {
        //     // Put vite modules and virtual modules (begining with \0) into a vite chunk.
        //     return 'vendor';
        //   }
        // },
      },
    },
  },
  plugins: [vue()]
})
