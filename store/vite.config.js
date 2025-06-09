import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    hmr: {
      // Try different HMR settings
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173,
      // If the above doesn't work, try this:
      // protocol: 'ws',
      // host: '127.0.0.1',
      // port: 24678,
      // clientPort: 24678,
    },
  },
})
