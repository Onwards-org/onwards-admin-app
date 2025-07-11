import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [vue()],
  root: 'src/client',
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/client'),
      '@server': resolve(__dirname, 'src/server'),
      '@shared': resolve(__dirname, 'src/shared')
    }
  },
  server: {
    port: parseInt(process.env.FRONTEND_PORT || '8080'),
    host: true,
    strictPort: true,
    // WSL2 specific configuration for file watching
    watch: {
      usePolling: true,
      interval: 1000,
      binaryInterval: 1000,
      ignorePermissionErrors: true
    },
    // Force file system watching in WSL2
    fs: {
      strict: false
    },
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT || 3001}`,
        changeOrigin: true
      },
      '/uploads': {
        target: `http://localhost:${process.env.PORT || 3001}`,
        changeOrigin: true
      }
    }
  }
})