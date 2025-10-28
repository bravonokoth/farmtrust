
import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react-swc";
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 8081,
    strictPort: true, // fail if 8081 is taken

    // Proxy /api calls to your backend (optional – keep if you still use it)
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },

    // THIS IS WHAT REMOVES THE X‑Frame‑Options WARNING
    headers: {
      'X-Frame-Options': 'SAMEORIGIN', // or 'DENY'
      // Optional: other security headers
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },

  // Optional: make sure HMR works with Tailwind
  css: {
    devSourcemap: true,
  },
});