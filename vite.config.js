import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Supabase in separate chunk - critical for lazy loading
          if (id.includes('@supabase') || id.includes('supabase')) {
            return 'supabase';
          }
          // React core - needed immediately
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react';
          }
          // Icons - can load slightly later
          if (id.includes('lucide-react')) {
            return 'icons';
          }
        },
      },
    },
  },
});